import * as React from "react";
import { ChevronsUpDown, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface Option {
  value: string;
  label: string;
}

interface MultiSelectFilterProps {
  options: Option[];
  selected: string[];
  onSelectionChange: (selected: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  allLabel?: string;
  className?: string;
}

export function MultiSelectFilter({
  options,
  selected,
  onSelectionChange,
  placeholder = "Selecionar...",
  searchPlaceholder = "Buscar...",
  emptyMessage = "Nenhum item encontrado.",
  allLabel = "Todos",
  className,
}: MultiSelectFilterProps) {
  const [open, setOpen] = React.useState(false);

  const isAllSelected = selected.length === 0;

  const toggleOption = (value: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    if (selected.includes(value)) {
      onSelectionChange(selected.filter((v) => v !== value));
    } else {
      onSelectionChange([...selected, value]);
    }
  };

  const selectSingle = (value: string) => {
    onSelectionChange([value]);
    setOpen(false);
  };

  const selectAll = () => {
    onSelectionChange([]);
    setOpen(false);
  };

  const displayText = () => {
    if (isAllSelected) return allLabel;
    if (selected.length === 1) {
      return options.find((o) => o.value === selected[0])?.label || placeholder;
    }
    return `${selected.length} selecionados`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between font-normal", className)}
        >
          <span className="truncate">{displayText()}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0" align="start">
        <Command
          filter={(value, search) => {
            if (value === "__all__") {
              return allLabel.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
            }
            const option = options.find((o) => o.value === value);
            if (!option) return 0;
            return option.label.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
          }}
        >
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              <CommandItem value="__all__" onSelect={selectAll}>
                <Checkbox
                  checked={isAllSelected}
                  className="mr-2 h-4 w-4 pointer-events-none"
                  tabIndex={-1}
                />
                {allLabel}
              </CommandItem>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => toggleOption(option.value)}
                >
                  <Checkbox
                    checked={selected.includes(option.value)}
                    className="mr-2 h-4 w-4 pointer-events-none"
                    tabIndex={-1}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
        {selected.length > 0 && (
          <div className="border-t border-border p-2 flex flex-wrap gap-1">
            {selected.map((val) => {
              const opt = options.find((o) => o.value === val);
              return (
                <Badge
                  key={val}
                  variant="secondary"
                  className="text-xs cursor-pointer"
                  onClick={() => toggleOption(val)}
                >
                  {opt?.label}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              );
            })}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
