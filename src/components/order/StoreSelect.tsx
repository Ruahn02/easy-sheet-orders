import { useState } from 'react';
import { Check, ChevronsUpDown, Store } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Loja } from '@/types';

interface StoreSelectProps {
  lojas: Loja[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function StoreSelect({ lojas, selectedId, onSelect }: StoreSelectProps) {
  const [open, setOpen] = useState(false);
  
  const selectedLoja = lojas.find((l) => l.id === selectedId);
  const lojasAtivas = lojas.filter((l) => l.status === 'ativo');

  return (
    <div className="p-4">
      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
        <Store className="h-4 w-4 text-primary" />
        Selecione a Loja/Setor
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-card border-border hover:bg-secondary"
          >
            {selectedLoja ? selectedLoja.nome : 'Escolha uma loja...'}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-popover border-border z-50">
          <Command>
            <CommandInput placeholder="Buscar loja..." className="h-10" />
            <CommandList>
              <CommandEmpty>Nenhuma loja encontrada.</CommandEmpty>
              <CommandGroup>
                {lojasAtivas.map((loja) => (
                  <CommandItem
                    key={loja.id}
                    value={loja.nome}
                    onSelect={() => {
                      onSelect(loja.id);
                      setOpen(false);
                    }}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        selectedId === loja.id ? 'opacity-100 text-primary' : 'opacity-0'
                      )}
                    />
                    {loja.nome}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
