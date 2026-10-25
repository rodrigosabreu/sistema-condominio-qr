using System.Security.Claims;
using SistemaCondominio.Application.Dtos;
using SistemaCondominio.Domain.Enums;

namespace SistemaCondominio.Api.Extensions;

public static class ClaimsExtensions
{
    public static EscopoUsuario Escopo(this ClaimsPrincipal usuario)
    {
        var condominioId = usuario.FindFirst("condominoId")?.Value;
        return new EscopoUsuario(
            Guid.Parse(usuario.FindFirst("usuarioId")!.Value),
            condominioId is null ? null : Guid.Parse(condominioId),
            Enum.Parse<PapelUsuario>(usuario.FindFirst("papel")!.Value));
    }
}
