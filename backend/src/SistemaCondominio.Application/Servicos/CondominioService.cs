using Microsoft.EntityFrameworkCore;
using SistemaCondominio.Application.Abstracoes;
using SistemaCondominio.Application.Dtos;
using SistemaCondominio.Domain.Entities;

namespace SistemaCondominio.Application.Servicos;

public class CondominioService(IAplicacaoDbContext db)
{
    public async Task<IReadOnlyList<CondominioDto>> ListarAsync(EscopoUsuario escopo)
    {
        var consulta = db.Condominios.AsQueryable();
        if (!escopo.Geral)
            consulta = consulta.Where(c => c.Id == escopo.CondominioId);

        return await consulta.OrderBy(c => c.Nome)
            .Select(c => new CondominioDto(c.Id, c.Nome, c.Cnpj, c.Endereco, c.Telefone, c.Ativo))
            .ToListAsync();
    }

    public async Task<CondominioDto> CriarAsync(CondominioRequest request, EscopoUsuario escopo)
    {
        escopo.ValidarAdministradorGeral();

        var condominio = new Condominio
        {
            Nome = Validacao.Obrigatorio(request.Nome, "Nome do condomínio", 200),
            Cnpj = Validacao.Cnpj(request.Cnpj),
            Endereco = Validacao.Opcional(request.Endereco, "Endereço", 500),
            Telefone = Validacao.Opcional(request.Telefone, "Telefone", 20),
            Ativo = request.Ativo
        };
        db.Condominios.Add(condominio);
        await db.SalvarAlteracoesAsync();

        return condominio.ParaDto();
    }

    public async Task<CondominioDto> AtualizarAsync(Guid condominioId, CondominioRequest request, EscopoUsuario escopo)
    {
        escopo.ValidarAdministrador();

        var condominio = await db.Condominios.FirstOrDefaultAsync(c => c.Id == condominioId)
            ?? throw new NaoEncontradoException("Condomínio não encontrado");
        escopo.ValidarCondominio(condominio.Id);
        if (!escopo.Geral && request.Ativo != condominio.Ativo)
            throw new AcessoNegadoException("Apenas o Administrador Geral pode ativar ou desativar condomínios");

        condominio.Nome = Validacao.Obrigatorio(request.Nome, "Nome do condomínio", 200);
        condominio.Cnpj = Validacao.Cnpj(request.Cnpj);
        condominio.Endereco = Validacao.Opcional(request.Endereco, "Endereço", 500);
        condominio.Telefone = Validacao.Opcional(request.Telefone, "Telefone", 20);
        condominio.Ativo = request.Ativo;
        await db.SalvarAlteracoesAsync();

        return condominio.ParaDto();
    }
}
