using SistemaCondominio.Domain.Enums;

namespace SistemaCondominio.Domain.Entities;

public class Condominio
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Nome { get; set; } = string.Empty;
    public string? Cnpj { get; set; }
    public string? Endereco { get; set; }
    public string? Telefone { get; set; }
    public bool Ativo { get; set; } = true;
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
}

public class Usuario
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? CondominioId { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string SenhaHash { get; set; } = string.Empty;
    public string? Telefone { get; set; }
    public string? Unidade { get; set; }
    public PapelUsuario Papel { get; set; }
    public bool Ativo { get; set; } = true;
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;

    public Condominio? Condominio { get; set; }
}

public class Local
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CondominioId { get; set; }
    public string Nome { get; set; } = string.Empty;
    public TipoLocal Tipo { get; set; }
    public int? Andar { get; set; }
    public bool Ativo { get; set; } = true;

    public Condominio? Condominio { get; set; }
    public QrCode? QrCode { get; set; }
    public ICollection<Servico> Servicos { get; set; } = new List<Servico>();
}

public class QrCode
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid LocalId { get; set; }
    public Guid CondominioId { get; set; }
    public int Visualizacoes { get; set; }
    public bool Ativo { get; set; } = true;
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;

    public Local? Local { get; set; }
    public Condominio? Condominio { get; set; }
}

public class Servico
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid LocalId { get; set; }
    public Guid? UsuarioId { get; set; }
    public TipoServico Tipo { get; set; }
    public string? Descricao { get; set; }
    public StatusServico Status { get; set; } = StatusServico.Agendado;
    public DateTime? AgendadoEm { get; set; }
    public DateTime? ConcluidoEm { get; set; }
    public string? Responsavel { get; set; }
    public string? Observacoes { get; set; }
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;

    public Local? Local { get; set; }
    public Usuario? Usuario { get; set; }
}

public class RegistroAcesso
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? UsuarioId { get; set; }
    public Guid? QrCodeId { get; set; }
    public Guid? CondominioId { get; set; }
    public string Endpoint { get; set; } = string.Empty;
    public string Metodo { get; set; } = string.Empty;
    public int CodigoResposta { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public bool Anonimo { get; set; } = true;
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
}
