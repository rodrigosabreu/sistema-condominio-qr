import { createPortal } from 'react-dom';
import { useEffect, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';

type Variante = 'primario' | 'secundario' | 'perigo' | 'fantasma';

const variantes: Record<Variante, string> = {
  primario: 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700',
  secundario: 'border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50',
  perigo: 'bg-red-600 text-white shadow-sm hover:bg-red-700',
  fantasma: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
};

export function Botao({ variante = 'primario', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: Variante }) {
  return (
    <button
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${variantes[variante]} ${className}`}
      {...props}
    />
  );
}

export function Campo({ rotulo, erro, children }: { rotulo: string; erro?: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-slate-700">{rotulo}</span>
      {children}
      {erro && <span className="block text-xs text-red-600">{erro}</span>}
    </label>
  );
}

const base =
  'w-full min-h-12 rounded-lg border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 disabled:opacity-50';

export const Input = ({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) => <input className={`${base} ${className}`} {...props} />;
export const Select = ({ className = '', ...props }: SelectHTMLAttributes<HTMLSelectElement>) => <select className={`${base} ${className}`} {...props} />;
export const Textarea = ({ className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea className={`${base} min-h-24 ${className}`} {...props} />;

export function Cartao({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 ${className}`}>{children}</div>;
}

const tons = {
  verde: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  vermelho: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  ambar: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  violeta: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',
  cinza: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
};

export function Badge({ tom = 'cinza', children }: { tom?: keyof typeof tons; children: ReactNode }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${tons[tom]}`}>{children}</span>;
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
      <div className="absolute inset-0 bg-slate-900/50" onClick={onFechar} />
      <div className={`modal-entrada relative max-h-[92vh] w-full ${largura} overflow-y-auto rounded-t-2xl border border-slate-200 bg-white p-6 shadow-xl sm:rounded-2xl`}>
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">{titulo}</h2>
          <button onClick={onFechar} className="grid h-10 w-10 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Fechar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
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
    <div className="grid place-items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><path d="M14 14h3v3h-3zM20 14v.01M20 20v.01M17 20h3" /></svg>
      </div>
      <p className="text-lg font-semibold text-slate-900">{titulo}</p>
      {descricao && <p className="max-w-sm text-sm text-slate-500">{descricao}</p>}
      {children}
    </div>
  );
}

export function Spinner() {
  return (
    <div className="grid place-items-center py-16">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
    </div>
  );
}

export function Cabecalho({ titulo, subtitulo, children }: { titulo: string; subtitulo?: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{titulo}</h1>
        {subtitulo && <p className="mt-1 text-sm text-slate-500 sm:text-base">{subtitulo}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-3">{children}</div>}
    </div>
  );
}
