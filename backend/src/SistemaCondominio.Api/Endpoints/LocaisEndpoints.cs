using System.Security.Claims;
using SistemaCondominio.Api.Extensions;
using SistemaCondominio.Application.Dtos;
using SistemaCondominio.Application.Servicos;

namespace SistemaCondominio.Api.Endpoints;

public static class LocaisEndpoints
{
    public static void MapLocaisEndpoints(this WebApplication app)
    {
        var grupo = app.MapGroup("/api/locais").RequireAuthorization().WithTags("Locais");

        grupo.MapGet("/", async (ClaimsPrincipal usuario, LocalService servico, bool incluirInativos = false) =>
                Results.Ok(await servico.ListarAsync(usuario.Escopo(), incluirInativos)))
            .WithName("ListarLocais");

        grupo.MapGet("/{localId:guid}", async (Guid localId, ClaimsPrincipal usuario, LocalService servico) =>
                Results.Ok(await servico.ObterAsync(localId, usuario.Escopo())))
            .WithName("ObterLocal");

        grupo.MapPost("/", async (LocalRequest request, ClaimsPrincipal usuario, LocalService servico) =>
                Results.Json(await servico.CriarAsync(request, usuario.Escopo()), statusCode: StatusCodes.Status201Created))
            .WithName("CriarLocal");

        grupo.MapPut("/{localId:guid}", async (Guid localId, LocalRequest request, ClaimsPrincipal usuario, LocalService servico) =>
                Results.Ok(await servico.AtualizarAsync(localId, request, usuario.Escopo())))
            .WithName("AtualizarLocal");

        grupo.MapGet("/{localId:guid}/qrcode", async (Guid localId, ClaimsPrincipal usuario, LocalService servico, IConfiguration config) =>
                Results.File(await servico.GerarQrCodePngAsync(localId, usuario.Escopo(),
                    config["QrCode:UrlBase"] ?? "http://localhost:5234/api/qrcode"), "image/png"))
            .WithName("GerarQrCodeLocal");
    }
}
