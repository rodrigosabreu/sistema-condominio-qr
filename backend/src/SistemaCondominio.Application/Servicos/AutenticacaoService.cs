using Microsoft.EntityFrameworkCore;
using SistemaCondominio.Application.Abstracoes;
using SistemaCondominio.Application.Dtos;

namespace SistemaCondominio.Application.Servicos;

public class AutenticacaoService(IAplicacaoDbContext db, IHashSenha hashSenha, IGeradorToken geradorToken)
{
    public async Task<LoginRespostaDto> LoginAsync(LoginRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var usuario = await db.Usuarios.FirstOrDefaultAsync(u => u.Email == email);
        if (usuario is null || !usuario.Ativo || !hashSenha.Verificar(request.Senha, usuario.SenhaHash))
            throw new NaoAutorizadoException("E-mail ou senha inválidos");

        var (token, expiraEm) = geradorToken.Gerar(usuario);
        return new LoginRespostaDto(token, expiraEm,
            new UsuarioSessaoDto(usuario.Id, usuario.Nome, usuario.Email, usuario.Papel, usuario.CondominioId));
    }
}
