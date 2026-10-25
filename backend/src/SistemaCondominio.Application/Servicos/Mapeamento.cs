using SistemaCondominio.Application.Dtos;
using SistemaCondominio.Domain.Entities;

namespace SistemaCondominio.Application.Servicos;

internal static class Mapeamento
{
    public static ServicoDto ParaDto(this Servico s) =>
        new(s.Id, s.LocalId, s.UsuarioId, s.Tipo, s.Descricao, s.Status, s.AgendadoEm, s.ConcluidoEm, s.Responsavel, s.Observacoes);

    public static LocalDetalheDto ParaDetalhe(this Local l) =>
        new(l.Id, l.CondominioId, l.Nome, l.Tipo, l.Andar, l.Ativo, l.QrCode?.Id);

    public static CondominioDto ParaDto(this Condominio c) =>
        new(c.Id, c.Nome, c.Cnpj, c.Endereco, c.Telefone, c.Ativo);

    public static UsuarioDto ParaDto(this Usuario u) =>
        new(u.Id, u.CondominioId, u.Nome, u.Email, u.Papel, u.Telefone, u.Unidade, u.Ativo);

    public static string? Truncar(this string? valor, int maximo) =>
        valor is null ? null : valor[..Math.Min(valor.Length, maximo)];
}
