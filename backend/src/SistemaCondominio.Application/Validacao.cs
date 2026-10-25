using System.Text.RegularExpressions;

namespace SistemaCondominio.Application;

public static class Validacao
{
    public static string Obrigatorio(string? valor, string campo, int maximo)
    {
        var texto = valor?.Trim();
        if (string.IsNullOrEmpty(texto))
            throw new ValidacaoException($"{campo} é obrigatório");
        if (texto.Length > maximo)
            throw new ValidacaoException($"{campo} deve ter no máximo {maximo} caracteres");
        return texto;
    }

    public static string? Opcional(string? valor, string campo, int maximo)
    {
        var texto = valor?.Trim();
        if (string.IsNullOrEmpty(texto))
            return null;
        if (texto.Length > maximo)
            throw new ValidacaoException($"{campo} deve ter no máximo {maximo} caracteres");
        return texto;
    }

    public static string? Cnpj(string? valor)
    {
        var digitos = new string((valor ?? string.Empty).Where(char.IsDigit).ToArray());
        if (digitos.Length == 0)
            return null;
        if (digitos.Length != 14)
            throw new ValidacaoException("CNPJ deve conter 14 dígitos");
        return digitos;
    }

    public static string Email(string? valor)
    {
        var email = Obrigatorio(valor, "E-mail", 255).ToLowerInvariant();
        if (!Regex.IsMatch(email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
            throw new ValidacaoException("E-mail inválido");
        return email;
    }

    public static void Senha(string? senha)
    {
        if (string.IsNullOrEmpty(senha) || senha.Length < 8)
            throw new ValidacaoException("A senha deve ter no mínimo 8 caracteres");
    }
}
