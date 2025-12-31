import { ShoppingCart } from 'lucide-react';

interface OrderHeaderProps {
  title?: string;
}

export function OrderHeader({ title }: OrderHeaderProps) {
  return (
    <header className="gradient-primary px-4 py-4 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20">
          <ShoppingCart className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-primary-foreground">
            {title || 'Sistema de Pedidos'}
          </h1>
          <p className="text-sm text-primary-foreground/80">Faça seu pedido abaixo</p>
        </div>
      </div>
    </header>
  );
}
