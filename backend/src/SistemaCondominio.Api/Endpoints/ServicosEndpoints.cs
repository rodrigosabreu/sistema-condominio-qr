using System.Security.Claims;
using SistemaCondominio.Api.Extensions;
using SistemaCondominio.Application.Dtos;
using SistemaCondominio.Application.Servicos;

namespace SistemaCondominio.Api.Endpoints;

public static class ServicosEndpoints
{
    public static void MapServicosEndpoints(this WebApplication app)
    {
        var grupo = app.MapGroup("/api/servicos").RequireAuthorization().WithTags("Servicos");

        grupo.MapGet("/por-local/{localId:guid}", async (Guid localId, ClaimsPrincipal usuario, ServicoService servico, int pagina = 1, int tamanho = 20) =>
                Results.Ok(await servico.ListarPorLocalAsync(localId, pagina, tamanho, usuario.Escopo())))
            .WithName("ListarServicosPorLocal");

        grupo.MapPost("/", async (RegistrarServicoRequest request, ClaimsPrincipal usuario, ServicoService servico) =>
                Results.Json(await servico.RegistrarAsync(request, usuario.Escopo()), statusCode: StatusCodes.Status201Created))
            .WithName("RegistrarServico");

        grupo.MapPut("/{servicoId:guid}", async (Guid servicoId, AtualizarServicoRequest request, ClaimsPrincipal usuario, ServicoService servico) =>
                Results.Ok(await servico.AtualizarAsync(servicoId, request, usuario.Escopo())))
            .WithName("AtualizarServico");

        grupo.MapPatch("/{servicoId:guid}/concluir", async (Guid servicoId, ConcluirServicoRequest request, ClaimsPrincipal usuario, ServicoService servico) =>
                Results.Ok(await servico.ConcluirAsync(servicoId, request.Observacoes, usuario.Escopo())))
            .WithName("ConcluirServico");
    }
}
