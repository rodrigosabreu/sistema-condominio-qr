using SistemaCondominio.Application.Servicos;

namespace SistemaCondominio.Api.Endpoints;

public static class QrCodeEndpoints
{
    public static void MapQrCodeEndpoints(this WebApplication app)
    {
        app.MapGet("/api/qrcode/{qrCodeId:guid}", async (Guid qrCodeId, QrCodeService servico, HttpContext http) =>
                Results.Ok(await servico.ObterPublicoAsync(qrCodeId, http.Connection.RemoteIpAddress?.ToString(),
                    http.Request.Headers.UserAgent.ToString(), http.Request.Path)))
            .AllowAnonymous()
            .WithName("ObterQrCodePublico")
            .WithTags("QrCode");
    }
}
