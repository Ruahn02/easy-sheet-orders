import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AcessoState {
  acessoLiberado: boolean;
  ultimaLojaId: string | null;
  setAcessoLiberado: (liberado: boolean) => void;
  setUltimaLojaId: (lojaId: string) => void;
  logout: () => void;
}

export const useAcesso = create<AcessoState>()(
  persist(
    (set) => ({
      acessoLiberado: false,
      ultimaLojaId: null,
      setAcessoLiberado: (liberado) => set({ acessoLiberado: liberado }),
      setUltimaLojaId: (lojaId) => set({ ultimaLojaId: lojaId }),
      logout: () => set({ acessoLiberado: false }),
    }),
    {
      name: 'acesso-storage',
    }
  )
);
