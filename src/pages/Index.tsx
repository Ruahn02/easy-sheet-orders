import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings, Package, Lock, Loader2 } from 'lucide-react';
import { useEntidades } from '@/hooks/useSupabaseData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const Index = () => {
  const { entidades, loading } = useEntidades();
  const [entidadeFechadaDialog, setEntidadeFechadaDialog] = useState<string | null>(null);

  const handleEntidadeClick = (entidade: typeof entidades[0]) => {
    if (!entidade.aceitandoPedidos) {
      setEntidadeFechadaDialog(entidade.nome);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-primary px-4 py-6 shadow-lg relative">
        <div className="absolute right-4 top-4">
          <Link
            to="/admin"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30 transition-colors"
          >
            <Settings className="h-5 w-5" />
          </Link>
        </div>
        <div className="text-center pt-4">
          <h1 className="text-2xl font-bold text-primary-foreground">Sistema de Pedidos</h1>
          <p className="text-sm text-primary-foreground/80 mt-1">
            Escolha o tipo de pedido abaixo
          </p>
        </div>
      </header>

      {/* Lista de Entidades */}
      <div className="p-4 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Tipos de Pedido</h2>
        
        {entidades.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {entidades.map((entidade) => (
              entidade.aceitandoPedidos ? (
                <Link
                  key={entidade.id}
                  to={`/pedido/${entidade.id}`}
                  className="block"
                >
                  <div className="rounded-lg border bg-card p-4 transition-all border-border hover:border-primary hover:shadow-card cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg gradient-primary">
                        <Package className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{entidade.nome}</h3>
                        <p className="text-sm text-muted-foreground">
                          Clique para fazer pedido
                        </p>
                      </div>
                      <Badge className="bg-accent text-accent-foreground">
                        🟢 Aberto
                      </Badge>
                    </div>
                  </div>
                </Link>
              ) : (
                <div
                  key={entidade.id}
                  onClick={() => handleEntidadeClick(entidade)}
                  className="block cursor-pointer"
                >
                  <div className="rounded-lg border bg-card p-4 transition-all border-border/50 opacity-60 hover:opacity-80">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                        <Lock className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{entidade.nome}</h3>
                        <p className="text-sm text-muted-foreground">
                          Pedidos fechados
                        </p>
                      </div>
                      <Badge className="bg-muted text-muted-foreground">
                        🔴 Fechado
                      </Badge>
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma entidade de pedido cadastrada.</p>
          </div>
        )}
      </div>

      {/* Link para Admin */}
      <div className="p-4">
        <Link to="/admin">
          <Button variant="outline" className="w-full">
            <Settings className="h-4 w-4 mr-2" />
            Acessar área administrativa
          </Button>
        </Link>
      </div>

      {/* Dialog para entidade fechada */}
      <Dialog open={!!entidadeFechadaDialog} onOpenChange={() => setEntidadeFechadaDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Pedidos Fechados</DialogTitle>
            <DialogDescription className="pt-2">
              Os pedidos para <strong>"{entidadeFechadaDialog}"</strong> estão fechados no momento.
              <br /><br />
              Aguarde a próxima abertura.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setEntidadeFechadaDialog(null)}>
            Entendi
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
