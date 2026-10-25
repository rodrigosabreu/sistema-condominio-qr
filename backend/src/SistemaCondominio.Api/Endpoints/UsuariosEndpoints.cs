using System.Security.Claims;
using SistemaCondominio.Api.Extensions;
using SistemaCondominio.Application.Dtos;
using SistemaCondominio.Application.Servicos;

namespace SistemaCondominio.Api.Endpoints;

public static class UsuariosEndpoints
{
    public static void MapUsuariosEndpoints(this WebApplication app)
    {
        var grupo = app.MapGroup("/api/usuarios").RequireAuthorization().WithTags("Usuarios");

        grupo.MapGet("/", async (ClaimsPrincipal usuario, UsuarioService servico) =>
                Results.Ok(await servico.ListarAsync(usuario.Escopo())))
            .WithName("ListarUsuarios");

        grupo.MapPost("/", async (UsuarioRequest request, ClaimsPrincipal usuario, UsuarioService servico) =>
                Results.Json(await servico.CriarAsync(request, usuario.Escopo()), statusCode: StatusCodes.Status201Created))
            .WithName("CriarUsuario");

        grupo.MapPut("/{usuarioId:guid}", async (Guid usuarioId, UsuarioRequest request, ClaimsPrincipal usuario, UsuarioService servico) =>
                Results.Ok(await servico.AtualizarAsync(usuarioId, request, usuario.Escopo())))
            .WithName("AtualizarUsuario");
    }
}
