using Microsoft.EntityFrameworkCore;
using SistemaCondominio.Domain.Entities;

namespace SistemaCondominio.Application.Abstracoes;

public interface IAplicacaoDbContext
{
    DbSet<Condominio> Condominios { get; }
    DbSet<Usuario> Usuarios { get; }
    DbSet<Local> Locais { get; }
    DbSet<QrCode> QrCodes { get; }
    DbSet<Servico> Servicos { get; }
    DbSet<RegistroAcesso> RegistrosAcesso { get; }
    Task<int> SalvarAlteracoesAsync(CancellationToken cancellationToken = default);
}

public interface IHashSenha
{
    string Gerar(string senha);
    bool Verificar(string senha, string hash);
}

public interface IGeradorToken
{
    (string Token, DateTime ExpiraEm) Gerar(Usuario usuario);
}
