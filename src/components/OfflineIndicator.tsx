import { WifiOff, CloudOff, RefreshCw, Cloud } from 'lucide-react';
import { useConnectionMonitor } from '@/lib/connectionMonitor';

export function OfflineIndicator() {
  const { isOnline, pendingCount, syncing, trySync } = useConnectionMonitor();

  // Não mostrar nada se está tudo ok
  if (isOnline && pendingCount === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100]">
      {!isOnline && (
        <div className="bg-amber-500 text-white px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium">
          <WifiOff className="h-4 w-4" />
          <span>Sem conexão — pedidos serão salvos localmente</span>
        </div>
      )}

      {isOnline && pendingCount > 0 && (
        <div className="bg-blue-500 text-white px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium">
          {syncing ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Sincronizando pedidos...</span>
            </>
          ) : (
            <>
              <CloudOff className="h-4 w-4" />
              <span>
                {pendingCount} pedido{pendingCount > 1 ? 's' : ''} aguardando envio
              </span>
              <button
                onClick={trySync}
                className="ml-2 bg-white/20 hover:bg-white/30 rounded px-2 py-0.5 text-xs transition-colors"
              >
                Tentar agora
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
