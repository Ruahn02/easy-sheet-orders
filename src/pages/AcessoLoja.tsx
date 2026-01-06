import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCodigoAcesso } from '@/hooks/useSupabaseData';
import { useAcesso } from '@/store/useLojaAuth';
import { useToast } from '@/hooks/use-toast';

const AcessoLoja = () => {
  const [codigo, setCodigo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { validarCodigo } = useCodigoAcesso();
  const { setAcessoLiberado } = useAcesso();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!codigo.trim()) {
      toast({
        title: 'Digite o código',
        description: 'O código de acesso é obrigatório.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    const valido = await validarCodigo(codigo.trim());

    setIsLoading(false);

    if (valido) {
      setAcessoLiberado(true);
      toast({
        title: 'Acesso liberado!',
        description: 'Você pode fazer seus pedidos.',
      });
      navigate('/');
    } else {
      toast({
        title: 'Código inválido',
        description: 'Verifique o código e tente novamente.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo / Ícone */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 rounded-full gradient-primary flex items-center justify-center">
            <ShieldCheck className="h-10 w-10 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Acesso ao Sistema</h1>
            <p className="text-muted-foreground mt-1">Digite o código de acesso fornecido</p>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <KeyRound className="h-4 w-4" />
              Código de Acesso
            </label>
            <Input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              placeholder="Ex: ACESSO123"
              className="text-center text-lg font-mono tracking-widest uppercase"
              maxLength={20}
              autoFocus
            />
          </div>

          <Button
            type="submit"
            className="w-full gradient-primary text-primary-foreground"
            disabled={isLoading || !codigo.trim()}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Entrar
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Não tem um código? Entre em contato com o administrador.
        </p>
      </div>
    </div>
  );
};

export default AcessoLoja;
