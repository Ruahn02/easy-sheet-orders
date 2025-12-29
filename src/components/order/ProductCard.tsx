import { Minus, Plus, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Produto } from '@/types';

interface ProductCardProps {
  produto: Produto;
  quantidade: number;
  onQuantityChange: (produtoId: string, quantidade: number) => void;
}

export function ProductCard({ produto, quantidade, onQuantityChange }: ProductCardProps) {
  const isDisabled = produto.status === 'indisponivel';
  
  const handleDecrement = () => {
    if (quantidade > 0) {
      onQuantityChange(produto.id, quantidade - 1);
    }
  };
  
  const handleIncrement = () => {
    if (quantidade < produto.qtdMaxima) {
      onQuantityChange(produto.id, quantidade + 1);
    }
  };

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border bg-card p-3 transition-all ${
        isDisabled ? 'opacity-50' : quantidade > 0 ? 'border-primary shadow-card' : 'border-border'
      }`}
    >
      {/* Product Image */}
      <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-secondary">
        {produto.fotoUrl ? (
          <img
            src={produto.fotoUrl}
            alt={produto.nome}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-primary">{produto.codigo}</p>
        <p className="text-sm font-semibold text-foreground truncate">{produto.nome}</p>
        <p className="text-xs text-muted-foreground">Máx: {produto.qtdMaxima}</p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={handleDecrement}
          disabled={isDisabled || quantidade === 0}
        >
          <Minus className="h-4 w-4" />
        </Button>
        
        <span className={`w-8 text-center font-bold ${quantidade > 0 ? 'text-primary' : 'text-foreground'}`}>
          {quantidade}
        </span>
        
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          onClick={handleIncrement}
          disabled={isDisabled || quantidade >= produto.qtdMaxima}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
