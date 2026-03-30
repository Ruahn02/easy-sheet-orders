import { AlertTriangle, ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useCriticalMode } from '@/store/useCriticalMode';

interface CriticalModeBannerProps {
  showDeactivate?: boolean;
}

export function CriticalModeBanner({ showDeactivate = false }: CriticalModeBannerProps) {
  const { criticalMode, reason, deactivate } = useCriticalMode();

  if (!criticalMode) return null;

  return (
    <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/30">
      <AlertTriangle className="h-5 w-5 text-amber-600" />
      <AlertTitle className="text-amber-800 dark:text-amber-200 font-semibold">
        Modo Crítico Ativo
      </AlertTitle>
      <AlertDescription className="text-amber-700 dark:text-amber-300">
        {reason === 'auto_402'
          ? 'O Supabase atingiu o limite de cota (erro 402). Criação e edição estão temporariamente bloqueadas para preservar os dados. Pedidos continuam funcionando via cache.'
          : 'Modo crítico ativado manualmente. Criação e edição de dados administrativos estão bloqueadas.'}
        {showDeactivate && (
          <Button
            variant="outline"
            size="sm"
            className="ml-3 border-amber-500 text-amber-700 hover:bg-amber-100"
            onClick={deactivate}
          >
            <ShieldOff className="h-4 w-4 mr-1" />
            Desativar Modo Crítico
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
