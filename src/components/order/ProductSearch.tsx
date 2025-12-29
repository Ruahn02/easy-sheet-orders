import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ProductSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function ProductSearch({ value, onChange }: ProductSearchProps) {
  return (
    <div className="px-4 pb-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar produto por nome ou código..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10 bg-card border-border"
        />
      </div>
    </div>
  );
}
