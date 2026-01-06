import { Entidade, Loja, Produto, Pedido } from '@/types';

export const mockEntidades: Entidade[] = [
  { id: 'ent1', nome: 'Material de Escritório', aceitandoPedidos: true, criadoEm: new Date('2024-01-01') },
  { id: 'ent2', nome: 'Uso e Consumo', aceitandoPedidos: true, criadoEm: new Date('2024-01-01') },
  { id: 'ent3', nome: 'Copa e Cozinha', aceitandoPedidos: true, criadoEm: new Date('2024-01-05') },
  { id: 'ent4', nome: 'Manutenção', aceitandoPedidos: false, criadoEm: new Date('2024-01-10') },
];

export const mockLojas: Loja[] = [
  { id: '1', nome: 'Matriz - Centro', status: 'ativo', criadoEm: new Date('2024-01-15') },
  { id: '2', nome: 'Filial Norte', status: 'ativo', criadoEm: new Date('2024-01-20') },
  { id: '3', nome: 'Filial Sul', status: 'ativo', criadoEm: new Date('2024-02-01') },
  { id: '4', nome: 'Filial Leste', status: 'ativo', criadoEm: new Date('2024-02-10') },
  { id: '5', nome: 'Filial Oeste', status: 'inativo', criadoEm: new Date('2024-02-15') },
  { id: '6', nome: 'Shopping Plaza', status: 'ativo', criadoEm: new Date('2024-03-01') },
  { id: '7', nome: 'Centro Comercial', status: 'ativo', criadoEm: new Date('2024-03-10') },
  { id: '8', nome: 'Atacado Regional', status: 'ativo', criadoEm: new Date('2024-03-15') },
];

export const mockProdutos: Produto[] = [
  // Material de Escritório (ent1)
  { id: '1', codigo: 'ESC001', nome: 'Caneta Azul', qtdMaxima: 100, status: 'ativo', entidadeId: 'ent1', criadoEm: new Date('2024-01-01') },
  { id: '2', codigo: 'ESC002', nome: 'Lápis Preto', qtdMaxima: 200, status: 'ativo', entidadeId: 'ent1', criadoEm: new Date('2024-01-01') },
  { id: '3', codigo: 'ESC003', nome: 'Borracha Branca', qtdMaxima: 150, status: 'ativo', entidadeId: 'ent1', criadoEm: new Date('2024-01-01') },
  { id: '4', codigo: 'ESC004', nome: 'Grampeador', qtdMaxima: 20, status: 'inativo', entidadeId: 'ent1', criadoEm: new Date('2024-01-02') },
  
  // Uso e Consumo (ent2)
  { id: '5', codigo: 'UC001', nome: 'Papel Toalha', qtdMaxima: 50, status: 'ativo', entidadeId: 'ent2', criadoEm: new Date('2024-01-01') },
  { id: '6', codigo: 'UC002', nome: 'Detergente 500ml', qtdMaxima: 30, status: 'ativo', entidadeId: 'ent2', criadoEm: new Date('2024-01-01') },
  { id: '7', codigo: 'UC003', nome: 'Álcool 70%', qtdMaxima: 40, status: 'ativo', entidadeId: 'ent2', criadoEm: new Date('2024-01-02') },
  
  // Copa e Cozinha (ent3)
  { id: '8', codigo: 'COPA001', nome: 'Café 500g', qtdMaxima: 20, status: 'ativo', entidadeId: 'ent3', criadoEm: new Date('2024-01-05') },
  { id: '9', codigo: 'COPA002', nome: 'Açúcar 1kg', qtdMaxima: 30, status: 'ativo', entidadeId: 'ent3', criadoEm: new Date('2024-01-05') },
  { id: '10', codigo: 'COPA003', nome: 'Copo Descartável 200ml', qtdMaxima: 100, status: 'ativo', entidadeId: 'ent3', criadoEm: new Date('2024-01-05') },
];

export const mockPedidos: Pedido[] = [
  {
    id: '1',
    lojaId: '1',
    entidadeId: 'ent1',
    observacoes: 'Urgente para reunião',
    data: new Date('2024-12-27T10:30:00'),
    status: 'feito',
    corLinha: '#dcfce7',
    itens: [
      { produtoId: '1', quantidade: 10 },
      { produtoId: '2', quantidade: 20 },
    ],
  },
  {
    id: '2',
    lojaId: '2',
    entidadeId: 'ent2',
    data: new Date('2024-12-27T14:15:00'),
    status: 'pendente',
    itens: [
      { produtoId: '5', quantidade: 5 },
      { produtoId: '6', quantidade: 10 },
    ],
  },
  {
    id: '3',
    lojaId: '3',
    entidadeId: 'ent3',
    observacoes: 'Para evento de fim de ano',
    data: new Date('2024-12-28T09:00:00'),
    status: 'pendente',
    itens: [
      { produtoId: '8', quantidade: 5 },
      { produtoId: '9', quantidade: 10 },
      { produtoId: '10', quantidade: 50 },
    ],
  },
];
