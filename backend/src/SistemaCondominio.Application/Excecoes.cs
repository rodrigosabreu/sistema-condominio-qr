namespace SistemaCondominio.Application;

public class NaoEncontradoException(string mensagem) : Exception(mensagem);

public class AcessoNegadoException(string mensagem) : Exception(mensagem);

public class ValidacaoException(string mensagem) : Exception(mensagem);

public class NaoAutorizadoException(string mensagem) : Exception(mensagem);
