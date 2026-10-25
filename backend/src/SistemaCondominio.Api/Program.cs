using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using Microsoft.EntityFrameworkCore;
using SistemaCondominio.Api.Dados;
using SistemaCondominio.Api.Endpoints;
using SistemaCondominio.Api.Infra;
using SistemaCondominio.Application.Abstracoes;
using SistemaCondominio.Application.Servicos;
using SistemaCondominio.Auth;
using SistemaCondominio.Infrastructure.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddScoped<IAplicacaoDbContext>(sp => sp.GetRequiredService<AppDbContext>());
builder.Services.AddScoped<QrCodeService>();
builder.Services.AddScoped<LocalService>();
builder.Services.AddScoped<ServicoService>();
builder.Services.AddScoped<AutenticacaoService>();
builder.Services.AddScoped<CondominioService>();
builder.Services.AddScoped<UsuarioService>();

var jwt = builder.Configuration.GetSection("JwtSettings");
var segredo = jwt["Secret"] ?? throw new InvalidOperationException("JwtSettings:Secret não configurado");
if (segredo.Length < 32)
    throw new InvalidOperationException("JwtSettings:Secret deve ter no mínimo 32 caracteres");
builder.Services.AdicionarAutenticacaoJwt(new OpcoesJwt(segredo, jwt["Issuer"]!, jwt["Audience"]!, int.Parse(jwt["ExpirationInMinutes"] ?? "480")));

var limite = builder.Configuration.GetSection("RateLimiting");
builder.Services.AddRateLimiter(opcoes =>
{
    opcoes.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    opcoes.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(contexto =>
        RateLimitPartition.GetFixedWindowLimiter(
            contexto.User.FindFirst("usuarioId")?.Value ?? contexto.Connection.RemoteIpAddress?.ToString() ?? "desconhecido",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = int.Parse(limite["PermitLimit"] ?? "100"),
                Window = TimeSpan.FromSeconds(int.Parse(limite["WindowInSeconds"] ?? "60")),
                QueueLimit = 0
            }));
    opcoes.OnRejected = (contexto, cancellationToken) =>
        new ValueTask(contexto.HttpContext.Response.WriteAsJsonAsync(new { erro = "Limite de consultas excedido" }, cancellationToken));
});

builder.Services.ConfigureHttpJsonOptions(opcoes =>
    opcoes.SerializerOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase)));
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<TratamentoExcecoes>();

var app = builder.Build();

app.UseExceptionHandler();
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    await DadosDesenvolvimento.InicializarAsync(app.Services);
}
else
{
    app.UseHttpsRedirection();
}

app.UseAuthentication();
app.UseRateLimiter();
app.UseAuthorization();

app.MapQrCodeEndpoints();
app.MapAutenticacaoEndpoints();
app.MapLocaisEndpoints();
app.MapCondominiosEndpoints();
app.MapUsuariosEndpoints();
app.MapServicosEndpoints();

app.Run();
