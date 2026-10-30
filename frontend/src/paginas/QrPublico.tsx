import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, ErroApi } from '../api/cliente';
import type { QrCodePublico } from '../api/tipos';
import { Badge, Spinner, Vazio } from '../componentes/ui';
import { formatarData, STATUS_SERVICO, TIPOS_LOCAL, TIPOS_SERVICO } from '../lib/rotulos';

const tomStatus = { agendado: 'violeta', emAndamento: 'ambar', concluido: 'verde', interrompido: 'vermelho' } as const;

export function QrPublico() {
  const { id = '' } = useParams();
  const [dados, setDados] = useState<QrCodePublico | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    setDados(null);
    setErro(null);
    api<QrCodePublico>(`/qrcode/${id}`, { publico: true })
      .then(setDados)
      .catch((e) => setErro(e instanceof ErroApi && e.status === 404 ? 'Este QR Code não está cadastrado.' : 'Não foi possível carregar as informações agora.'));
  }, [id]);

  return (
    <div className="relative min-h-screen bg-slate-50 px-4 py-8 sm:py-14">
      <div className="relative mx-auto max-w-2xl space-y-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-600">Informações do local</p>
        </div>

        {!dados && !erro && <Spinner />}
        {erro && <Vazio titulo="Ops!" descricao={erro} />}

        {dados && (
          <>
            <section className="pagina-entrada overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 bg-indigo-50/60 p-6 sm:p-8">
                <Badge tom="violeta">{TIPOS_LOCAL[dados.local.tipo]}</Badge>
                <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-slate-900">{dados.local.nome}</h1>
                <p className="mt-2 text-sm text-slate-500">{dados.local.condominioNome ?? 'Condomínio'}</p>
              </div>
              <div className="grid grid-cols-2 gap-px bg-slate-200">
                <div className="bg-white p-5">
                  <p className="text-xs uppercase tracking-widest text-slate-400">Consultas</p>
                  <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">{dados.local.visualizacoes}</p>
                </div>
                <div className="bg-white p-5">
                  <p className="text-xs uppercase tracking-widest text-slate-400">Registros</p>
                  <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">{dados.servicos.length}</p>
                </div>
              </div>
            </section>

            <section className="pagina-entrada rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" style={{ animationDelay: '0.1s' }}>
              <h2 className="mb-4 text-lg font-semibold tracking-tight text-slate-900">Histórico recente</h2>
              {dados.servicos.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-500">Nenhum serviço registrado ainda.</p>
              ) : (
                <ol className="relative space-y-4 border-l border-slate-200 pl-6">
                  {dados.servicos.map((s) => (
                    <li key={s.id} className="relative">
                      <span className={`absolute -left-[31px] top-1.5 h-3 w-3 rounded-full ring-4 ring-white ${s.status === 'concluido' ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-900">{TIPOS_SERVICO[s.tipo]}</span>
                        <Badge tom={tomStatus[s.status]}>{STATUS_SERVICO[s.status]}</Badge>
                      </div>
                      {s.descricao && <p className="mt-1 text-sm text-slate-600">{s.descricao}</p>}
                      <p className="mt-1 text-xs text-slate-400">
                        {s.responsavel ? `${s.responsavel} · ` : ''}
                        {s.concluidoEm ? `Concluído em ${formatarData(s.concluidoEm)}` : `Atualizado em ${formatarData(s.agendadoEm)}`}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
