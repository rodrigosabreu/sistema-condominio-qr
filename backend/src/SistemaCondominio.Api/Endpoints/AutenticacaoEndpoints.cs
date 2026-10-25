using SistemaCondominio.Application.Dtos;
using SistemaCondominio.Application.Servicos;

namespace SistemaCondominio.Api.Endpoints;

public static class AutenticacaoEndpoints
{
    public static void MapAutenticacaoEndpoints(this WebApplication app)
    {
        app.MapPost("/api/auth/login", async (LoginRequest request, AutenticacaoService servico) =>
                Results.Ok(await servico.LoginAsync(request)))
            .AllowAnonymous()
            .WithName("Login")
            .WithTags("Autenticacao");
    }
}
