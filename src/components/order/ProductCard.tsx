import { Minus, Plus, Package, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Produto } from '@/types';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  produto: Produto;
  quantidade: number;
  onQuantityChange: (produtoId: string, quantidade: number) => void;
  disabled?: boolean;
}

export function ProductCard({ produto, quantidade, onQuantityChange, disabled }: ProductCardProps) {
  const isInativo = produto.status === 'inativo';
  const isDisabled = isInativo || disabled;
  
  const handleDecrement = () => {
    if (quantidade > 0 && !isInativo) {
      onQuantityChange(produto.id, quantidade - 1);
    }
  };
  
  const handleIncrement = () => {
    if (quantidade < produto.qtdMaxima && !isInativo) {
      onQuantityChange(produto.id, quantidade + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isInativo) return;
    
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
        isInativo && "opacity-50 bg-muted/50 border-muted",
        !isDisabled && quantidade > 0 && "border-primary shadow-card",
        !isDisabled && quantidade === 0 && "border-border"
      )}
    >
      {/* Product Image */}
      <div className={cn(
        "h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-secondary",
        isInativo && "grayscale"
      )}>
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
        <div className="flex items-center gap-2">
          <p className={cn(
            "text-xs font-medium",
            isInativo ? "text-muted-foreground" : "text-primary"
          )}>{produto.codigo}</p>
          {isInativo && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-muted text-muted-foreground">
              <Ban className="h-2.5 w-2.5 mr-0.5" />
              INDISPONÍVEL
            </Badge>
          )}
        </div>
        <p className={cn(
          "text-sm font-semibold truncate",
          isInativo ? "text-muted-foreground" : "text-foreground"
        )}>{produto.nome}</p>
        {isInativo ? (
          <p className="text-xs text-muted-foreground italic">Temporariamente indisponível</p>
        ) : (
          <p className="text-xs text-muted-foreground">Máx: {produto.qtdMaxima}</p>
        )}
      </div>

      {/* Quantity Controls - Hidden for inactive */}
      {isInativo ? (
        <div className="flex items-center justify-center h-8 w-24">
          <Ban className="h-5 w-5 text-muted-foreground/50" />
        </div>
      ) : (
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
      )}
    </div>
  );
}
