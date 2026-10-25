using Microsoft.EntityFrameworkCore;
using SistemaCondominio.Application.Abstracoes;
using SistemaCondominio.Domain.Entities;
using SistemaCondominio.Domain.Enums;
using SistemaCondominio.Infrastructure.Data;

namespace SistemaCondominio.Api.Dados;

public static class DadosDesenvolvimento
{
    public static async Task InicializarAsync(IServiceProvider servicos)
    {
        using var escopo = servicos.CreateScope();
        var provedor = escopo.ServiceProvider;
        var db = provedor.GetRequiredService<AppDbContext>();
        await db.Database.MigrateAsync();

        if (await db.Condominios.AnyAsync())
            return;

        var config = provedor.GetRequiredService<IConfiguration>();
        var hash = provedor.GetRequiredService<IHashSenha>().Gerar(
            config["Seed:SenhaPadrao"] ?? throw new InvalidOperationException("Seed:SenhaPadrao não configurado"));

        var flores = new Condominio { Nome = "Condomínio Residencial Flores", Cnpj = "12345678000190", Endereco = "Rua das Flores, 100", Telefone = "1140001000" };
        var aurora = new Condominio { Nome = "Condomínio Residencial Aurora", Cnpj = "98765432000110", Endereco = "Av. da Aurora, 500", Telefone = "1140002000" };
        db.Condominios.AddRange(flores, aurora);

        var zelador = new Usuario { Nome = "Zelador Flores", Email = "zelador@flores.com.br", CondominioId = flores.Id, Papel = PapelUsuario.UsuarioComum, SenhaHash = hash };
        db.Usuarios.AddRange(
            new Usuario { Nome = "Administrador Geral", Email = "admin.geral@sistema.com", Papel = PapelUsuario.AdministradorGeral, SenhaHash = hash },
            new Usuario { Nome = "Síndico Flores", Email = "sindico@flores.com.br", CondominioId = flores.Id, Papel = PapelUsuario.AdministradorCondominio, SenhaHash = hash },
            zelador,
            new Usuario { Nome = "Síndico Aurora", Email = "sindico@aurora.com.br", CondominioId = aurora.Id, Papel = PapelUsuario.AdministradorCondominio, SenhaHash = hash });

        var banheiro = new Local { Nome = "Banheiro Masculino - 1º Andar", Tipo = TipoLocal.Banheiro, Andar = 1, CondominioId = flores.Id, QrCode = new QrCode { CondominioId = flores.Id } };
        var salao = new Local { Nome = "Salão de Festas", Tipo = TipoLocal.Salao, Andar = 0, CondominioId = flores.Id, QrCode = new QrCode { CondominioId = flores.Id } };
        var churrasqueira = new Local { Nome = "Churrasqueira", Tipo = TipoLocal.Churrasqueira, Andar = 0, CondominioId = flores.Id, QrCode = new QrCode { CondominioId = flores.Id } };
        var jardim = new Local { Nome = "Jardim Principal", Tipo = TipoLocal.Jardim, Andar = 0, CondominioId = flores.Id, QrCode = new QrCode { CondominioId = flores.Id } };
        var piscina = new Local { Nome = "Área da Piscina", Tipo = TipoLocal.Lazer, Andar = 0, CondominioId = aurora.Id, QrCode = new QrCode { CondominioId = aurora.Id } };
        db.Locais.AddRange(banheiro, salao, churrasqueira, jardim, piscina);

        db.Servicos.Add(new Servico
        {
            Local = banheiro,
            Usuario = zelador,
            Tipo = TipoServico.Limpeza,
            Status = StatusServico.Concluido,
            Descricao = "Limpeza completa de pisos e sanitários",
            Responsavel = "Zelador Flores",
            AgendadoEm = DateTime.UtcNow.AddHours(-3),
            ConcluidoEm = DateTime.UtcNow.AddHours(-2)
        });

        await db.SaveChangesAsync();

        var logger = provedor.GetRequiredService<ILoggerFactory>().CreateLogger("DadosDesenvolvimento");
        foreach (var local in new[] { banheiro, salao, churrasqueira, jardim, piscina })
            logger.LogInformation("QR Code de {Local}: {QrCodeId}", local.Nome, local.QrCode!.Id);
    }
}
