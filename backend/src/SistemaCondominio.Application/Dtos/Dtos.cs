using SistemaCondominio.Domain.Enums;

namespace SistemaCondominio.Application.Dtos;

public record LocalPublicoDto(Guid Id, string Nome, TipoLocal Tipo, Guid QrCodeId, Guid CondominioId, string? CondominioNome, int Visualizacoes);

public record ServicoDto(Guid Id, Guid LocalId, Guid? UsuarioId, TipoServico Tipo, string? Descricao, StatusServico Status, DateTime? AgendadoEm, DateTime? ConcluidoEm, string? Responsavel, string? Observacoes);

public record QrCodeRespostaDto(LocalPublicoDto Local, IReadOnlyList<ServicoDto> Servicos);

public record LocalResumoDto(Guid Id, Guid CondominioId, string Nome, TipoLocal Tipo, int? Andar, bool Ativo, Guid? QrCodeId);

public record LocalDetalheDto(Guid Id, Guid CondominioId, string Nome, TipoLocal Tipo, int? Andar, bool Ativo, Guid? QrCodeId);

public record ResumoUltimoServicoDto(TipoServico Tipo, DateTime? ConcluidoEm, string? Responsavel);

public record ProximoServicoDto(TipoServico Tipo, DateTime? AgendadoEm);

public record StatusAtualDto(ResumoUltimoServicoDto? UltimoServico, ServicoDto? InterrupcaoAtual, ProximoServicoDto? ProximoAgendado);

public record PaginacaoDto(int Atual, int Tamanho, int TotalRegistros, int TotalPaginas);

public record ServicosPorLocalDto(LocalResumoDto Local, StatusAtualDto StatusAtual, IReadOnlyList<ServicoDto> Servicos, PaginacaoDto Pagina);

public record RegistrarServicoRequest(Guid LocalId, TipoServico Tipo, string? Descricao, string? Responsavel, string? Observacoes, DateTime? AgendadoEm);

public record AtualizarServicoRequest(TipoServico Tipo, string? Descricao, string? Responsavel, string? Observacoes, DateTime? AgendadoEm);

public record ConcluirServicoRequest(string? Observacoes);

public record LoginRequest(string Email, string Senha);

public record UsuarioSessaoDto(Guid Id, string Nome, string Email, PapelUsuario Papel, Guid? CondominioId);

public record LoginRespostaDto(string Token, DateTime ExpiraEm, UsuarioSessaoDto Usuario);

public record CondominioRequest(string Nome, string? Cnpj, string? Endereco, string? Telefone, bool Ativo = true);

public record CondominioDto(Guid Id, string Nome, string? Cnpj, string? Endereco, string? Telefone, bool Ativo);

public record LocalRequest(Guid? CondominioId, string Nome, TipoLocal Tipo, int? Andar, bool Ativo = true);

public record UsuarioRequest(Guid? CondominioId, string Nome, string Email, string? Senha, PapelUsuario Papel, string? Telefone, string? Unidade, bool Ativo = true);

public record UsuarioDto(Guid Id, Guid? CondominioId, string Nome, string Email, PapelUsuario Papel, string? Telefone, string? Unidade, bool Ativo);

public record EscopoUsuario(Guid UsuarioId, Guid? CondominioId, PapelUsuario Papel)
{
    public bool Geral => Papel == PapelUsuario.AdministradorGeral;

    public bool EhAdministrador => Papel != PapelUsuario.UsuarioComum;

    public void ValidarAdministrador()
    {
        if (!EhAdministrador)
            throw new AcessoNegadoException("Apenas administradores podem realizar esta operação");
    }

    public void ValidarAdministradorGeral()
    {
        if (!Geral)
            throw new AcessoNegadoException("Apenas o Administrador Geral pode realizar esta operação");
    }

    public void ValidarCondominio(Guid condominioId)
    {
        if (!Geral && CondominioId != condominioId)
            throw new AcessoNegadoException("Este recurso não pertence ao seu condomínio");
    }

    public Guid ResolverCondominio(Guid? condominioSolicitado)
    {
        if (Geral)
            return condominioSolicitado ?? throw new ValidacaoException("Informe o condomínio");
        if (condominioSolicitado is { } solicitado && solicitado != CondominioId)
            throw new AcessoNegadoException("Este recurso não pertence ao seu condomínio");
        return CondominioId!.Value;
    }
}
