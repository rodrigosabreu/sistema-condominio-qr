using Microsoft.AspNetCore.Diagnostics;
using SistemaCondominio.Application;

namespace SistemaCondominio.Api.Infra;

public class TratamentoExcecoes(ILogger<TratamentoExcecoes> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext contexto, Exception excecao, CancellationToken cancellationToken)
    {
        var (status, erro) = excecao switch
        {
            NaoEncontradoException => (StatusCodes.Status404NotFound, "Não encontrado"),
            ValidacaoException or BadHttpRequestException => (StatusCodes.Status400BadRequest, "Dados inválidos"),
            NaoAutorizadoException => (StatusCodes.Status401Unauthorized, "Não autorizado"),
            AcessoNegadoException => (StatusCodes.Status403Forbidden, "Acesso negado"),
            _ => (StatusCodes.Status500InternalServerError, "Erro interno do servidor")
        };

        if (status == StatusCodes.Status500InternalServerError)
            logger.LogError(excecao, "Erro não tratado");

        contexto.Response.StatusCode = status;
        await contexto.Response.WriteAsJsonAsync(
            new { erro, mensagem = status == StatusCodes.Status500InternalServerError ? erro : excecao.Message },
            cancellationToken);
        return true;
    }
}
