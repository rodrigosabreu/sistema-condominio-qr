using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using SistemaCondominio.Application.Abstracoes;
using SistemaCondominio.Domain.Entities;
using SistemaCondominio.Domain.Enums;

namespace SistemaCondominio.Auth;

public record OpcoesJwt(string Segredo, string Emissor, string Audiencia, int ExpiracaoEmMinutos);

public class GeradorTokenJwt(OpcoesJwt opcoes) : IGeradorToken
{
    public (string Token, DateTime ExpiraEm) Gerar(Usuario usuario)
    {
        var expiraEm = DateTime.UtcNow.AddMinutes(opcoes.ExpiracaoEmMinutos);
        var claims = new List<Claim>
        {
            new("usuarioId", usuario.Id.ToString()),
            new("papel", usuario.Papel.ToString()),
            new("geral", (usuario.Papel == PapelUsuario.AdministradorGeral).ToString().ToLowerInvariant())
        };
        if (usuario.CondominioId is { } condominioId)
            claims.Add(new Claim("condominoId", condominioId.ToString()));

        var chave = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(opcoes.Segredo));
        var token = new JwtSecurityToken(opcoes.Emissor, opcoes.Audiencia, claims, expires: expiraEm,
            signingCredentials: new SigningCredentials(chave, SecurityAlgorithms.HmacSha256));

        return (new JwtSecurityTokenHandler().WriteToken(token), expiraEm);
    }
}

public static class ConfiguracaoAutenticacao
{
    public static IServiceCollection AdicionarAutenticacaoJwt(this IServiceCollection services, OpcoesJwt opcoes)
    {
        services.AddSingleton(opcoes);
        services.AddScoped<IGeradorToken, GeradorTokenJwt>();
        services.AddScoped<IHashSenha, HashSenhaPbkdf2>();

        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(o =>
            o.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = opcoes.Emissor,
                ValidateAudience = true,
                ValidAudience = opcoes.Audiencia,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(opcoes.Segredo))
            });
        services.AddAuthorization();

        return services;
    }
}
