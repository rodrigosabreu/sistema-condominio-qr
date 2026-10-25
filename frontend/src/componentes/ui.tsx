import { createPortal } from 'react-dom';
import { useEffect, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';

type Variante = 'primario' | 'secundario' | 'perigo' | 'fantasma';

const variantes: Record<Variante, string> = {
  primario: 'bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 text-white shadow-lg shadow-fuchsia-500/25 hover:brightness-110',
  secundario: 'border border-white/15 bg-white/5 text-slate-100 hover:bg-white/10',
  perigo: 'bg-rose-500/90 text-white shadow-lg shadow-rose-500/20 hover:bg-rose-500',
  fantasma: 'text-slate-300 hover:bg-white/5 hover:text-white',
};

export function Botao({ variante = 'primario', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: Variante }) {
  return (
    <button
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${variantes[variante]} ${className}`}
      {...props}
    />
  );
}

export function Campo({ rotulo, erro, children }: { rotulo: string; erro?: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-slate-300">{rotulo}</span>
      {children}
      {erro && <span className="block text-xs text-rose-300">{erro}</span>}
    </label>
  );
}

const base =
  'w-full min-h-12 rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-base text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/20 disabled:opacity-50';

export const Input = ({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) => <input className={`${base} ${className}`} {...props} />;
export const Select = ({ className = '', ...props }: SelectHTMLAttributes<HTMLSelectElement>) => <select className={`${base} ${className}`} {...props} />;
export const Textarea = ({ className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea className={`${base} min-h-24 ${className}`} {...props} />;

export function Cartao({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`glass rounded-3xl p-5 sm:p-6 ${className}`}>{children}</div>;
}

const tons = {
  verde: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
  vermelho: 'border-rose-400/30 bg-rose-400/10 text-rose-200',
  ambar: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
  violeta: 'border-violet-400/30 bg-violet-400/10 text-violet-200',
  cinza: 'border-white/15 bg-white/5 text-slate-300',
};

export function Badge({ tom = 'cinza', children }: { tom?: keyof typeof tons; children: ReactNode }) {
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${tons[tom]}`}>{children}</span>;
}

export function Modal({ titulo, aberto, onFechar, children, largura = 'max-w-lg' }: { titulo: string; aberto: boolean; onFechar: () => void; children: ReactNode; largura?: string }) {
  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (e: KeyboardEvent) => e.key === 'Escape' && onFechar();
    window.addEventListener('keydown', aoTeclar);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', aoTeclar);
      document.body.style.overflow = '';
    };
  }, [aberto, onFechar]);

  if (!aberto) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={titulo}>
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onFechar} />
      <div className={`modal-entrada relative max-h-[92vh] w-full ${largura} overflow-y-auto rounded-t-3xl border border-white/10 bg-slate-900/95 p-6 shadow-2xl sm:rounded-3xl`}>
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="font-display text-xl font-bold text-white">{titulo}</h2>
          <button onClick={onFechar} className="grid h-12 w-12 place-items-center rounded-xl text-slate-400 hover:bg-white/5 hover:text-white" aria-label="Fechar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function Vazio({ titulo, descricao, children }: { titulo: string; descricao?: string; children?: ReactNode }) {
  return (
    <div className="glass grid place-items-center gap-3 rounded-3xl p-10 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-violet-500/30 to-cyan-400/20 text-violet-200">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><path d="M14 14h3v3h-3zM20 14v.01M20 20v.01M17 20h3" /></svg>
      </div>
      <p className="font-display text-lg font-bold text-white">{titulo}</p>
      {descricao && <p className="max-w-sm text-sm text-slate-400">{descricao}</p>}
      {children}
    </div>
  );
}

export function Spinner() {
  return (
    <div className="grid place-items-center py-16">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-fuchsia-400" />
    </div>
  );
}

export function Cabecalho({ titulo, subtitulo, children }: { titulo: string; subtitulo?: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">{titulo}</h1>
        {subtitulo && <p className="mt-1 text-sm text-slate-400 sm:text-base">{subtitulo}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-3">{children}</div>}
    </div>
  );
}
