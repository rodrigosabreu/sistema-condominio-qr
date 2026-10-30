import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, ErroApi } from '../api/cliente';
import type { Local, Servico, ServicosPorLocal, StatusServico, TipoServico } from '../api/tipos';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../componentes/Toast';
import { Badge, Botao, Cabecalho, Campo, Cartao, Input, Modal, Select, Spinner, Textarea, Vazio } from '../componentes/ui';
import { ehAdministrador, podeEditarServico } from '../lib/permissoes';
import { deDataLocal, formatarData, paraDataLocal, STATUS_SERVICO, TIPOS_LOCAL, TIPOS_SERVICO } from '../lib/rotulos';

const tomStatus: Record<StatusServico, 'violeta' | 'ambar' | 'verde' | 'vermelho'> = {
  agendado: 'violeta',
  emAndamento: 'ambar',
  concluido: 'verde',
  interrompido: 'vermelho',
};

interface Form {
  tipo: TipoServico;
  descricao: string;
  responsavel: string;
  observacoes: string;
  agendadoEm: string;
}

const TAMANHO = 8;

export function Servicos() {
  const { sessao } = useAuth();
  const usuario = sessao!.usuario;
  const aviso = useToast();
  const [params, setParams] = useSearchParams();

  const [locais, setLocais] = useState<Local[] | null>(null);
  const [localId, setLocalId] = useState<string>(params.get('local') ?? '');
  const [pagina, setPagina] = useState(1);
  const [dados, setDados] = useState<ServicosPorLocal | null>(null);
  const [carregando, setCarregando] = useState(false);

  const [modal, setModal] = useState<{ tipo: 'novo' | 'editar' | 'concluir' | null; servico: Servico | null }>({ tipo: null, servico: null });
  const [form, setForm] = useState<Form>({ tipo: 'limpeza', descricao: '', responsavel: usuario.nome, observacoes: '', agendadoEm: '' });
  const [observacoesConclusao, setObservacoesConclusao] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    api<Local[]>(`/locais${ehAdministrador(usuario) ? '?incluirInativos=true' : ''}`).then((lista) => {
      setLocais(lista);
      setLocalId((atual) => atual || lista.find((l) => l.ativo)?.id || lista[0]?.id || '');
    });
  }, [usuario]);

  const carregar = useCallback(() => {
    if (!localId) return;
    setCarregando(true);
    return api<ServicosPorLocal>(`/servicos/por-local/${localId}?pagina=${pagina}&tamanho=${TAMANHO}`)
      .then(setDados)
      .catch((e) => aviso.erro(e instanceof ErroApi ? e.message : 'Erro ao carregar serviços'))
      .finally(() => setCarregando(false));
  }, [localId, pagina, aviso]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const escolherLocal = (id: string) => {
    setLocalId(id);
    setPagina(1);
    setParams({ local: id });
  };

  const abrirNovo = () => {
    setForm({ tipo: 'limpeza', descricao: '', responsavel: usuario.nome, observacoes: '', agendadoEm: '' });
    setErro('');
    setModal({ tipo: 'novo', servico: null });
  };
  const abrirEdicao = (s: Servico) => {
    setForm({
      tipo: s.tipo,
      descricao: s.descricao ?? '',
      responsavel: s.responsavel ?? '',
      observacoes: s.observacoes ?? '',
      agendadoEm: paraDataLocal(s.agendadoEm),
    });
    setErro('');
    setModal({ tipo: 'editar', servico: s });
  };
  const abrirConclusao = (s: Servico) => {
    setObservacoesConclusao(s.observacoes ?? '');
    setErro('');
    setModal({ tipo: 'concluir', servico: s });
  };
  const fechar = () => setModal({ tipo: null, servico: null });

  const salvar = async (e: FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setErro('');
    const base = {
      tipo: form.tipo,
      descricao: form.descricao,
      responsavel: form.responsavel || null,
      observacoes: form.observacoes || null,
      agendadoEm: deDataLocal(form.agendadoEm),
    };
    try {
      if (modal.tipo === 'novo') {
        await api('/servicos', { metodo: 'POST', corpo: { localId, ...base } });
        aviso.sucesso('Serviço registrado');
      } else if (modal.tipo === 'editar' && modal.servico) {
        await api(`/servicos/${modal.servico.id}`, { metodo: 'PUT', corpo: base });
        aviso.sucesso('Serviço atualizado');
      } else if (modal.tipo === 'concluir' && modal.servico) {
        await api(`/servicos/${modal.servico.id}/concluir`, { metodo: 'PATCH', corpo: { observacoes: observacoesConclusao || null } });
        aviso.sucesso('Serviço concluído');
      }
      fechar();
      await carregar();
    } catch (err) {
      setErro(err instanceof ErroApi ? err.message : 'Erro ao salvar');
    } finally {
      setSalvando(false);
    }
  };

  if (!locais) return <Spinner />;
  const local = locais.find((l) => l.id === localId);
  const totalPaginas = dados?.pagina.totalPaginas ?? 1;

  return (
    <div className="space-y-8">
      <Cabecalho titulo="Serviços" subtitulo="Registre e acompanhe o histórico de cada local.">
        <Botao onClick={abrirNovo} disabled={!localId}>Registrar serviço</Botao>
      </Cabecalho>

      {locais.length === 0 ? (
        <Vazio titulo="Nenhum local disponível" descricao="Cadastre locais antes de registrar serviços." />
      ) : (
        <>
          <Cartao className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <Campo rotulo="Local">
              <Select value={localId} onChange={(e) => escolherLocal(e.target.value)} className="sm:min-w-80">
                {locais.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.nome}
                    {!l.ativo ? ' (inativo)' : ''}
                  </option>
                ))}
              </Select>
            </Campo>
            {local && (
              <div className="flex flex-wrap gap-2 pb-1">
                <Badge tom="violeta">{TIPOS_LOCAL[local.tipo]}</Badge>
                {!local.ativo && <Badge tom="vermelho">Inativo</Badge>}
              </div>
            )}
          </Cartao>

          {dados && (
            <section className="grid gap-4 md:grid-cols-3">
              <Cartao>
                <p className="text-xs font-medium uppercase tracking-widest text-slate-500">Última conclusão</p>
                <p className="mt-2 text-lg font-semibold tracking-tight text-slate-900">
                  {dados.statusAtual.ultimoServico ? TIPOS_SERVICO[dados.statusAtual.ultimoServico.tipo] : 'Nenhuma ainda'}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {dados.statusAtual.ultimoServico ? `${formatarData(dados.statusAtual.ultimoServico.concluidoEm)} · ${dados.statusAtual.ultimoServico.responsavel ?? '—'}` : ' '}
                </p>
              </Cartao>
              <Cartao>
                <p className="text-xs font-medium uppercase tracking-widest text-slate-500">Próximo agendado</p>
                <p className="mt-2 text-lg font-semibold tracking-tight text-slate-900">
                  {dados.statusAtual.proximoAgendado ? TIPOS_SERVICO[dados.statusAtual.proximoAgendado.tipo] : 'Nada agendado'}
                </p>
                <p className="mt-1 text-sm text-slate-500">{dados.statusAtual.proximoAgendado ? formatarData(dados.statusAtual.proximoAgendado.agendadoEm) : ' '}</p>
              </Cartao>
              <Cartao>
                <p className="text-xs font-medium uppercase tracking-widest text-slate-500">Interrupção</p>
                <p className="mt-2 text-lg font-semibold tracking-tight text-slate-900">
                  {dados.statusAtual.interrupcaoAtual ? TIPOS_SERVICO[dados.statusAtual.interrupcaoAtual.tipo] : 'Sem interrupções'}
                </p>
                <p className="mt-1 text-sm text-slate-500">{dados.statusAtual.interrupcaoAtual?.descricao ?? ' '}</p>
              </Cartao>
            </section>
          )}

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">Histórico</h2>
              {dados && <p className="text-sm text-slate-500">{dados.pagina.totalRegistros} registro(s)</p>}
            </div>

            {carregando && !dados ? (
              <Spinner />
            ) : !dados || dados.servicos.length === 0 ? (
              <Vazio titulo="Nenhum serviço registrado" descricao="Use o botão “Registrar serviço” para começar o histórico deste local." />
            ) : (
              <ol className={`relative space-y-4 border-l border-slate-200 pl-6 transition ${carregando ? 'opacity-50' : ''}`}>
                {dados.servicos.map((s, i) => {
                  const pode = podeEditarServico(usuario, s);
                  return (
                    <li key={s.id} className="pagina-entrada relative" style={{ animationDelay: `${i * 0.04}s` }}>
                      <span className={`absolute -left-[31px] top-6 h-3.5 w-3.5 rounded-full ring-4 ring-slate-50 ${s.status === 'concluido' ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
                      <Cartao className="p-5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-lg font-semibold tracking-tight text-slate-900">{TIPOS_SERVICO[s.tipo]}</span>
                          <Badge tom={tomStatus[s.status]}>{STATUS_SERVICO[s.status]}</Badge>
                        </div>
                        {s.descricao && <p className="mt-2 text-slate-700">{s.descricao}</p>}
                        <p className="mt-2 text-xs text-slate-400">
                          {s.responsavel ? `${s.responsavel} · ` : ''}
                          {s.concluidoEm ? `Concluído em ${formatarData(s.concluidoEm)}` : s.agendadoEm ? `Agendado para ${formatarData(s.agendadoEm)}` : 'Registrado'}
                        </p>
                        {s.observacoes && <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">{s.observacoes}</p>}
                        {pode && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            <Botao variante="secundario" className="min-h-12" onClick={() => abrirEdicao(s)}>Editar</Botao>
                            {s.status !== 'concluido' && (
                              <Botao className="min-h-12" onClick={() => abrirConclusao(s)}>Concluir</Botao>
                            )}
                          </div>
                        )}
                      </Cartao>
                    </li>
                  );
                })}
              </ol>
            )}

            {dados && totalPaginas > 1 && (
              <div className="flex items-center justify-between gap-3 pt-2">
                <Botao variante="secundario" disabled={pagina <= 1} onClick={() => setPagina((p) => p - 1)}>Anterior</Botao>
                <span className="text-sm text-slate-500">Página {pagina} de {totalPaginas}</span>
                <Botao variante="secundario" disabled={pagina >= totalPaginas} onClick={() => setPagina((p) => p + 1)}>Próxima</Botao>
              </div>
            )}
          </section>
        </>
      )}

      <Modal titulo={modal.tipo === 'novo' ? 'Registrar serviço' : modal.tipo === 'editar' ? 'Editar serviço' : 'Concluir serviço'} aberto={modal.tipo !== null} onFechar={fechar}>
        {modal.tipo === 'concluir' ? (
          <form onSubmit={salvar} className="space-y-4">
            <p className="text-sm text-slate-600">Confirme a conclusão de <strong className="text-slate-900">{modal.servico && TIPOS_SERVICO[modal.servico.tipo]}</strong>.</p>
            <Campo rotulo="Observações da conclusão (opcional)">
              <Textarea maxLength={2000} value={observacoesConclusao} onChange={(e) => setObservacoesConclusao(e.target.value)} />
            </Campo>
            {erro && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</p>}
            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <Botao variante="secundario" onClick={fechar}>Voltar</Botao>
              <Botao type="submit" disabled={salvando}>{salvando ? 'Concluindo…' : 'Confirmar conclusão'}</Botao>
            </div>
          </form>
        ) : (
          <form onSubmit={salvar} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo rotulo="Tipo de serviço">
                <Select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoServico })}>
                  {(Object.keys(TIPOS_SERVICO) as TipoServico[]).map((t) => (
                    <option key={t} value={t}>{TIPOS_SERVICO[t]}</option>
                  ))}
                </Select>
              </Campo>
              <Campo rotulo="Responsável">
                <Input maxLength={200} value={form.responsavel} onChange={(e) => setForm({ ...form, responsavel: e.target.value })} />
              </Campo>
            </div>
            <Campo rotulo="Descrição">
              <Textarea required maxLength={1000} placeholder="O que foi feito ou precisa ser feito" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
            </Campo>
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo rotulo="Agendado para (opcional)">
                <Input type="datetime-local" value={form.agendadoEm} onChange={(e) => setForm({ ...form, agendadoEm: e.target.value })} />
              </Campo>
              <Campo rotulo="Observações (opcional)">
                <Input maxLength={2000} value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} />
              </Campo>
            </div>
            {erro && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</p>}
            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <Botao variante="secundario" onClick={fechar}>Cancelar</Botao>
              <Botao type="submit" disabled={salvando}>{salvando ? 'Salvando…' : 'Salvar'}</Botao>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
