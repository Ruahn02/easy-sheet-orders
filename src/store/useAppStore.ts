import { create } from 'zustand';
import { Loja, Produto, Pedido } from '@/types';
import { mockLojas, mockProdutos, mockPedidos } from '@/data/mockData';

interface AppState {
  lojas: Loja[];
  produtos: Produto[];
  pedidos: Pedido[];
  
  // Actions
  addLoja: (loja: Loja) => void;
  updateLoja: (id: string, loja: Partial<Loja>) => void;
  deleteLoja: (id: string) => void;
  
  addProduto: (produto: Produto) => void;
  updateProduto: (id: string, produto: Partial<Produto>) => void;
  deleteProduto: (id: string) => void;
  
  addPedido: (pedido: Pedido) => void;
  updatePedidoStatus: (id: string, status: 'pendente' | 'feito') => void;
  updatePedidoCor: (id: string, cor: string | undefined) => void;
}

export const useAppStore = create<AppState>((set) => ({
  lojas: mockLojas,
  produtos: mockProdutos,
  pedidos: mockPedidos,
  
  addLoja: (loja) => set((state) => ({ lojas: [...state.lojas, loja] })),
  updateLoja: (id, lojaData) => set((state) => ({
    lojas: state.lojas.map((l) => l.id === id ? { ...l, ...lojaData } : l),
  })),
  deleteLoja: (id) => set((state) => ({
    lojas: state.lojas.filter((l) => l.id !== id),
  })),
  
  addProduto: (produto) => set((state) => ({ produtos: [...state.produtos, produto] })),
  updateProduto: (id, produtoData) => set((state) => ({
    produtos: state.produtos.map((p) => p.id === id ? { ...p, ...produtoData } : p),
  })),
  deleteProduto: (id) => set((state) => ({
    produtos: state.produtos.filter((p) => p.id !== id),
  })),
  
  addPedido: (pedido) => set((state) => ({ pedidos: [pedido, ...state.pedidos] })),
  updatePedidoStatus: (id, status) => set((state) => ({
    pedidos: state.pedidos.map((p) => p.id === id ? { ...p, status } : p),
  })),
  updatePedidoCor: (id, cor) => set((state) => ({
    pedidos: state.pedidos.map((p) => p.id === id ? { ...p, corLinha: cor } : p),
  })),
}));
