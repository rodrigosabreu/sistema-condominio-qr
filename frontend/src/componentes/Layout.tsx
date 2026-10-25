import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { PAPEIS } from '../lib/rotulos';
import { ehAdministrador } from '../lib/permissoes';
import { Botao } from './ui';

const icones = {
  painel: 'M3 13h8V3H3zM13 21h8v-8h-8zM13 3v6h8V3zM3 21h8v-6H3z',
  condominio: 'M3 21V8l9-5 9 5v13M9 21v-6h6v6',
  local: 'M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  servico: 'M9 11l3 3 8-8M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h9',
  usuario: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  sair: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
} as const;

export function Icone({ nome, className = 'h-5 w-5' }: { nome: keyof typeof icones; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={icones[nome]} />
    </svg>
  );
}

const itens = [
  { to: '/', rotulo: 'Painel', icone: 'painel' as const, admin: false, fim: true },
  { to: '/condominios', rotulo: 'Condomínios', icone: 'condominio' as const, admin: false, fim: false },
  { to: '/locais', rotulo: 'Locais', icone: 'local' as const, admin: false, fim: false },
  { to: '/servicos', rotulo: 'Serviços', icone: 'servico' as const, admin: false, fim: false },
  { to: '/usuarios', rotulo: 'Usuários', icone: 'usuario' as const, admin: true, fim: false },
];

export function Layout() {
  const { sessao, sair } = useAuth();
  const navegar = useNavigate();
  const usuario = sessao!.usuario;
  const admin = ehAdministrador(usuario);
  const visiveis = itens.filter((i) => !i.admin || admin);

  const aoSair = () => {
    sair();
    navegar('/login', { replace: true });
  };

  return (
    <div className="relative min-h-screen">
      <div className="orb -left-40 top-1/4 h-96 w-96 bg-violet-600" />
      <div className="orb -right-40 bottom-0 h-[30rem] w-[30rem] bg-cyan-500" style={{ animationDelay: '-9s' }} />
      <aside className="glass fixed inset-y-4 left-4 z-30 hidden w-64 flex-col rounded-3xl p-4 lg:flex">
        <div className="mb-8 flex items-center gap-3 px-2 pt-2">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 shadow-lg shadow-violet-500/30">
            <Icone nome="local" className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="font-display text-lg font-bold leading-none text-white">Condomínio</p>
            <p className="text-xs font-semibold tracking-widest text-cyan-300">QR SYSTEM</p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1.5">
          {visiveis.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.fim}
              className={({ isActive }) =>
                `flex min-h-12 items-center gap-3 rounded-2xl px-4 text-sm font-semibold transition ${
                  isActive ? 'bg-gradient-to-r from-violet-500/30 to-cyan-400/15 text-white shadow-inner ring-1 ring-violet-400/30' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icone nome={item.icone} />
              {item.rotulo}
            </NavLink>
          ))}
        </nav>
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="truncate text-sm font-semibold text-white">{usuario.nome}</p>
          <p className="truncate text-xs text-slate-400">{PAPEIS[usuario.papel]}</p>
          <Botao variante="secundario" className="mt-3 w-full" onClick={aoSair}>
            <Icone nome="sair" className="h-4 w-4" /> Sair
          </Botao>
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-white/5 bg-slate-950/60 px-4 py-3 backdrop-blur-xl lg:hidden">
        <p className="font-display text-lg font-bold text-white">Condomínio QR</p>
        <Botao variante="secundario" className="min-h-12 px-4" onClick={aoSair} aria-label="Sair">
          <Icone nome="sair" className="h-4 w-4" /> Sair
        </Botao>
      </header>

      <main className="relative w-full px-4 pb-32 pt-6 sm:px-6 lg:pb-12 lg:pl-[19rem] lg:pr-8 lg:pt-8">
        <div className="mb-6 hidden items-center justify-end gap-3 text-sm text-slate-400 lg:flex">
          <span>{usuario.nome}</span>
          <span className="h-1 w-1 rounded-full bg-slate-600" />
          <span className="text-violet-300">{PAPEIS[usuario.papel]}</span>
        </div>
        <div key={usuario.id} className="pagina-entrada">
          <Outlet />
        </div>
      </main>

      <nav className="glass fixed inset-x-3 bottom-3 z-30 flex justify-around rounded-3xl p-2 lg:hidden">
        {visiveis.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.fim}
            className={({ isActive }) =>
              `flex min-h-12 min-w-14 flex-col items-center justify-center gap-1 rounded-2xl px-2 text-[11px] font-semibold transition ${
                isActive ? 'bg-gradient-to-br from-violet-500/40 to-cyan-400/20 text-white' : 'text-slate-400'
              }`
            }
          >
            <Icone nome={item.icone} />
            {item.rotulo}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
