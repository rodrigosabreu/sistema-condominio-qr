import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/cliente';
import type { Condominio, Local, Usuario } from '../api/tipos';
import { useAuth } from '../auth/AuthContext';
import { ehAdministrador } from '../lib/permissoes';
import { Badge, Botao, Cabecalho, Cartao, Spinner, Vazio } from '../componentes/ui';
import { TIPOS_LOCAL } from '../lib/rotulos';

function Estatistica({ rotulo, valor, destaque }: { rotulo: string; valor: number | string; destaque: string }) {
  return (
    <Cartao>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-slate-500">{rotulo}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{valor}</p>
        </div>
        <span className={`mt-1 h-2.5 w-2.5 rounded-full ${destaque}`} />
      </div>
    </Cartao>
  );
}

export function Painel() {
  const { sessao } = useAuth();
  const usuario = sessao!.usuario;
  const admin = ehAdministrador(usuario);
  const [locais, setLocais] = useState<Local[] | null>(null);
  const [condominios, setCondominios] = useState<Condominio[] | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[] | null>(null);

  useEffect(() => {
    api<Local[]>(`/locais${admin ? '?incluirInativos=true' : ''}`).then(setLocais).catch(() => setLocais([]));
    api<Condominio[]>('/condominios').then(setCondominios).catch(() => setCondominios([]));
    if (admin) api<Usuario[]>('/usuarios').then(setUsuarios).catch(() => setUsuarios([]));
  }, [admin]);

  if (!locais || !condominios) return <Spinner />;

  const ativos = locais.filter((l) => l.ativo).length;
  const funcionarios = usuarios?.filter((u) => u.papel === 'usuarioComum').length ?? 0;
  const nomeCondominio = (id: string) => condominios.find((c) => c.id === id)?.nome ?? '';

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <div className="max-w-2xl space-y-4">
          <p className="text-sm font-medium text-indigo-600">Bem-vindo de volta</p>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-4xl">
            Olá, <span className="texto-gradiente">{usuario.nome.split(' ')[0]}</span>
          </h1>
          <p className="text-slate-500">
            {admin
              ? 'Acompanhe locais, equipe e serviços do seu condomínio em tempo real.'
              : 'Registre e acompanhe os serviços realizados nos locais do condomínio.'}
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link to="/servicos">
              <Botao>Registrar serviço</Botao>
            </Link>
            {admin && (
              <Link to="/locais">
                <Botao variante="secundario">Gerenciar locais</Botao>
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className={`grid gap-4 sm:grid-cols-2 ${admin ? 'xl:grid-cols-4' : 'xl:grid-cols-2'}`}>
        <Estatistica rotulo="Locais ativos" valor={ativos} destaque="bg-indigo-500" />
        <Estatistica rotulo="Condomínios" valor={condominios.length} destaque="bg-sky-500" />
        {admin && <Estatistica rotulo="Funcionários" valor={funcionarios} destaque="bg-amber-500" />}
        {admin && <Estatistica rotulo="Usuários totais" valor={usuarios?.length ?? 0} destaque="bg-emerald-500" />}
      </section>

      <section className="space-y-4">
        <Cabecalho titulo="Locais" subtitulo="Clique em um local para ver e registrar serviços." />
        {locais.length === 0 ? (
          <Vazio titulo="Nenhum local cadastrado" descricao={admin ? 'Cadastre o primeiro local para gerar seu QR Code.' : 'Peça ao administrador para cadastrar os locais.'}>
            {admin && (
              <Link to="/locais">
                <Botao>Cadastrar local</Botao>
              </Link>
            )}
          </Vazio>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {locais.slice(0, 6).map((l, i) => (
              <Link key={l.id} to={`/servicos?local=${l.id}`} className="pagina-entrada group" style={{ animationDelay: `${i * 0.06}s` }}>
                <Cartao className="h-full transition group-hover:-translate-y-0.5 group-hover:border-indigo-300 group-hover:shadow">
                  <div className="flex items-start justify-between gap-3">
                    <Badge tom="violeta">{TIPOS_LOCAL[l.tipo]}</Badge>
                    {!l.ativo && <Badge tom="vermelho">Inativo</Badge>}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold tracking-tight text-slate-900">{l.nome}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {admin && usuario.papel === 'administradorGeral' ? nomeCondominio(l.condominioId) : l.andar ? `${l.andar}º andar` : 'Área comum'}
                  </p>
                </Cartao>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
