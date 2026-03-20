import { Store } from 'lucide-react';
import { Loja } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface StoreSelectProps {
  lojas: Loja[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function StoreSelect({ lojas, selectedId, onSelect }: StoreSelectProps) {
  const lojasAtivas = lojas.filter((l) => l.status === 'ativo');

  return (
    <div className="p-4">
      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
        <Store className="h-4 w-4 text-primary" />
        Selecione a Loja/Setor
      </label>
      <Select value={selectedId || undefined} onValueChange={onSelect}>
        <SelectTrigger className="w-full bg-card border-border">
          <SelectValue placeholder="Escolha uma loja..." />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border z-50">
          {lojasAtivas.map((loja) => (
            <SelectItem key={loja.id} value={loja.id}>
              {loja.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
