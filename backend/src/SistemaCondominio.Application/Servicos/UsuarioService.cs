using Microsoft.EntityFrameworkCore;
using SistemaCondominio.Application.Abstracoes;
using SistemaCondominio.Application.Dtos;
using SistemaCondominio.Domain.Entities;
using SistemaCondominio.Domain.Enums;

namespace SistemaCondominio.Application.Servicos;

public class UsuarioService(IAplicacaoDbContext db, IHashSenha hashSenha)
{
    public async Task<IReadOnlyList<UsuarioDto>> ListarAsync(EscopoUsuario escopo)
    {
        escopo.ValidarAdministrador();

        var consulta = db.Usuarios.AsQueryable();
        if (!escopo.Geral)
            consulta = consulta.Where(u => u.CondominioId == escopo.CondominioId);

        var usuarios = await consulta.OrderBy(u => u.Nome).ToListAsync();
        return usuarios.Select(u => u.ParaDto()).ToList();
    }

    public async Task<UsuarioDto> CriarAsync(UsuarioRequest request, EscopoUsuario escopo)
    {
        escopo.ValidarAdministrador();

        var (condominioId, papel) = await ResolverPermissaoAsync(request, escopo, null);
        var email = Validacao.Email(request.Email);
        await ValidarEmailLivreAsync(email, null);
        Validacao.Senha(request.Senha);

        var usuario = new Usuario
        {
            CondominioId = condominioId,
            Nome = Validacao.Obrigatorio(request.Nome, "Nome", 200),
            Email = email,
            Papel = papel,
            Telefone = Validacao.Opcional(request.Telefone, "Telefone", 20),
            Unidade = Validacao.Opcional(request.Unidade, "Unidade", 50),
            Ativo = request.Ativo,
            SenhaHash = hashSenha.Gerar(request.Senha!)
        };
        db.Usuarios.Add(usuario);
        await db.SalvarAlteracoesAsync();

        return usuario.ParaDto();
    }

    public async Task<UsuarioDto> AtualizarAsync(Guid usuarioId, UsuarioRequest request, EscopoUsuario escopo)
    {
        escopo.ValidarAdministrador();

        var usuario = await db.Usuarios.FirstOrDefaultAsync(u => u.Id == usuarioId)
            ?? throw new NaoEncontradoException("Usuário não encontrado");
        if (!escopo.Geral)
        {
            if (usuario.Papel != PapelUsuario.UsuarioComum)
                throw new AcessoNegadoException("Administradores de condomínio só podem editar funcionários");
            escopo.ValidarCondominio(usuario.CondominioId ?? Guid.Empty);
        }

        var (condominioId, papel) = await ResolverPermissaoAsync(request, escopo, usuario.CondominioId);
        var email = Validacao.Email(request.Email);
        await ValidarEmailLivreAsync(email, usuario.Id);

        usuario.CondominioId = condominioId;
        usuario.Papel = papel;
        usuario.Nome = Validacao.Obrigatorio(request.Nome, "Nome", 200);
        usuario.Email = email;
        usuario.Telefone = Validacao.Opcional(request.Telefone, "Telefone", 20);
        usuario.Unidade = Validacao.Opcional(request.Unidade, "Unidade", 50);
        usuario.Ativo = request.Ativo;
        if (!string.IsNullOrEmpty(request.Senha))
        {
            Validacao.Senha(request.Senha);
            usuario.SenhaHash = hashSenha.Gerar(request.Senha);
        }
        await db.SalvarAlteracoesAsync();

        return usuario.ParaDto();
    }

    private async Task<(Guid? CondominioId, PapelUsuario Papel)> ResolverPermissaoAsync(UsuarioRequest request, EscopoUsuario escopo, Guid? condominioAtual)
    {
        if (!escopo.Geral)
        {
            if (request.Papel != PapelUsuario.UsuarioComum)
                throw new AcessoNegadoException("Administradores de condomínio só podem cadastrar ou editar funcionários");
            return (escopo.ResolverCondominio(request.CondominioId), request.Papel);
        }

        if (request.Papel == PapelUsuario.AdministradorGeral)
            return (null, request.Papel);

        var condominioId = request.CondominioId ?? condominioAtual ?? throw new ValidacaoException("Informe o condomínio do usuário");
        if (!await db.Condominios.AnyAsync(c => c.Id == condominioId))
            throw new NaoEncontradoException("Condomínio não encontrado");
        return (condominioId, request.Papel);
    }

    private async Task ValidarEmailLivreAsync(string email, Guid? usuarioId)
    {
        if (await db.Usuarios.AnyAsync(u => u.Email == email && u.Id != usuarioId))
            throw new ValidacaoException("Já existe um usuário com este e-mail");
    }
}
