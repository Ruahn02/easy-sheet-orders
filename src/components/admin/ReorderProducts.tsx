import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Package, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Produto } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface SortableCardProps {
  produto: Produto;
}

function SortableCard({ produto }: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: produto.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 rounded-lg border border-border bg-card ${
        isDragging ? 'opacity-50 shadow-lg z-50' : ''
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
      >
        <GripVertical className="h-5 w-5" />
      </button>
      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-secondary">
        {produto.fotoUrl ? (
          <img src={produto.fotoUrl} alt={produto.nome} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <span className="font-mono text-xs text-primary">{produto.codigo}</span>
        <p className="font-medium text-foreground truncate">{produto.nome}</p>
      </div>
    </div>
  );
}

interface ReorderProductsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  produtos: Produto[];
  onSave: (orderedIds: string[]) => Promise<void>;
}

export function ReorderProducts({ open, onOpenChange, produtos, onSave }: ReorderProductsProps) {
  const [items, setItems] = useState<Produto[]>([]);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Sync items when dialog opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setItems([...produtos]);
    }
    onOpenChange(isOpen);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((prev) => {
        const oldIndex = prev.findIndex((p) => p.id === active.id);
        const newIndex = prev.findIndex((p) => p.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(items.map((p) => p.id));
      toast({ title: 'Ordem salva com sucesso!' });
      onOpenChange(false);
    } catch {
      toast({ title: 'Erro ao salvar ordem', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-card max-h-[90vh] flex flex-col overflow-hidden sm:max-w-lg">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Reordenar Catálogo</DialogTitle>
          <p className="text-sm text-muted-foreground">Arraste os produtos para definir a ordem</p>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto space-y-2 py-2 px-1" style={{ WebkitOverflowScrolling: 'touch' }}>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((p) => p.id)} strategy={verticalListSortingStrategy}>
              {items.map((produto) => (
                <SortableCard key={produto.id} produto={produto} />
              ))}
            </SortableContext>
          </DndContext>
          {items.length === 0 && (
            <p className="text-center text-muted-foreground py-8">Nenhum produto para reordenar</p>
          )}
        </div>
        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving || items.length === 0}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Salvar Ordem
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
