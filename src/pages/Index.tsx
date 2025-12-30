import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Settings, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { OrderHeader } from '@/components/order/OrderHeader';
import { StoreSelect } from '@/components/order/StoreSelect';
import { ProductSearch } from '@/components/order/ProductSearch';
import { ProductCard } from '@/components/order/ProductCard';
import { OrderFooter } from '@/components/order/OrderFooter';
import { useToast } from '@/hooks/use-toast';
import { PedidoItem } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const Index = () => {
  const { lojas, produtos, addPedido, pedidosAbertos } = useAppStore();
  const { toast } = useToast();

  const [selectedLojaId, setSelectedLojaId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const produtosDisponiveis = produtos.filter((p) => p.status === 'disponivel');

  const filteredProdutos = useMemo(() => {
    if (!searchQuery.trim()) return produtosDisponiveis;

    const query = searchQuery.toLowerCase();
    return produtosDisponiveis.filter(
      (p) =>
        p.nome.toLowerCase().includes(query) ||
        p.codigo.toLowerCase().includes(query)
    );
  }, [produtosDisponiveis, searchQuery]);

  const handleQuantityChange = (produtoId: string, quantidade: number) => {
    setQuantities((prev) => ({
      ...prev,
      [produtoId]: quantidade,
    }));
  };

  const selectedItems = Object.entries(quantities).filter(([_, qty]) => qty > 0);
  const itemCount = selectedItems.reduce((acc, [_, qty]) => acc + qty, 0);

  const handleSubmit = () => {
    // Verifica se pedidos estão abertos
    if (!pedidosAbertos) {
      toast({
        title: 'Pedidos fechados',
        description: 'Os pedidos estão fechados no momento. Aguarde a próxima abertura.',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedLojaId) {
      toast({
        title: 'Selecione uma loja',
        description: 'Por favor, escolha uma loja antes de enviar o pedido.',
        variant: 'destructive',
      });
      return;
    }

    if (selectedItems.length === 0) {
      toast({
        title: 'Nenhum item selecionado',
        description: 'Adicione pelo menos um produto ao pedido.',
        variant: 'destructive',
      });
      return;
    }

    const itens: PedidoItem[] = selectedItems.map(([produtoId, quantidade]) => ({
      produtoId,
      quantidade,
    }));

    const novoPedido = {
      id: Date.now().toString(),
      lojaId: selectedLojaId,
      data: new Date(),
      status: 'pendente' as const,
      itens,
    };

    addPedido(novoPedido);

    // Reset form
    setSelectedLojaId(null);
    setQuantities({});
    setSearchQuery('');

    toast({
      title: 'Pedido enviado com sucesso!',
      description: `${selectedItems.length} produto(s) foram solicitados.`,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <OrderHeader />

      {/* Admin Link */}
      <div className="absolute right-4 top-4">
        <Link
          to="/admin"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30 transition-colors"
        >
          <Settings className="h-5 w-5" />
        </Link>
      </div>

      {/* Alerta de pedidos fechados */}
      {!pedidosAbertos && (
        <div className="px-4 py-2">
          <Alert variant="destructive" className="bg-red-50 border-red-200">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="font-semibold">Pedidos Fechados</AlertTitle>
            <AlertDescription>
              Os pedidos estão fechados no momento. Aguarde a próxima abertura para fazer sua solicitação.
            </AlertDescription>
          </Alert>
        </div>
      )}

      <StoreSelect
        lojas={lojas}
        selectedId={selectedLojaId}
        onSelect={setSelectedLojaId}
      />

      <ProductSearch value={searchQuery} onChange={setSearchQuery} />

      <div className="space-y-3 px-4 py-2">
        {filteredProdutos.map((produto) => (
          <ProductCard
            key={produto.id}
            produto={produto}
            quantidade={quantities[produto.id] || 0}
            onQuantityChange={handleQuantityChange}
            disabled={!pedidosAbertos}
          />
        ))}

        {filteredProdutos.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">
            Nenhum produto encontrado.
          </div>
        )}
      </div>

      <OrderFooter
        itemCount={itemCount}
        onSubmit={handleSubmit}
        disabled={!selectedLojaId || selectedItems.length === 0 || !pedidosAbertos}
        pedidosFechados={!pedidosAbertos}
      />
    </div>
  );
};

export default Index;