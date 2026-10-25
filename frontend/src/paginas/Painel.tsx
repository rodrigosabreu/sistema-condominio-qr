import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/cliente';
import type { Condominio, Local, Usuario } from '../api/tipos';
import { useAuth } from '../auth/AuthContext';
import { ehAdministrador } from '../lib/permissoes';
import { Badge, Botao, Cabecalho, Cartao, Spinner, Vazio } from '../componentes/ui';
import { TIPOS_LOCAL } from '../lib/rotulos';

function Estatistica({ rotulo, valor, gradiente }: { rotulo: string; valor: number | string; gradiente: string }) {
  return (
    <Cartao className="brilho relative overflow-hidden">
      <div className={`absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-30 blur-2xl ${gradiente}`} />
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{rotulo}</p>
      <p className="mt-3 font-display text-4xl font-bold text-white">{valor}</p>
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
      <section className="glass relative overflow-hidden rounded-3xl p-6 sm:p-10">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gradient-to-br from-fuchsia-500/40 to-cyan-400/20 blur-3xl" />
        <div className="relative max-w-2xl space-y-4">
          <p className="text-sm font-semibold text-cyan-300">Bem-vindo de volta</p>
          <h1 className="font-display text-4xl font-bold leading-tight text-white sm:text-5xl">
            Olá, <span className="texto-gradiente">{usuario.nome.split(' ')[0]}</span>
          </h1>
          <p className="text-slate-400">
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
        <Estatistica rotulo="Locais ativos" valor={ativos} gradiente="bg-violet-500" />
        <Estatistica rotulo="Condomínios" valor={condominios.length} gradiente="bg-cyan-400" />
        {admin && <Estatistica rotulo="Funcionários" valor={funcionarios} gradiente="bg-fuchsia-500" />}
        {admin && <Estatistica rotulo="Usuários totais" valor={usuarios?.length ?? 0} gradiente="bg-emerald-400" />}
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
                <Cartao className="h-full transition group-hover:-translate-y-1 group-hover:border-violet-400/40">
                  <div className="flex items-start justify-between gap-3">
                    <Badge tom="violeta">{TIPOS_LOCAL[l.tipo]}</Badge>
                    {!l.ativo && <Badge tom="vermelho">Inativo</Badge>}
                  </div>
                  <h3 className="mt-4 font-display text-xl font-bold text-white">{l.nome}</h3>
                  <p className="mt-1 text-sm text-slate-400">
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
