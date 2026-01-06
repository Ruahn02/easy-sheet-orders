import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AcessoState {
  acessoLiberado: boolean;
  setAcessoLiberado: (liberado: boolean) => void;
  logout: () => void;
}

export const useAcesso = create<AcessoState>()(
  persist(
    (set) => ({
      acessoLiberado: false,
      setAcessoLiberado: (liberado) => set({ acessoLiberado: liberado }),
      logout: () => set({ acessoLiberado: false }),
    }),
    {
      name: 'acesso-storage',
    }
  )
);
