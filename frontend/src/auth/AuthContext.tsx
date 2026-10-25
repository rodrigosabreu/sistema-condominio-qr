import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { aoExpirar, api, limparSessao, lerSessao, salvarSessao, type Sessao } from '../api/cliente';
import type { LoginResposta } from '../api/tipos';

interface AuthValor {
  sessao: Sessao | null;
  entrar: (email: string, senha: string) => Promise<void>;
  sair: () => void;
}

const AuthContext = createContext<AuthValor | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessao, setSessao] = useState<Sessao | null>(() => lerSessao());

  const sair = useCallback(() => {
    limparSessao();
    setSessao(null);
  }, []);

  const entrar = useCallback(async (email: string, senha: string) => {
    const resposta = await api<LoginResposta>('/auth/login', { metodo: 'POST', corpo: { email, senha }, publico: true });
    setSessao(salvarSessao(resposta));
  }, []);

  useEffect(() => aoExpirar(() => setSessao(null)), []);

  const valor = useMemo(() => ({ sessao, entrar, sair }), [sessao, entrar, sair]);
  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return contexto;
}
