import type { Local, Servico, UsuarioSessao, Usuario } from '../api/tipos';

// Espelha as regras do AGENTS.md ("Regras de Cadastro e Edição").
// A interface só esconde ações; quem decide é sempre o backend.

export const ehGeral = (u: UsuarioSessao) => u.papel === 'administradorGeral';

export const ehAdministrador = (u: UsuarioSessao) => u.papel !== 'usuarioComum';

export const podeCadastrarCondominio = (u: UsuarioSessao) => ehGeral(u);

export const podeEditarCondominio = (u: UsuarioSessao, condominioId: string) =>
  ehGeral(u) || (ehAdministrador(u) && u.condominioId === condominioId);

export const podeGerenciarLocal = (u: UsuarioSessao, local: Local) =>
  ehGeral(u) || (ehAdministrador(u) && u.condominioId === local.condominioId);

export const podeGerenciarUsuario = (u: UsuarioSessao, alvo: Usuario) =>
  ehGeral(u) || (ehAdministrador(u) && alvo.papel === 'usuarioComum' && alvo.condominioId === u.condominioId);

export const podeEditarServico = (u: UsuarioSessao, servico: Servico) =>
  ehAdministrador(u) || servico.usuarioId === u.id;
