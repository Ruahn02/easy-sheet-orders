import { Link } from 'react-router-dom';
import { Settings, Package } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Index = () => {
  const { entidades } = useAppStore();

  const entidadesAtivas = entidades.filter((e) => e.status === 'ativo');

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
        <h2 className="text-lg font-semibold text-foreground">Tipos de Pedido Disponíveis</h2>
        
        {entidadesAtivas.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {entidadesAtivas.map((entidade) => (
              <Link
                key={entidade.id}
                to={`/pedido/${entidade.id}`}
                className="block"
              >
                <div className="rounded-lg border border-border bg-card p-4 transition-all hover:border-primary hover:shadow-card">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg gradient-primary">
                      <Package className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{entidade.nome}</h3>
                      <p className="text-sm text-muted-foreground">Clique para fazer pedido</p>
                    </div>
                    <Badge className="bg-accent text-accent-foreground">Aberto</Badge>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma entidade de pedido disponível no momento.</p>
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
    </div>
  );
};

export default Index;
