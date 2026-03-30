import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CriticalModeState {
  criticalMode: boolean;
  activatedAt: string | null;
  reason: 'manual' | 'auto_402' | null;
  activate: (reason: 'manual' | 'auto_402') => void;
  deactivate: () => void;
}

export const useCriticalMode = create<CriticalModeState>()(
  persist(
    (set) => ({
      criticalMode: false,
      activatedAt: null,
      reason: null,
      activate: (reason) =>
        set({
          criticalMode: true,
          activatedAt: new Date().toISOString(),
          reason,
        }),
      deactivate: () =>
        set({
          criticalMode: false,
          activatedAt: null,
          reason: null,
        }),
    }),
    {
      name: 'critical-mode-storage',
    }
  )
);
