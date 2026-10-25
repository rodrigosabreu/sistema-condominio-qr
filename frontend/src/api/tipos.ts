export type Papel = 'administradorGeral' | 'administradorCondominio' | 'usuarioComum';
export type TipoLocal = 'banheiro' | 'salao' | 'churrasqueira' | 'lazer' | 'jardim' | 'horta' | 'garagem' | 'outro';
export type TipoServico = 'limpeza' | 'manutencao' | 'interdicao' | 'preventiva' | 'jardinagem' | 'horta';
export type StatusServico = 'agendado' | 'emAndamento' | 'concluido' | 'interrompido';

export interface UsuarioSessao {
  id: string;
  nome: string;
  email: string;
  papel: Papel;
  condominioId: string | null;
}

export interface LoginResposta {
  token: string;
  expiraEm: string;
  usuario: UsuarioSessao;
}

export interface Condominio {
  id: string;
  nome: string;
  cnpj: string | null;
  endereco: string | null;
  telefone: string | null;
  ativo: boolean;
}

export interface Local {
  id: string;
  condominioId: string;
  nome: string;
  tipo: TipoLocal;
  andar: number | null;
  ativo: boolean;
  qrCodeId: string | null;
}

export interface Usuario {
  id: string;
  condominioId: string | null;
  nome: string;
  email: string;
  papel: Papel;
  telefone: string | null;
  unidade: string | null;
  ativo: boolean;
}

export interface Servico {
  id: string;
  localId: string;
  usuarioId: string | null;
  tipo: TipoServico;
  descricao: string | null;
  status: StatusServico;
  agendadoEm: string | null;
  concluidoEm: string | null;
  responsavel: string | null;
  observacoes: string | null;
}

export interface ServicosPorLocal {
  local: { id: string; condominioId: string; nome: string; tipo: TipoLocal; andar: number | null; ativo: boolean; qrCodeId: string | null };
  statusAtual: {
    ultimoServico: { tipo: TipoServico; concluidoEm: string | null; responsavel: string | null } | null;
    interrupcaoAtual: Servico | null;
    proximoAgendado: { tipo: TipoServico; agendadoEm: string | null } | null;
  };
  servicos: Servico[];
  pagina: { atual: number; tamanho: number; totalRegistros: number; totalPaginas: number };
}

export interface QrCodePublico {
  local: {
    id: string;
    nome: string;
    tipo: TipoLocal;
    qrCodeId: string;
    condominioId: string;
    condominioNome: string | null;
    visualizacoes: number;
  };
  servicos: Servico[];
}

export interface Erro {
  erro: string;
  mensagem?: string;
}
