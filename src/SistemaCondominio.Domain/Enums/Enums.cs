namespace SistemaCondominio.Domain.Enums;

public enum TipoLocal
{
    Banheiro,
    Salao,
    Churrasqueira,
    Lazer,
    Jardim,
    Horta,
    Garagem,
    Outro
}

public enum TipoServico
{
    Limpeza,
    Manutencao,
    Interdicao,
    Preventiva,
    Jardinagem,
    Horta
}

public enum StatusServico
{
    Agendado,
    EmAndamento,
    Concluido,
    Interrompido
}

public enum PapelUsuario
{
    AdministradorGeral,
    AdministradorCondominio,
    UsuarioComum
}
