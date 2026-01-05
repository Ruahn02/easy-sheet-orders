import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Loja } from '@/types';

interface LojaAuthState {
  lojaAutenticada: Loja | null;
  setLojaAutenticada: (loja: Loja | null) => void;
  logout: () => void;
}

export const useLojaAuth = create<LojaAuthState>()(
  persist(
    (set) => ({
      lojaAutenticada: null,
      setLojaAutenticada: (loja) => set({ lojaAutenticada: loja }),
      logout: () => set({ lojaAutenticada: null }),
    }),
    {
      name: 'loja-auth-storage',
    }
  )
);
