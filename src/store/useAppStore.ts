import { create } from 'zustand';
import { Entidade, Loja, Produto, Pedido } from '@/types';
import { mockEntidades, mockLojas, mockProdutos, mockPedidos } from '@/data/mockData';

interface AppState {
  entidades: Entidade[];
  lojas: Loja[];
  produtos: Produto[];
  pedidos: Pedido[];
  
  // Código admin
  codigoAdmin: string;
  
  // Entidade actions
  addEntidade: (entidade: Entidade) => void;
  updateEntidade: (id: string, entidade: Partial<Entidade>) => void;
  deleteEntidade: (id: string) => void;
  
  // Loja actions
  addLoja: (loja: Loja) => void;
  updateLoja: (id: string, loja: Partial<Loja>) => void;
  deleteLoja: (id: string) => void;
  
  // Produto actions
  addProduto: (produto: Produto) => void;
  updateProduto: (id: string, produto: Partial<Produto>) => void;
  deleteProduto: (id: string) => void;
  
  // Pedido actions
  addPedido: (pedido: Pedido) => void;
  updatePedidoStatus: (id: string, status: 'pendente' | 'feito') => void;
  updatePedidoCor: (id: string, cor: string | undefined) => void;
  
  // Código admin
  setCodigoAdmin: (codigo: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  entidades: mockEntidades,
  lojas: mockLojas,
  produtos: mockProdutos,
  pedidos: mockPedidos,
  codigoAdmin: 'ADMIN2024',
  
  // Entidade actions
  addEntidade: (entidade) => set((state) => ({ entidades: [...state.entidades, entidade] })),
  updateEntidade: (id, entidadeData) => set((state) => ({
    entidades: state.entidades.map((e) => e.id === id ? { ...e, ...entidadeData } : e),
  })),
  deleteEntidade: (id) => set((state) => ({
    // Excluir entidade E todos os produtos e pedidos vinculados
    entidades: state.entidades.filter((e) => e.id !== id),
    produtos: state.produtos.filter((p) => p.entidadeId !== id),
    pedidos: state.pedidos.filter((p) => p.entidadeId !== id),
  })),
  
  // Loja actions
  addLoja: (loja) => set((state) => ({ lojas: [...state.lojas, loja] })),
  updateLoja: (id, lojaData) => set((state) => ({
    lojas: state.lojas.map((l) => l.id === id ? { ...l, ...lojaData } : l),
  })),
  deleteLoja: (id) => set((state) => ({
    lojas: state.lojas.filter((l) => l.id !== id),
  })),
  
  // Produto actions
  addProduto: (produto) => set((state) => ({ produtos: [...state.produtos, produto] })),
  updateProduto: (id, produtoData) => set((state) => ({
    produtos: state.produtos.map((p) => p.id === id ? { ...p, ...produtoData } : p),
  })),
  deleteProduto: (id) => set((state) => ({
    produtos: state.produtos.filter((p) => p.id !== id),
  })),
  
  // Pedido actions
  addPedido: (pedido) => set((state) => ({ pedidos: [pedido, ...state.pedidos] })),
  updatePedidoStatus: (id, status) => set((state) => ({
    pedidos: state.pedidos.map((p) => p.id === id ? { ...p, status } : p),
  })),
  updatePedidoCor: (id, cor) => set((state) => ({
    pedidos: state.pedidos.map((p) => p.id === id ? { ...p, corLinha: cor } : p),
  })),
  
  setCodigoAdmin: (codigo) => set({ codigoAdmin: codigo }),
}));
