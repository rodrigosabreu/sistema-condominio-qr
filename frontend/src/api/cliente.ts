import type { Erro, LoginResposta, UsuarioSessao } from './tipos';

const CHAVE_SESSAO = 'condominio.sessao';

export interface Sessao {
  token: string;
  expiraEm: string;
  usuario: UsuarioSessao;
}

export function lerSessao(): Sessao | null {
  const bruto = localStorage.getItem(CHAVE_SESSAO);
  if (!bruto) return null;
  try {
    const sessao = JSON.parse(bruto) as Sessao;
    if (new Date(sessao.expiraEm).getTime() <= Date.now()) {
      localStorage.removeItem(CHAVE_SESSAO);
      return null;
    }
    return sessao;
  } catch {
    localStorage.removeItem(CHAVE_SESSAO);
    return null;
  }
}

export function salvarSessao(resposta: LoginResposta): Sessao {
  const sessao: Sessao = { token: resposta.token, expiraEm: resposta.expiraEm, usuario: resposta.usuario };
  localStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao));
  return sessao;
}

export function limparSessao() {
  localStorage.removeItem(CHAVE_SESSAO);
}

export class ErroApi extends Error {
  constructor(public status: number, mensagem: string) {
    super(mensagem);
  }
}

let aoExpirarSessao: (() => void) | null = null;
export function aoExpirar(fn: () => void) {
  aoExpirarSessao = fn;
}

interface Opcoes {
  metodo?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  corpo?: unknown;
  publico?: boolean;
}

async function requisitar(caminho: string, opcoes: Opcoes): Promise<Response> {
  const sessao = lerSessao();
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (opcoes.corpo !== undefined) headers['Content-Type'] = 'application/json';
  if (sessao && !opcoes.publico) headers.Authorization = `Bearer ${sessao.token}`;

  const resposta = await fetch(`/api${caminho}`, {
    method: opcoes.metodo ?? 'GET',
    headers,
    body: opcoes.corpo !== undefined ? JSON.stringify(opcoes.corpo) : undefined,
  });

  if (resposta.status === 401 && sessao && !opcoes.publico) {
    limparSessao();
    aoExpirarSessao?.();
  }
  if (!resposta.ok) {
    let mensagem = 'Não foi possível concluir a operação';
    try {
      const corpo = (await resposta.json()) as Erro;
      mensagem = corpo.mensagem ?? corpo.erro ?? mensagem;
    } catch {
      /* resposta sem corpo JSON */
    }
    throw new ErroApi(resposta.status, mensagem);
  }
  return resposta;
}

export async function api<T>(caminho: string, opcoes: Opcoes = {}): Promise<T> {
  const resposta = await requisitar(caminho, opcoes);
  return (await resposta.json()) as T;
}

export async function baixarImagem(caminho: string): Promise<Blob> {
  const resposta = await requisitar(caminho, {});
  return resposta.blob();
}
