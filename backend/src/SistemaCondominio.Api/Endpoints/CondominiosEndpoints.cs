using System.Security.Claims;
using SistemaCondominio.Api.Extensions;
using SistemaCondominio.Application.Dtos;
using SistemaCondominio.Application.Servicos;

namespace SistemaCondominio.Api.Endpoints;

public static class CondominiosEndpoints
{
    public static void MapCondominiosEndpoints(this WebApplication app)
    {
        var grupo = app.MapGroup("/api/condominios").RequireAuthorization().WithTags("Condominios");

        grupo.MapGet("/", async (ClaimsPrincipal usuario, CondominioService servico) =>
                Results.Ok(await servico.ListarAsync(usuario.Escopo())))
            .WithName("ListarCondominios");

        grupo.MapPost("/", async (CondominioRequest request, ClaimsPrincipal usuario, CondominioService servico) =>
                Results.Json(await servico.CriarAsync(request, usuario.Escopo()), statusCode: StatusCodes.Status201Created))
            .WithName("CriarCondominio");

        grupo.MapPut("/{condominioId:guid}", async (Guid condominioId, CondominioRequest request, ClaimsPrincipal usuario, CondominioService servico) =>
                Results.Ok(await servico.AtualizarAsync(condominioId, request, usuario.Escopo())))
            .WithName("AtualizarCondominio");
    }
}
