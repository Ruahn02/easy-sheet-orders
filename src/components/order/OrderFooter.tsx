import { Send, ShoppingBag, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OrderFooterProps {
  itemCount: number;
  onSubmit: () => void;
  disabled: boolean;
  pedidosFechados?: boolean;
}

export function OrderFooter({ itemCount, onSubmit, disabled, pedidosFechados }: OrderFooterProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card p-4 shadow-lg">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <ShoppingBag className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {itemCount} {itemCount === 1 ? 'item' : 'itens'}
            </p>
            <p className="text-xs text-muted-foreground">selecionados</p>
          </div>
        </div>

        {pedidosFechados ? (
          <Button
            disabled
            className="flex-1 max-w-[200px] bg-muted text-muted-foreground font-semibold h-12 cursor-not-allowed"
          >
            <Lock className="mr-2 h-4 w-4" />
            Pedidos Fechados
          </Button>
        ) : (
          <Button
            onClick={onSubmit}
            disabled={disabled}
            className="flex-1 max-w-[200px] gradient-primary text-primary-foreground font-semibold h-12"
          >
            <Send className="mr-2 h-4 w-4" />
            Enviar Pedido
          </Button>
        )}
      </div>
    </div>
  );
}