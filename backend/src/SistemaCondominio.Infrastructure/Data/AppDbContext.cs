using Microsoft.EntityFrameworkCore;
using SistemaCondominio.Application.Abstracoes;
using SistemaCondominio.Domain.Entities;
using SistemaCondominio.Domain.Enums;

namespace SistemaCondominio.Infrastructure.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options), IAplicacaoDbContext
{
    public DbSet<Condominio> Condominios => Set<Condominio>();
    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Local> Locais => Set<Local>();
    public DbSet<QrCode> QrCodes => Set<QrCode>();
    public DbSet<Servico> Servicos => Set<Servico>();
    public DbSet<RegistroAcesso> RegistrosAcesso => Set<RegistroAcesso>();

    public Task<int> SalvarAlteracoesAsync(CancellationToken cancellationToken = default) => SaveChangesAsync(cancellationToken);

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Condominio>(e =>
        {
            e.ToTable("condominios");
            e.HasKey(x => x.Id);
            e.Property(x => x.Nome).HasMaxLength(200).IsRequired();
            e.Property(x => x.Cnpj).HasMaxLength(14);
            e.Property(x => x.Telefone).HasMaxLength(20);
        });

        modelBuilder.Entity<Usuario>(e =>
        {
            e.ToTable("usuarios");
            e.HasKey(x => x.Id);
            e.Property(x => x.Nome).HasMaxLength(200).IsRequired();
            e.Property(x => x.Email).HasMaxLength(255).IsRequired();
            e.Property(x => x.SenhaHash).HasMaxLength(500).IsRequired();
            e.HasIndex(x => x.Email).IsUnique();
            e.Property(x => x.Papel).HasConversion<string>().HasMaxLength(50);
            e.HasOne(x => x.Condominio).WithMany().HasForeignKey(x => x.CondominioId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Local>(e =>
        {
            e.ToTable("locais");
            e.HasKey(x => x.Id);
            e.Property(x => x.Nome).HasMaxLength(200).IsRequired();
            e.Property(x => x.Tipo).HasConversion<string>().HasMaxLength(50);
            e.HasOne(x => x.Condominio).WithMany().HasForeignKey(x => x.CondominioId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<QrCode>(e =>
        {
            e.ToTable("qr_codes");
            e.HasKey(x => x.Id);
            e.Property(x => x.Visualizacoes).HasDefaultValue(0);
            e.HasOne(x => x.Local).WithOne(x => x.QrCode).HasForeignKey<QrCode>(x => x.LocalId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Condominio).WithMany().HasForeignKey(x => x.CondominioId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Servico>(e =>
        {
            e.ToTable("servicos");
            e.HasKey(x => x.Id);
            e.Property(x => x.Tipo).HasConversion<string>().HasMaxLength(50);
            e.Property(x => x.Status).HasConversion<string>().HasMaxLength(50);
            e.Property(x => x.Responsavel).HasMaxLength(200);
            e.HasIndex(x => new { x.LocalId, x.CriadoEm });
            e.HasOne(x => x.Local).WithMany(x => x.Servicos).HasForeignKey(x => x.LocalId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Usuario).WithMany().HasForeignKey(x => x.UsuarioId).OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<RegistroAcesso>(e =>
        {
            e.ToTable("registros_acesso");
            e.HasKey(x => x.Id);
            e.Property(x => x.Endpoint).HasMaxLength(300).IsRequired();
            e.Property(x => x.Metodo).HasMaxLength(10).IsRequired();
            e.Property(x => x.IpAddress).HasMaxLength(45);
            e.Property(x => x.UserAgent).HasMaxLength(500);
            e.Property(x => x.Anonimo).HasDefaultValue(true);
        });
    }
}
