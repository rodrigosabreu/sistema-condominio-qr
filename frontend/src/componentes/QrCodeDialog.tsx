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
      <div className="absolute inset-0 bg-slate-900/50" onClick={onFechar} />
      <div className="modal-entrada relative flex max-h-[95vh] w-full max-w-md flex-col items-center gap-5 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-xl">
        <button onClick={onFechar} className="no-print absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Fechar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </button>

        <div id="area-impressao" className="area-impressao flex w-full flex-col items-center gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-600">Informações do local</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{nome}</h2>
            {condominio && <p className="text-sm text-slate-500">{condominio}</p>}
          </div>
          <div className="grid aspect-square w-[min(80vw,22rem)] place-items-center rounded-2xl border border-slate-200 bg-white p-5">
            {imagem ? (
              <img src={imagem} alt={`QR Code de ${nome}`} className="h-full w-full" />
            ) : (
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
            )}
          </div>
          <p className="max-w-xs text-xs text-slate-500">Escaneie com a câmera do celular para ver as informações do local.</p>
        </div>

        <div className="no-print grid w-full gap-3 sm:grid-cols-2">
          <button
            onClick={() => window.print()}
            disabled={!imagem}
            className="inline-flex min-h-12 items-center justify-center rounded-lg bg-indigo-600 px-5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
          >
            Imprimir
          </button>
          <button
            onClick={onBaixar}
            disabled={!imagem}
            className="inline-flex min-h-12 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          >
            Baixar PNG
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
