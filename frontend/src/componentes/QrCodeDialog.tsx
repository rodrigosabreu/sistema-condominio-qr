import { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  nome: string;
  condominio: string | null;
  imagem: string | null;
  onBaixar: () => void;
  onFechar: () => void;
}

export function QrCodeDialog({ nome, condominio, imagem, onBaixar, onFechar }: Props) {
  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => e.key === 'Escape' && onFechar();
    window.addEventListener('keydown', aoTeclar);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', aoTeclar);
      document.body.style.overflow = '';
    };
  }, [onFechar]);

  return createPortal(
    <div className="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true" aria-label={`QR Code de ${nome}`}>
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onFechar} />
      <div className="modal-entrada relative flex max-h-[95vh] w-full max-w-md flex-col items-center gap-5 overflow-y-auto rounded-3xl border border-white/10 bg-slate-900/95 p-6 text-center shadow-2xl">
        <button onClick={onFechar} className="no-print absolute right-3 top-3 grid h-12 w-12 place-items-center rounded-xl text-slate-400 hover:bg-white/5 hover:text-white" aria-label="Fechar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </button>

        <div id="area-impressao" className="area-impressao flex w-full flex-col items-center gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">Informações do local</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-white">{nome}</h2>
            {condominio && <p className="text-sm text-slate-400">{condominio}</p>}
          </div>
          <div className="grid aspect-square w-[min(80vw,22rem)] place-items-center rounded-3xl bg-white p-5 shadow-2xl shadow-cyan-500/20">
            {imagem ? (
              <img src={imagem} alt={`QR Code de ${nome}`} className="h-full w-full" />
            ) : (
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-fuchsia-500" />
            )}
          </div>
          <p className="max-w-xs text-xs text-slate-500">Escaneie com a câmera do celular para ver as informações do local.</p>
        </div>

        <div className="no-print grid w-full gap-3 sm:grid-cols-2">
          <button
            onClick={() => window.print()}
            disabled={!imagem}
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 px-5 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/25 transition hover:brightness-110 disabled:opacity-50"
          >
            Imprimir
          </button>
          <button
            onClick={onBaixar}
            disabled={!imagem}
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 text-sm font-semibold text-slate-100 transition hover:bg-white/10 disabled:opacity-50"
          >
            Baixar PNG
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
