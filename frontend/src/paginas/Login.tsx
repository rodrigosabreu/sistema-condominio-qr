import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ErroApi } from '../api/cliente';
import { useAuth } from '../auth/AuthContext';
import { Icone } from '../componentes/Layout';
import { Botao, Campo, Input } from '../componentes/ui';

const contasDemo = [
  { rotulo: 'Administrador Geral', email: 'admin.geral@sistema.com' },
  { rotulo: 'Síndico Flores', email: 'sindico@flores.com.br' },
  { rotulo: 'Zelador Flores', email: 'zelador@flores.com.br' },
];

export function Login() {
  const { sessao, entrar } = useAuth();
  const navegar = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  if (sessao) return <Navigate to="/" replace />;

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      await entrar(email.trim(), senha);
      navegar('/', { replace: true });
    } catch (err) {
      setErro(err instanceof ErroApi && err.status === 401 ? 'E-mail ou senha inválidos' : 'Não foi possível entrar. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="relative grid min-h-screen place-items-center bg-slate-50 px-4 py-10">
      <div className="relative z-10 grid w-full max-w-5xl items-center gap-10 lg:grid-cols-2">
        <section className="pagina-entrada space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-semibold tracking-widest text-emerald-700">
            <span className="pulso h-2 w-2 rounded-full bg-emerald-500" /> SISTEMA ONLINE
          </div>
          <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl">
            Cada local do condomínio <span className="texto-gradiente">conectado por QR Code</span>
          </h1>
          <p className="mx-auto max-w-md text-base text-slate-500 lg:mx-0">
            Serviços, manutenções e histórico visíveis em um toque para moradores. Gestão completa para a administração.
          </p>
          <div className="flex flex-wrap justify-center gap-2 lg:justify-start">
            {['Histórico em tempo real', 'Isolamento por condomínio', 'Auditoria de acessos'].map((t) => (
              <span key={t} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
                {t}
              </span>
            ))}
          </div>
        </section>

        <section className="pagina-entrada rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" style={{ animationDelay: '0.1s' }}>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Entrar</h2>
            <p className="text-sm text-slate-500">Acesso para administradores e funcionários.</p>
          </div>

          <form onSubmit={enviar} className="space-y-5">
            <Campo rotulo="E-mail">
              <Input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@condominio.com.br" />
            </Campo>
            <Campo rotulo="Senha">
              <div className="relative">
                <Input
                  type={mostrarSenha ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="pr-14"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha((v) => !v)}
                  className="absolute right-1 top-1 grid h-10 w-12 place-items-center rounded-lg text-slate-400 hover:text-slate-700"
                  aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  <Icone nome="usuario" className="h-4 w-4" />
                </button>
              </div>
            </Campo>

            {erro && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</p>}

            <Botao type="submit" className="w-full" disabled={carregando}>
              {carregando ? 'Entrando…' : 'Entrar no painel'}
            </Botao>
          </form>

          {import.meta.env.DEV && (
            <div className="mt-6 border-t border-slate-200 pt-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Contas de demonstração (senha Dev@12345)</p>
              <div className="grid gap-2">
                {contasDemo.map((c) => (
                  <button
                    key={c.email}
                    type="button"
                    onClick={() => {
                      setEmail(c.email);
                      setSenha('Dev@12345');
                    }}
                    className="flex min-h-12 items-center justify-between rounded-lg border border-slate-200 bg-white px-4 text-left text-sm text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50/50"
                  >
                    <span>{c.rotulo}</span>
                    <span className="truncate text-xs text-slate-400">{c.email}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
