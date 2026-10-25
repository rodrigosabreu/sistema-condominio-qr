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
    <div className="relative min-h-screen px-4 py-8 sm:py-14">
      <div className="orb -top-24 left-1/2 h-80 w-80 -translate-x-1/2 bg-fuchsia-600" />
      <div className="relative mx-auto max-w-2xl space-y-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Informações do local</p>
        </div>

        {!dados && !erro && <Spinner />}
        {erro && <Vazio titulo="Ops!" descricao={erro} />}

        {dados && (
          <>
            <section className="glass pagina-entrada overflow-hidden rounded-3xl">
              <div className="bg-gradient-to-br from-violet-600/40 via-fuchsia-600/20 to-cyan-500/30 p-6 sm:p-8">
                <Badge tom="violeta">{TIPOS_LOCAL[dados.local.tipo]}</Badge>
                <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-white sm:text-4xl">{dados.local.nome}</h1>
                <p className="mt-2 text-sm text-slate-300">{dados.local.condominioNome ?? 'Condomínio'}</p>
              </div>
              <div className="grid grid-cols-2 gap-px bg-white/10">
                <div className="bg-slate-950/60 p-5">
                  <p className="text-xs uppercase tracking-widest text-slate-500">Consultas</p>
                  <p className="mt-1 font-display text-3xl font-bold text-white">{dados.local.visualizacoes}</p>
                </div>
                <div className="bg-slate-950/60 p-5">
                  <p className="text-xs uppercase tracking-widest text-slate-500">Registros</p>
                  <p className="mt-1 font-display text-3xl font-bold text-white">{dados.servicos.length}</p>
                </div>
              </div>
            </section>

            <section className="glass pagina-entrada rounded-3xl p-5 sm:p-6" style={{ animationDelay: '0.1s' }}>
              <h2 className="mb-4 font-display text-xl font-bold text-white">Histórico recente</h2>
              {dados.servicos.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-400">Nenhum serviço registrado ainda.</p>
              ) : (
                <ol className="relative space-y-4 border-l border-white/10 pl-6">
                  {dados.servicos.map((s) => (
                    <li key={s.id} className="relative">
                      <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-gradient-to-br from-violet-400 to-cyan-300 ring-4 ring-slate-950" />
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-white">{TIPOS_SERVICO[s.tipo]}</span>
                        <Badge tom={tomStatus[s.status]}>{STATUS_SERVICO[s.status]}</Badge>
                      </div>
                      {s.descricao && <p className="mt-1 text-sm text-slate-300">{s.descricao}</p>}
                      <p className="mt-1 text-xs text-slate-500">
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
