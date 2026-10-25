import type { Papel, StatusServico, TipoLocal, TipoServico } from '../api/tipos';

export const TIPOS_LOCAL: Record<TipoLocal, string> = {
  banheiro: 'Banheiro',
  salao: 'Salão de festas',
  churrasqueira: 'Churrasqueira',
  lazer: 'Área de lazer',
  jardim: 'Jardim',
  horta: 'Horta',
  garagem: 'Garagem',
  outro: 'Outro',
};

export const TIPOS_SERVICO: Record<TipoServico, string> = {
  limpeza: 'Limpeza',
  manutencao: 'Manutenção',
  interdicao: 'Interdição',
  preventiva: 'Preventiva',
  jardinagem: 'Jardinagem',
  horta: 'Horta',
};

export const STATUS_SERVICO: Record<StatusServico, string> = {
  agendado: 'Agendado',
  emAndamento: 'Em andamento',
  concluido: 'Concluído',
  interrompido: 'Interrompido',
};

export const PAPEIS: Record<Papel, string> = {
  administradorGeral: 'Administrador Geral',
  administradorCondominio: 'Administrador de Condomínio',
  usuarioComum: 'Funcionário',
};

export function formatarData(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

export function formatarCnpj(cnpj: string | null): string {
  if (!cnpj || cnpj.length !== 14) return cnpj ?? '—';
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

export function paraDataLocal(iso: string | null): string {
  if (!iso) return '';
  const data = new Date(iso);
  const ajustada = new Date(data.getTime() - data.getTimezoneOffset() * 60000);
  return ajustada.toISOString().slice(0, 16);
}

export function deDataLocal(valor: string): string | null {
  return valor ? new Date(valor).toISOString() : null;
}
