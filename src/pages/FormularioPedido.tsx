import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Settings, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { OrderHeader } from '@/components/order/OrderHeader';
import { StoreSelect } from '@/components/order/StoreSelect';
import { ProductSearch } from '@/components/order/ProductSearch';
import { ProductCard } from '@/components/order/ProductCard';
import { OrderFooter } from '@/components/order/OrderFooter';
import { useToast } from '@/hooks/use-toast';
import { PedidoItem } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const FormularioPedido = () => {
  const { entidadeId } = useParams<{ entidadeId: string }>();
  const { lojas, produtos, entidades, addPedido } = useAppStore();
  const { toast } = useToast();

  const [selectedLojaId, setSelectedLojaId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [observacoes, setObservacoes] = useState('');

  // Encontra a entidade
  const entidade = entidades.find((e) => e.id === entidadeId);

  // Filtra produtos desta entidade que estão ABERTOS
  const produtosDisponiveis = produtos.filter(
    (p) => p.entidadeId === entidadeId && p.status === 'aberto'
  );

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

  // Lojas ativas
  const lojasAtivas = lojas.filter((l) => l.status === 'ativo');

  const handleSubmit = () => {
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
      entidadeId: entidadeId!,
      observacoes: observacoes.trim() || undefined,
      data: new Date(),
      status: 'pendente' as const,
      itens,
    };

    addPedido(novoPedido);

    // Reset form
    setSelectedLojaId(null);
    setQuantities({});
    setSearchQuery('');
    setObservacoes('');

    toast({
      title: 'Pedido enviado com sucesso!',
      description: `${selectedItems.length} produto(s) foram solicitados.`,
    });
  };

  // Se entidade não existe ou está inativa
  if (!entidade) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Entidade não encontrada</h1>
          <p className="text-muted-foreground">O link de pedido acessado não existe.</p>
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (entidade.status === 'inativo') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <AlertCircle className="h-16 w-16 text-amber-500 mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Pedidos fechados</h1>
          <p className="text-muted-foreground">
            Os pedidos para "{entidade.nome}" estão fechados no momento.
          </p>
          <p className="text-muted-foreground">Aguarde a próxima abertura.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <OrderHeader title={entidade.nome} />

      {/* Admin Link */}
      <div className="absolute right-4 top-4">
        <Link
          to="/admin"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30 transition-colors"
        >
          <Settings className="h-5 w-5" />
        </Link>
      </div>

      {/* Alerta se não há produtos abertos */}
      {produtosDisponiveis.length === 0 && (
        <div className="px-4 py-2">
          <Alert variant="destructive" className="bg-red-50 border-red-200">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="font-semibold">Sem produtos disponíveis</AlertTitle>
            <AlertDescription>
              Não há produtos abertos para pedido nesta categoria no momento.
            </AlertDescription>
          </Alert>
        </div>
      )}

      <StoreSelect
        lojas={lojasAtivas}
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
          />
        ))}

        {filteredProdutos.length === 0 && produtosDisponiveis.length > 0 && (
          <div className="py-8 text-center text-muted-foreground">
            Nenhum produto encontrado.
          </div>
        )}
      </div>

      {/* Campo de Observações */}
      {produtosDisponiveis.length > 0 && (
        <div className="px-4 py-4">
          <label className="text-sm font-medium text-foreground mb-2 block">
            Observações (opcional)
          </label>
          <Textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Alguma observação ou pedido extra? Digite aqui..."
            className="bg-card"
            rows={3}
          />
        </div>
      )}

      <OrderFooter
        itemCount={itemCount}
        onSubmit={handleSubmit}
        disabled={!selectedLojaId || selectedItems.length === 0}
        pedidosFechados={false}
      />
    </div>
  );
};

export default FormularioPedido;
