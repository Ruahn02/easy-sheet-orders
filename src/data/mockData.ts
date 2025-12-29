import { Loja, Produto, Pedido } from '@/types';

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
  { id: '1', codigo: 'P001', nome: 'Arroz Integral 5kg', qtdMaxima: 50, fotoUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&h=100&fit=crop', status: 'disponivel', criadoEm: new Date('2024-01-01') },
  { id: '2', codigo: 'P002', nome: 'Feijão Preto 1kg', qtdMaxima: 100, fotoUrl: 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=100&h=100&fit=crop', status: 'disponivel', criadoEm: new Date('2024-01-01') },
  { id: '3', codigo: 'P003', nome: 'Óleo de Soja 900ml', qtdMaxima: 80, fotoUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=100&h=100&fit=crop', status: 'disponivel', criadoEm: new Date('2024-01-01') },
  { id: '4', codigo: 'P004', nome: 'Açúcar Refinado 1kg', qtdMaxima: 120, fotoUrl: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=100&h=100&fit=crop', status: 'disponivel', criadoEm: new Date('2024-01-02') },
  { id: '5', codigo: 'P005', nome: 'Café Torrado 500g', qtdMaxima: 60, fotoUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=100&h=100&fit=crop', status: 'disponivel', criadoEm: new Date('2024-01-02') },
  { id: '6', codigo: 'P006', nome: 'Leite UHT 1L', qtdMaxima: 200, fotoUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=100&h=100&fit=crop', status: 'disponivel', criadoEm: new Date('2024-01-03') },
  { id: '7', codigo: 'P007', nome: 'Macarrão Espaguete 500g', qtdMaxima: 150, fotoUrl: 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=100&h=100&fit=crop', status: 'disponivel', criadoEm: new Date('2024-01-03') },
  { id: '8', codigo: 'P008', nome: 'Molho de Tomate 340g', qtdMaxima: 100, fotoUrl: 'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=100&h=100&fit=crop', status: 'disponivel', criadoEm: new Date('2024-01-04') },
  { id: '9', codigo: 'P009', nome: 'Sal Refinado 1kg', qtdMaxima: 80, status: 'disponivel', criadoEm: new Date('2024-01-04') },
  { id: '10', codigo: 'P010', nome: 'Farinha de Trigo 1kg', qtdMaxima: 100, fotoUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=100&h=100&fit=crop', status: 'indisponivel', criadoEm: new Date('2024-01-05') },
  { id: '11', codigo: 'P011', nome: 'Biscoito Cream Cracker', qtdMaxima: 120, status: 'disponivel', criadoEm: new Date('2024-01-05') },
  { id: '12', codigo: 'P012', nome: 'Margarina 500g', qtdMaxima: 80, status: 'disponivel', criadoEm: new Date('2024-01-06') },
];

export const mockPedidos: Pedido[] = [
  {
    id: '1',
    lojaId: '1',
    data: new Date('2024-12-27T10:30:00'),
    status: 'feito',
    corLinha: '#dcfce7',
    itens: [
      { produtoId: '1', quantidade: 10 },
      { produtoId: '2', quantidade: 20 },
      { produtoId: '5', quantidade: 15 },
    ],
  },
  {
    id: '2',
    lojaId: '2',
    data: new Date('2024-12-27T14:15:00'),
    status: 'pendente',
    itens: [
      { produtoId: '3', quantidade: 25 },
      { produtoId: '4', quantidade: 30 },
      { produtoId: '6', quantidade: 50 },
    ],
  },
  {
    id: '3',
    lojaId: '3',
    data: new Date('2024-12-28T09:00:00'),
    status: 'pendente',
    itens: [
      { produtoId: '1', quantidade: 15 },
      { produtoId: '7', quantidade: 40 },
      { produtoId: '8', quantidade: 35 },
    ],
  },
];
