import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Settings, AlertCircle, ArrowLeft, Loader2, LogOut } from 'lucide-react';
import { useEntidades, useProdutos, usePedidos, useLojas } from '@/hooks/useSupabaseData';
import { ProductSearch } from '@/components/order/ProductSearch';
import { ProductCard } from '@/components/order/ProductCard';
import { OrderFooter } from '@/components/order/OrderFooter';
import { StoreSelect } from '@/components/order/StoreSelect';
import { useToast } from '@/hooks/use-toast';
import { PedidoItem } from '@/types';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useAcesso } from '@/store/useLojaAuth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const FormularioPedido = () => {
  const { entidadeId } = useParams<{ entidadeId: string }>();
  const { entidades, loading: loadingEntidades } = useEntidades();
  const { produtos, loading: loadingProdutos } = useProdutos();
  const { lojas, loading: loadingLojas } = useLojas();
  const { addPedido } = usePedidos();
  const { toast } = useToast();
  const { logout, setUltimaLojaId } = useAcesso();

  const [searchQuery, setSearchQuery] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [observacoes, setObservacoes] = useState('');
  const [selectedLojaId, setSelectedLojaId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Campos de controle (rastreabilidade)
  const [nomeSolicitante, setNomeSolicitante] = useState('');
  const [emailSolicitante, setEmailSolicitante] = useState('');
  const [nomeColaborador, setNomeColaborador] = useState('');
  const [funcaoColaborador, setFuncaoColaborador] = useState('');
  const [matriculaFuncionario, setMatriculaFuncionario] = useState('');
  const [motivoSolicitacao, setMotivoSolicitacao] = useState('');

  // Encontra a entidade
  const entidade = entidades.find((e) => e.id === entidadeId);

  const isControle = entidade?.tipoPedido === 'controle';

  // Filtra produtos desta entidade (ativos e inativos) - usando N:N
  const produtosDaEntidade = produtos.filter(
    (p) => p.entidadeIds.includes(entidadeId!)
  );

  // Produtos ativos (para verificação de pedido vazio)
  const produtosAtivos = produtosDaEntidade.filter(p => p.status === 'ativo');

  const filteredProdutos = useMemo(() => {
    // Ordenar: ativos primeiro, depois inativos
    const sorted = [...produtosDaEntidade].sort((a, b) => {
      if (a.status === 'ativo' && b.status !== 'ativo') return -1;
      if (a.status !== 'ativo' && b.status === 'ativo') return 1;
      return 0;
    });

    if (!searchQuery.trim()) return sorted;

    const query = searchQuery.toLowerCase();
    return sorted.filter(
      (p) =>
        p.nome.toLowerCase().includes(query) ||
        p.codigo.toLowerCase().includes(query)
    );
  }, [produtosDaEntidade, searchQuery]);

  const handleQuantityChange = (produtoId: string, quantidade: number) => {
    setQuantities((prev) => ({
      ...prev,
      [produtoId]: quantidade,
    }));
  };

  const selectedItems = Object.entries(quantities).filter(([_, qty]) => qty > 0);
  const itemCount = selectedItems.reduce((acc, [_, qty]) => acc + qty, 0);

  // Dados para o modal de confirmação
  const selectedLoja = lojas.find(l => l.id === selectedLojaId);
  const produtosSelecionados = selectedItems.map(([produtoId, qty]) => {
    const produto = produtos.find(p => p.id === produtoId);
    return {
      nome: produto?.nome || 'Produto',
      codigo: produto?.codigo || '',
      quantidade: qty
    };
  });

  const handleOpenConfirmation = () => {
    if (!selectedLojaId) {
      toast({
        title: 'Selecione uma loja',
        description: 'É necessário escolher a loja/setor.',
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

    setShowConfirmation(true);
  };

  const handleSubmit = async () => {
    setShowConfirmation(false);
    setIsSubmitting(true);

    const itens: PedidoItem[] = selectedItems.map(([produtoId, quantidade]) => ({
      produtoId,
      quantidade,
    }));

    const result = await addPedido({
      lojaId: selectedLojaId!,
      entidadeId: entidadeId!,
      observacoes: observacoes.trim() || undefined,
      itens,
    });

    setIsSubmitting(false);

    if (result) {
      // Salva a loja usada para histórico local
      setUltimaLojaId(selectedLojaId!);
      
      // Reset form
      setQuantities({});
      setSearchQuery('');
      setObservacoes('');

      toast({
        title: 'Pedido enviado com sucesso!',
        description: `${selectedItems.length} produto(s) foram solicitados.`,
      });
    } else {
      toast({
        title: 'Erro ao enviar pedido',
        description: 'Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const isLoading = loadingEntidades || loadingProdutos || loadingLojas;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Se entidade não existe
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
              Voltar ao início
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Se entidade NÃO está aceitando pedidos
  if (!entidade.aceitandoPedidos) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="h-16 w-16 text-amber-500 mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Pedidos Fechados</h1>
          <p className="text-muted-foreground">
            Os pedidos para <strong>"{entidade.nome}"</strong> estão fechados no momento.
          </p>
          <p className="text-muted-foreground">Aguarde a próxima abertura.</p>
          <Link to="/">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar e escolher outro tipo
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
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
          <Button
            variant="ghost"
            size="sm"
            className="text-primary-foreground hover:bg-primary-foreground/20"
            onClick={logout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
        <div className="px-4 pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{entidade.nome}</h1>
            <p className="text-sm text-primary-foreground/80">Formulário de Pedido</p>
          </div>
          <Link
            to="/admin"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30 transition-colors"
          >
            <Settings className="h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* Seleção de Loja */}
      <StoreSelect 
        lojas={lojas} 
        selectedId={selectedLojaId} 
        onSelect={setSelectedLojaId} 
      />

      {/* Alerta se não há produtos ativos */}
      {produtosAtivos.length === 0 && (
        <div className="px-4 py-2">
          <Alert variant="destructive" className="bg-red-50 border-red-200">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="font-semibold">Sem produtos disponíveis</AlertTitle>
            <AlertDescription>
              Não há produtos ativos para pedido nesta categoria no momento.
            </AlertDescription>
          </Alert>
        </div>
      )}

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

        {filteredProdutos.length === 0 && produtosDaEntidade.length > 0 && (
          <div className="py-8 text-center text-muted-foreground">
            Nenhum produto encontrado.
          </div>
        )}
      </div>

      {/* Campo ÚNICO de Observações - no final */}
      {produtosDaEntidade.length > 0 && (
        <div className="px-4 py-4 border-t border-border mt-4">
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
        onSubmit={handleOpenConfirmation}
        disabled={selectedItems.length === 0 || !selectedLojaId || isSubmitting}
        pedidosFechados={false}
      />

      {/* Modal de Confirmação */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Pedido</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                {/* Nome da Loja */}
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-sm text-muted-foreground">Loja</p>
                  <p className="font-semibold text-foreground">{selectedLoja?.nome}</p>
                </div>

                {/* Quantidade Total */}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total de itens:</span>
                  <span className="font-bold text-lg text-primary">{itemCount}</span>
                </div>

                {/* Lista de Produtos */}
                <div className="border rounded-lg max-h-[200px] overflow-y-auto">
                  <div className="p-2 space-y-1">
                    {produtosSelecionados.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm py-1 border-b last:border-0">
                        <span className="text-foreground truncate max-w-[200px]">
                          {item.nome}
                        </span>
                        <span className="font-medium text-primary ml-2">
                          x{item.quantidade}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>
              Confirmar Envio
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FormularioPedido;
