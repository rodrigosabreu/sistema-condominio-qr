import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { api, ErroApi } from '../api/cliente';
import type { Condominio } from '../api/tipos';
import { useAuth } from '../auth/AuthContext';
import { Badge, Botao, Cabecalho, Campo, Cartao, Input, Modal, Spinner, Textarea, Vazio } from '../componentes/ui';
import { useToast } from '../componentes/Toast';
import { podeCadastrarCondominio, podeEditarCondominio } from '../lib/permissoes';
import { formatarCnpj } from '../lib/rotulos';

interface Form {
  nome: string;
  cnpj: string;
  endereco: string;
  telefone: string;
  ativo: boolean;
}

const vazio: Form = { nome: '', cnpj: '', endereco: '', telefone: '', ativo: true };

export function Condominios() {
  const { sessao } = useAuth();
  const usuario = sessao!.usuario;
  const aviso = useToast();
  const [lista, setLista] = useState<Condominio[] | null>(null);
  const [modal, setModal] = useState<{ aberto: boolean; editando: Condominio | null }>({ aberto: false, editando: null });
  const [form, setForm] = useState<Form>(vazio);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const carregar = useCallback(() => api<Condominio[]>('/condominios').then(setLista), []);
  useEffect(() => {
    carregar();
  }, [carregar]);

  const abrirNovo = () => {
    setForm(vazio);
    setErro('');
    setModal({ aberto: true, editando: null });
  };
  const abrirEdicao = (c: Condominio) => {
    setForm({ nome: c.nome, cnpj: c.cnpj ?? '', endereco: c.endereco ?? '', telefone: c.telefone ?? '', ativo: c.ativo });
    setErro('');
    setModal({ aberto: true, editando: c });
  };
  const fechar = () => setModal((m) => ({ ...m, aberto: false }));

  const salvar = async (e: FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setErro('');
    const corpo = {
      nome: form.nome,
      cnpj: form.cnpj || null,
      endereco: form.endereco || null,
      telefone: form.telefone || null,
      ativo: form.ativo,
    };
    try {
      if (modal.editando) {
        await api(`/condominios/${modal.editando.id}`, { metodo: 'PUT', corpo });
        aviso.sucesso('Condomínio atualizado');
      } else {
        await api('/condominios', { metodo: 'POST', corpo });
        aviso.sucesso('Condomínio cadastrado');
      }
      fechar();
      await carregar();
    } catch (err) {
      setErro(err instanceof ErroApi ? err.message : 'Erro ao salvar');
    } finally {
      setSalvando(false);
    }
  };

  if (!lista) return <Spinner />;
  const ehEdicaoAdminDoCondominio = modal.editando && !podeCadastrarCondominio(usuario);

  return (
    <div className="space-y-8">
      <Cabecalho titulo="Condomínios" subtitulo={podeCadastrarCondominio(usuario) ? 'Cadastre e gerencie todos os condomínios.' : 'Informações do seu condomínio.'}>
        {podeCadastrarCondominio(usuario) && <Botao onClick={abrirNovo}>Novo condomínio</Botao>}
      </Cabecalho>

      {lista.length === 0 ? (
        <Vazio titulo="Nenhum condomínio" descricao="Cadastre o primeiro condomínio para começar." />
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {lista.map((c, i) => (
            <Cartao key={c.id} className="pagina-entrada" >
              <div style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-xl font-semibold tracking-tight text-slate-900">{c.nome}</h3>
                  <Badge tom={c.ativo ? 'verde' : 'vermelho'}>{c.ativo ? 'Ativo' : 'Inativo'}</Badge>
                </div>
                <dl className="mt-5 grid gap-2 text-sm">
                  <div className="flex justify-between gap-4"><dt className="text-slate-500">CNPJ</dt><dd className="text-slate-700">{formatarCnpj(c.cnpj)}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-slate-500">Endereço</dt><dd className="text-right text-slate-700">{c.endereco ?? '—'}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-slate-500">Telefone</dt><dd className="text-slate-700">{c.telefone ?? '—'}</dd></div>
                </dl>
                {podeEditarCondominio(usuario, c.id) && (
                  <Botao variante="secundario" className="mt-5 w-full" onClick={() => abrirEdicao(c)}>
                    Editar informações
                  </Botao>
                )}
              </div>
            </Cartao>
          ))}
        </div>
      )}

      <Modal titulo={modal.editando ? 'Editar condomínio' : 'Novo condomínio'} aberto={modal.aberto} onFechar={fechar}>
        <form onSubmit={salvar} className="space-y-4">
          <Campo rotulo="Nome do condomínio">
            <Input required maxLength={200} value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          </Campo>
          <Campo rotulo="CNPJ (opcional)">
            <Input inputMode="numeric" placeholder="00.000.000/0000-00" value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: e.target.value })} />
          </Campo>
          <Campo rotulo="Endereço">
            <Textarea maxLength={500} value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} />
          </Campo>
          <Campo rotulo="Telefone">
            <Input type="tel" maxLength={20} value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
          </Campo>
          {podeCadastrarCondominio(usuario) && (
            <label className="flex min-h-12 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4">
              <input type="checkbox" className="h-5 w-5 accent-indigo-600" checked={form.ativo} onChange={(e) => setForm({ ...form, ativo: e.target.checked })} />
              <span className="text-sm text-slate-700">Condomínio ativo</span>
            </label>
          )}
          {ehEdicaoAdminDoCondominio && <p className="text-xs text-slate-500">Somente o Administrador Geral pode ativar ou desativar condomínios.</p>}
          {erro && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</p>}
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Botao variante="secundario" onClick={fechar}>Cancelar</Botao>
            <Botao type="submit" disabled={salvando}>{salvando ? 'Salvando…' : 'Salvar'}</Botao>
          </div>
        </form>
      </Modal>
    </div>
  );
}
