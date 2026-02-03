import { AlertTriangle } from 'lucide-react';

export function MaintenanceBanner() {
  return (
    <div className="bg-amber-500 text-amber-950 px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium">
      <AlertTriangle className="h-4 w-4" />
      <span>
        ⚠️ SISTEMA EM MANUTENÇÃO - Usuários externos estão bloqueados no momento
      </span>
    </div>
  );
}
