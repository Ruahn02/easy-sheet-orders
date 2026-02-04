import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ClipboardList, Loader2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAcesso } from '@/store/useLojaAuth';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PedidoEnviado {
  id: string;
  data: string;
  lojaNome: string;
  entidadeNome: string;
}

const PedidosEnviados = () => {
  const { ultimaLojaId } = useAcesso();
  const [pedidos, setPedidos] = useState<PedidoEnviado[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPedidos = async () => {
      if (!ultimaLojaId) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('pedidos')
        .select(`
          id,
          data,
          lojas!pedidos_loja_id_fkey(nome),
          entidades!pedidos_entidade_id_fkey(nome)
        `)
        .eq('loja_id', ultimaLojaId)
        .order('data', { ascending: false });

      if (!error && data) {
        const pedidosFormatados = data.map((p: any) => ({
          id: p.id,
          data: p.data,
          lojaNome: p.lojas?.nome || 'Loja',
          entidadeNome: p.entidades?.nome || 'Pedido',
        }));
        setPedidos(pedidosFormatados);
      }

      setLoading(false);
    };

    fetchPedidos();
  }, [ultimaLojaId]);

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
      <div className="gradient-primary text-primary-foreground">
        <div className="px-4 py-3 flex items-center justify-between">
          <Link to="/">
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>
        <div className="px-4 pb-4 text-center">
          <h1 className="text-xl font-bold">Pedidos Enviados</h1>
          <p className="text-sm text-primary-foreground/80">Comprovante de envio</p>
        </div>
      </div>

      {/* Aviso sobre filtragem */}
      <div className="p-4">
        <Alert className="bg-muted/50 border-muted">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm text-muted-foreground">
            Esta tela mostra apenas pedidos enviados a partir deste computador.
            Pedidos feitos em outro computador não aparecem aqui.
          </AlertDescription>
        </Alert>
      </div>

      {/* Lista de Pedidos ou Estado Vazio */}
      <div className="px-4 pb-8">
        {pedidos.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardList className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Nenhum pedido enviado
            </h2>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              Nenhum pedido foi enviado a partir deste computador.
              Faça seu primeiro pedido para vê-lo aqui.
            </p>
            <Link to="/">
              <Button variant="outline" className="mt-6">
                Fazer um pedido
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {pedidos.map((pedido) => (
              <div
                key={pedido.id}
                className="bg-card border border-border rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="font-mono text-sm text-muted-foreground">
                    #{pedido.id.substring(0, 8).toUpperCase()}
                  </span>
                  <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded">
                    Enviado ao Almoxarifado
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-foreground">
                    {format(new Date(pedido.data), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {pedido.lojaNome}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {pedido.entidadeNome}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PedidosEnviados;
