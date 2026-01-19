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
  criadoEm: Date;
}

export interface Produto {
  id: string;
  codigo: string;
  nome: string;
  qtdMaxima: number;
  fotoUrl?: string;
  status: 'ativo' | 'inativo'; // Apenas visibilidade
  entidadeId: string;
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
  status: 'pendente' | 'feito';
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
  dataConferencia: Date;
  status: 'pendente' | 'conferido';
}
