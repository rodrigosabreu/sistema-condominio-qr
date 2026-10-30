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
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-slate-800 bg-slate-900 p-4 lg:flex">
        <div className="mb-8 flex items-center gap-3 px-2 pt-2">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-indigo-600">
            <Icone nome="local" className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-base font-semibold leading-none tracking-tight text-white">Condomínio</p>
            <p className="mt-1 text-[11px] font-medium uppercase tracking-widest text-slate-400">QR System</p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {visiveis.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.fim}
              className={({ isActive }) =>
                `flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition ${
                  isActive ? 'bg-indigo-600/20 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icone nome={item.icone} className="h-[18px] w-[18px]" />
              {item.rotulo}
            </NavLink>
          ))}
        </nav>
        <div className="mt-4 rounded-lg border border-white/10 p-4">
          <p className="truncate text-sm font-medium text-white">{usuario.nome}</p>
          <p className="truncate text-xs text-slate-400">{PAPEIS[usuario.papel]}</p>
          <button
            onClick={aoSair}
            className="mt-3 flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-white/15 px-4 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
          >
            <Icone nome="sair" className="h-4 w-4" /> Sair
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <p className="text-lg font-semibold tracking-tight text-slate-900">Condomínio QR</p>
        <Botao variante="secundario" className="min-h-10 px-4" onClick={aoSair} aria-label="Sair">
          <Icone nome="sair" className="h-4 w-4" /> Sair
        </Botao>
      </header>

      <main className="relative w-full px-4 pb-32 pt-6 sm:px-6 lg:pb-12 lg:pl-72 lg:pr-8 lg:pt-8">
        <div className="mb-6 hidden items-center justify-end gap-3 text-sm text-slate-500 lg:flex">
          <span>{usuario.nome}</span>
          <span className="h-1 w-1 rounded-full bg-slate-300" />
          <span className="font-medium text-indigo-600">{PAPEIS[usuario.papel]}</span>
        </div>
        <div key={usuario.id} className="pagina-entrada">
          <Outlet />
        </div>
      </main>

      <nav className="fixed inset-x-3 bottom-3 z-30 flex justify-around rounded-xl border border-slate-200 bg-white p-2 shadow-lg lg:hidden">
        {visiveis.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.fim}
            className={({ isActive }) =>
              `flex min-h-12 min-w-14 flex-col items-center justify-center gap-1 rounded-lg px-2 text-[11px] font-medium transition ${
                isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500'
              }`
            }
          >
            <Icone nome={item.icone} className="h-[18px] w-[18px]" />
            {item.rotulo}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
