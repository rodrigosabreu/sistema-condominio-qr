import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

type Tom = 'sucesso' | 'erro';
interface Aviso {
  id: number;
  tom: Tom;
  texto: string;
}

interface ToastValor {
  sucesso: (texto: string) => void;
  erro: (texto: string) => void;
}

const ToastContext = createContext<ToastValor | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [avisos, setAvisos] = useState<Aviso[]>([]);

  const exibir = useCallback((tom: Tom, texto: string) => {
    const id = Date.now() + Math.random();
    setAvisos((atuais) => [...atuais, { id, tom, texto }]);
    setTimeout(() => setAvisos((atuais) => atuais.filter((a) => a.id !== id)), 4200);
  }, []);

  const valor = useMemo<ToastValor>(
    () => ({
      sucesso: (texto) => exibir('sucesso', texto),
      erro: (texto) => exibir('erro', texto),
    }),
    [exibir],
  );

  return (
    <ToastContext.Provider value={valor}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4">
        {avisos.map((aviso) => (
          <div
            key={aviso.id}
            role="status"
            className={`toast-entrada pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-lg border bg-white px-4 py-3 text-sm font-medium shadow-lg ${
              aviso.tom === 'sucesso'
                ? 'border-emerald-200 text-emerald-800'
                : 'border-red-200 text-red-800'
            }`}
          >
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${aviso.tom === 'sucesso' ? 'bg-emerald-500' : 'bg-red-500'}`} />
            {aviso.texto}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const contexto = useContext(ToastContext);
  if (!contexto) throw new Error('useToast deve ser usado dentro de ToastProvider');
  return contexto;
}
