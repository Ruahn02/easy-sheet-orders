export interface Entidade {
  id: string;
  nome: string;
  aceitandoPedidos: boolean; // Controla se o link está aberto para pedidos
  criadoEm: Date;
}

export interface Loja {
  id: string;
  nome: string;
  status: 'ativo' | 'inativo';
  ordem?: number;
  criadoEm: Date;
}

export interface Produto {
  id: string;
  codigo: string;
  nome: string;
  qtdMaxima: number;
  fotoUrl?: string;
  status: 'ativo' | 'inativo'; // Apenas visibilidade
  entidadeIds: string[];       // N:N - array de entidades
  entidadeId?: string;         // Fallback para compatibilidade
  ordem?: number;
  criadoEm: Date;
}

export interface PedidoItem {
  produtoId: string;
  quantidade: number;
}

export interface Pedido {
  id: string;
  lojaId: string;
  entidadeId: string;
  observacoes?: string;
  data: Date;
  status: 'pendente' | 'feito' | 'nao_atendido';
  corLinha?: string;
  itens: PedidoItem[];
}

export interface PedidoComDetalhes extends Pedido {
  loja: Loja;
  entidade: Entidade;
}

export interface Inventario {
  id: string;
  produtoId: string;
  entidadeId: string;
  quantidade: number;
  unidadeMedida: string;
  dataConferencia: Date;
  status: 'pendente' | 'conferido';
}

export interface SeparacaoItem {
  id: string;
  pedidoId: string;
  produtoId: string;
  separado: boolean;
  dataRegistro: Date;
}
