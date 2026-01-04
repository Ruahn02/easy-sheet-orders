import { Minus, Plus, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Produto } from '@/types';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  produto: Produto;
  quantidade: number;
  onQuantityChange: (produtoId: string, quantidade: number) => void;
  disabled?: boolean;
}

export function ProductCard({ produto, quantidade, onQuantityChange, disabled }: ProductCardProps) {
  const isDisabled = produto.status === 'inativo' || disabled;
  
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    
    if (isNaN(value) || value < 0) {
      onQuantityChange(produto.id, 0);
    } else if (value > produto.qtdMaxima) {
      onQuantityChange(produto.id, produto.qtdMaxima);
    } else {
      onQuantityChange(produto.id, value);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border bg-card p-3 transition-all",
        isDisabled && "opacity-50",
        !isDisabled && quantidade > 0 && "border-primary shadow-card",
        !isDisabled && quantidade === 0 && "border-border"
      )}
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
        
        <input
          type="number"
          min={0}
          max={produto.qtdMaxima}
          value={quantidade}
          onChange={handleInputChange}
          onFocus={(e) => e.target.select()}
          disabled={isDisabled}
          className={cn(
            "w-12 text-center font-bold border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
            quantidade > 0 ? "text-primary border-primary" : "text-foreground border-border"
          )}
        />
        
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
