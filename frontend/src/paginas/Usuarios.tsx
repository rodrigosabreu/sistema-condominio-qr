import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { api, ErroApi } from '../api/cliente';
import type { Condominio, Papel, Usuario } from '../api/tipos';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../componentes/Toast';
import { Badge, Botao, Cabecalho, Campo, Cartao, Input, Modal, Select, Spinner, Vazio } from '../componentes/ui';
import { ehAdministrador, ehGeral, podeGerenciarUsuario } from '../lib/permissoes';
import { PAPEIS } from '../lib/rotulos';

interface Form {
  nome: string;
  email: string;
  senha: string;
  papel: Papel;
  condominioId: string;
  telefone: string;
  unidade: string;
  ativo: boolean;
}

const vazio: Form = { nome: '', email: '', senha: '', papel: 'usuarioComum', condominioId: '', telefone: '', unidade: '', ativo: true };
const tomPapel = { administradorGeral: 'violeta', administradorCondominio: 'ambar', usuarioComum: 'cinza' } as const;

export function Usuarios() {
  const { sessao } = useAuth();
  const usuarioLogado = sessao!.usuario;
  const aviso = useToast();
  const geral = ehGeral(usuarioLogado);

  const [lista, setLista] = useState<Usuario[] | null>(null);
  const [condominios, setCondominios] = useState<Condominio[]>([]);
  const [modal, setModal] = useState<{ aberto: boolean; editando: Usuario | null }>({ aberto: false, editando: null });
  const [form, setForm] = useState<Form>(vazio);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const carregar = useCallback(() => api<Usuario[]>('/usuarios').then(setLista), []);
  useEffect(() => {
    if (ehAdministrador(usuarioLogado)) carregar();
    if (geral) api<Condominio[]>('/condominios').then(setCondominios);
  }, [carregar, geral, usuarioLogado]);

  if (!ehAdministrador(usuarioLogado)) return <Navigate to="/" replace />;
  if (!lista) return <Spinner />;

  const nomeCondominio = (id: string | null) => (id ? condominios.find((c) => c.id === id)?.nome : null);

  const abrirNovo = () => {
    setForm({ ...vazio, condominioId: usuarioLogado.condominioId ?? '' });
    setErro('');
    setModal({ aberto: true, editando: null });
  };
  const abrirEdicao = (u: Usuario) => {
    setForm({
      nome: u.nome,
      email: u.email,
      senha: '',
      papel: u.papel,
      condominioId: u.condominioId ?? '',
      telefone: u.telefone ?? '',
      unidade: u.unidade ?? '',
      ativo: u.ativo,
    });
    setErro('');
    setModal({ aberto: true, editando: u });
  };
  const fechar = () => setModal((m) => ({ ...m, aberto: false }));

  const papeisPermitidos: Papel[] = geral ? ['usuarioComum', 'administradorCondominio', 'administradorGeral'] : ['usuarioComum'];
  const precisaCondominio = form.papel !== 'administradorGeral' && geral;

  const salvar = async (e: FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setErro('');
    const corpo = {
      condominioId: precisaCondominio ? form.condominioId || null : geral ? null : usuarioLogado.condominioId,
      nome: form.nome,
      email: form.email,
      senha: form.senha || null,
      papel: form.papel,
      telefone: form.telefone || null,
      unidade: form.unidade || null,
      ativo: form.ativo,
    };
    try {
      if (modal.editando) {
        await api(`/usuarios/${modal.editando.id}`, { metodo: 'PUT', corpo });
        aviso.sucesso('Usuário atualizado');
      } else {
        await api('/usuarios', { metodo: 'POST', corpo });
        aviso.sucesso('Usuário cadastrado');
      }
      fechar();
      await carregar();
    } catch (err) {
      setErro(err instanceof ErroApi ? err.message : 'Erro ao salvar');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="space-y-8">
      <Cabecalho
        titulo="Usuários"
        subtitulo={geral ? 'Administradores e funcionários de todos os condomínios.' : 'Funcionários do seu condomínio.'}
      >
        <Botao onClick={abrirNovo}>Novo usuário</Botao>
      </Cabecalho>

      {lista.length === 0 ? (
        <Vazio titulo="Nenhum usuário cadastrado" />
      ) : (
        <Cartao className="overflow-hidden p-0">
          <ul className="divide-y divide-slate-100">
            {lista.map((u, i) => (
              <li key={u.id} className="pagina-entrada flex flex-col gap-3 p-5 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between" style={{ animationDelay: `${i * 0.03}s` }}>
                <div className="flex min-w-0 items-center gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-indigo-50 text-lg font-semibold text-indigo-700">
                    {u.nome.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">{u.nome}</p>
                    <p className="truncate text-sm text-slate-500">{u.email}</p>
                    <p className="truncate text-xs text-slate-400">
                      {[geral && (nomeCondominio(u.condominioId) ?? 'Sem condomínio'), u.unidade && `Unidade ${u.unidade}`].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <Badge tom={tomPapel[u.papel]}>{PAPEIS[u.papel]}</Badge>
                  {!u.ativo && <Badge tom="vermelho">Inativo</Badge>}
                  {podeGerenciarUsuario(usuarioLogado, u) && (
                    <Botao variante="secundario" className="min-h-12" onClick={() => abrirEdicao(u)}>
                      Editar
                    </Botao>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Cartao>
      )}

      <Modal titulo={modal.editando ? 'Editar usuário' : 'Novo usuário'} aberto={modal.aberto} onFechar={fechar}>
        <form onSubmit={salvar} className="space-y-4">
          <Campo rotulo="Nome completo">
            <Input required maxLength={200} value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          </Campo>
          <Campo rotulo="E-mail">
            <Input type="email" required maxLength={255} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Campo>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo rotulo="Perfil">
              <Select value={form.papel} disabled={!geral} onChange={(e) => setForm({ ...form, papel: e.target.value as Papel })}>
                {papeisPermitidos.map((p) => (
                  <option key={p} value={p}>{PAPEIS[p]}</option>
                ))}
              </Select>
            </Campo>
            {precisaCondominio && (
              <Campo rotulo="Condomínio">
                <Select required value={form.condominioId} onChange={(e) => setForm({ ...form, condominioId: e.target.value })}>
                  <option value="">Selecione…</option>
                  {condominios.map((c) => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </Select>
              </Campo>
            )}
          </div>
          <Campo rotulo={modal.editando ? 'Nova senha (deixe em branco para manter)' : 'Senha inicial'}>
            <Input type="password" autoComplete="new-password" required={!modal.editando} minLength={modal.editando ? undefined : 8} value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })} />
          </Campo>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo rotulo="Telefone">
              <Input type="tel" maxLength={20} value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
            </Campo>
            <Campo rotulo="Unidade">
              <Input maxLength={50} placeholder="Ex.: Bloco A 101" value={form.unidade} onChange={(e) => setForm({ ...form, unidade: e.target.value })} />
            </Campo>
          </div>
          {modal.editando && (
            <label className="flex min-h-12 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4">
              <input type="checkbox" className="h-5 w-5 accent-indigo-600" checked={form.ativo} onChange={(e) => setForm({ ...form, ativo: e.target.checked })} />
              <span className="text-sm text-slate-700">Usuário ativo (pode entrar no sistema)</span>
            </label>
          )}
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
