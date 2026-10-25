import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { api, baixarImagem, ErroApi } from '../api/cliente';
import type { Condominio, Local, TipoLocal } from '../api/tipos';
import { useAuth } from '../auth/AuthContext';
import { QrCodeDialog } from '../componentes/QrCodeDialog';
import { useToast } from '../componentes/Toast';
import { Badge, Botao, Cabecalho, Campo, Cartao, Input, Modal, Select, Spinner, Vazio } from '../componentes/ui';
import { ehAdministrador, ehGeral, podeGerenciarLocal } from '../lib/permissoes';
import { TIPOS_LOCAL } from '../lib/rotulos';

interface Form {
  nome: string;
  tipo: TipoLocal;
  andar: string;
  ativo: boolean;
  condominioId: string;
}

const vazio: Form = { nome: '', tipo: 'banheiro', andar: '', ativo: true, condominioId: '' };

export function Locais() {
  const { sessao } = useAuth();
  const usuario = sessao!.usuario;
  const aviso = useToast();
  const admin = ehAdministrador(usuario);
  const geral = ehGeral(usuario);

  const [locais, setLocais] = useState<Local[] | null>(null);
  const [condominios, setCondominios] = useState<Condominio[]>([]);
  const [mostrarInativos, setMostrarInativos] = useState(false);
  const [modal, setModal] = useState<{ aberto: boolean; editando: Local | null }>({ aberto: false, editando: null });
  const [form, setForm] = useState<Form>(vazio);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [qr, setQr] = useState<Local | null>(null);
  const [imagemQr, setImagemQr] = useState<string | null>(null);

  const carregar = useCallback(() => {
    const query = admin && mostrarInativos ? '?incluirInativos=true' : '';
    return api<Local[]>(`/locais${query}`).then(setLocais);
  }, [admin, mostrarInativos]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  useEffect(() => {
    if (geral) api<Condominio[]>('/condominios').then(setCondominios);
  }, [geral]);

  useEffect(() => {
    if (!qr) return;
    let url: string | null = null;
    setImagemQr(null);
    baixarImagem(`/locais/${qr.id}/qrcode`)
      .then((blob) => {
        url = URL.createObjectURL(blob);
        setImagemQr(url);
      })
      .catch(() => aviso.erro('Não foi possível gerar o QR Code'));
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [qr, aviso]);

  const abrirNovo = () => {
    setForm({ ...vazio, condominioId: usuario.condominioId ?? '' });
    setErro('');
    setModal({ aberto: true, editando: null });
  };
  const abrirEdicao = (l: Local) => {
    setForm({ nome: l.nome, tipo: l.tipo, andar: l.andar?.toString() ?? '', ativo: l.ativo, condominioId: l.condominioId });
    setErro('');
    setModal({ aberto: true, editando: l });
  };
  const fechar = () => setModal((m) => ({ ...m, aberto: false }));

  const salvar = async (e: FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setErro('');
    const andar = form.andar === '' ? null : Number(form.andar);
    try {
      if (modal.editando) {
        await api(`/locais/${modal.editando.id}`, { metodo: 'PUT', corpo: { nome: form.nome, tipo: form.tipo, andar, ativo: form.ativo } });
        aviso.sucesso('Local atualizado');
      } else {
        const condominioId = geral ? form.condominioId || null : null;
        await api('/locais', { metodo: 'POST', corpo: { condominioId, nome: form.nome, tipo: form.tipo, andar, ativo: true } });
        aviso.sucesso('Local cadastrado com QR Code gerado');
      }
      fechar();
      await carregar();
    } catch (err) {
      setErro(err instanceof ErroApi ? err.message : 'Erro ao salvar');
    } finally {
      setSalvando(false);
    }
  };

  const alternarAtivo = async (l: Local) => {
    try {
      await api(`/locais/${l.id}`, { metodo: 'PUT', corpo: { nome: l.nome, tipo: l.tipo, andar: l.andar, ativo: !l.ativo } });
      aviso.sucesso(l.ativo ? 'Local desativado' : 'Local reativado');
      await carregar();
    } catch (err) {
      aviso.erro(err instanceof ErroApi ? err.message : 'Erro ao atualizar');
    }
  };

  const fecharQr = useCallback(() => setQr(null), []);

  const baixarQr = () => {
    if (!imagemQr || !qr) return;
    const link = document.createElement('a');
    link.href = imagemQr;
    link.download = `qrcode-${qr.nome.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.click();
  };

  if (!locais) return <Spinner />;
  const nomeCondominio = (id: string) => condominios.find((c) => c.id === id)?.nome;

  return (
    <div className="space-y-8">
      <Cabecalho titulo="Locais" subtitulo={admin ? 'Cada local possui um QR Code exclusivo para os moradores.' : 'Locais do seu condomínio.'}>
        {admin && (
          <>
            <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-slate-300">
              <input type="checkbox" className="h-5 w-5 accent-fuchsia-500" checked={mostrarInativos} onChange={(e) => setMostrarInativos(e.target.checked)} />
              Mostrar inativos
            </label>
            <Botao onClick={abrirNovo}>Novo local</Botao>
          </>
        )}
      </Cabecalho>

      {locais.length === 0 ? (
        <Vazio titulo="Nenhum local por aqui" descricao="Cadastre banheiros, salões, jardins e demais áreas do condomínio." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {locais.map((l, i) => (
            <Cartao key={l.id} className={`pagina-entrada flex flex-col ${l.ativo ? '' : 'opacity-60'}`} >
              <div style={{ animationDelay: `${i * 0.04}s` }} className="flex h-full flex-col">
                <div className="flex items-start justify-between gap-3">
                  <Badge tom="violeta">{TIPOS_LOCAL[l.tipo]}</Badge>
                  <Badge tom={l.ativo ? 'verde' : 'vermelho'}>{l.ativo ? 'Ativo' : 'Inativo'}</Badge>
                </div>
                <h3 className="mt-4 font-display text-xl font-bold text-white">{l.nome}</h3>
                <p className="mt-1 text-sm text-slate-400">
                  {geral && nomeCondominio(l.condominioId) ? `${nomeCondominio(l.condominioId)} · ` : ''}
                  {l.andar != null ? `${l.andar}º andar` : 'Área comum'}
                </p>
                {admin && podeGerenciarLocal(usuario, l) && (
                  <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
                    <Botao variante="secundario" onClick={() => abrirEdicao(l)}>Editar</Botao>
                    <Botao variante="secundario" onClick={() => setQr(l)} disabled={!l.qrCodeId}>QR Code</Botao>
                    <Botao variante="fantasma" className="col-span-2" onClick={() => alternarAtivo(l)}>
                      {l.ativo ? 'Desativar local' : 'Reativar local'}
                    </Botao>
                  </div>
                )}
              </div>
            </Cartao>
          ))}
        </div>
      )}

      <Modal titulo={modal.editando ? 'Editar local' : 'Novo local'} aberto={modal.aberto} onFechar={fechar}>
        <form onSubmit={salvar} className="space-y-4">
          {geral && !modal.editando && (
            <Campo rotulo="Condomínio">
              <Select required value={form.condominioId} onChange={(e) => setForm({ ...form, condominioId: e.target.value })}>
                <option value="">Selecione…</option>
                {condominios.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </Select>
            </Campo>
          )}
          <Campo rotulo="Nome do local">
            <Input required maxLength={200} placeholder="Ex.: Salão de festas" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          </Campo>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo rotulo="Tipo">
              <Select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoLocal })}>
                {(Object.keys(TIPOS_LOCAL) as TipoLocal[]).map((t) => (
                  <option key={t} value={t}>{TIPOS_LOCAL[t]}</option>
                ))}
              </Select>
            </Campo>
            <Campo rotulo="Andar (opcional)">
              <Input type="number" min={-5} max={200} inputMode="numeric" value={form.andar} onChange={(e) => setForm({ ...form, andar: e.target.value })} />
            </Campo>
          </div>
          {modal.editando && (
            <label className="flex min-h-12 items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4">
              <input type="checkbox" className="h-5 w-5 accent-fuchsia-500" checked={form.ativo} onChange={(e) => setForm({ ...form, ativo: e.target.checked })} />
              <span className="text-sm text-slate-200">Local ativo (visível aos moradores)</span>
            </label>
          )}
          {erro && <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{erro}</p>}
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Botao variante="secundario" onClick={fechar}>Cancelar</Botao>
            <Botao type="submit" disabled={salvando}>{salvando ? 'Salvando…' : 'Salvar'}</Botao>
          </div>
        </form>
      </Modal>

      {qr && (
        <QrCodeDialog
          nome={qr.nome}
          condominio={geral ? nomeCondominio(qr.condominioId) ?? null : null}
          imagem={imagemQr}
          onBaixar={baixarQr}
          onFechar={fecharQr}
        />
      )}
    </div>
  );
}
