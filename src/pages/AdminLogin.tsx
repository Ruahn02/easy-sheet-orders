import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, UserPlus, ArrowLeft, KeyRound, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useCodigoAdmin } from '@/hooks/useSupabaseData';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { codigoAdmin, loading: loadingCodigo } = useCodigoAdmin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [codigo, setCodigo] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 500));

    // Verifica o código admin
    if (codigo !== codigoAdmin) {
      toast({
        title: 'Código Admin inválido',
        description: 'O código de acesso está incorreto. Solicite ao administrador.',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    toast({
      title: 'Login realizado!',
      description: 'Bem-vindo ao painel administrativo.',
    });

    navigate('/admin/dashboard');
    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 500));

    // Verifica o código admin
    if (codigo !== codigoAdmin) {
      toast({
        title: 'Código Admin inválido',
        description: 'O código de acesso está incorreto. Solicite ao administrador.',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    toast({
      title: 'Conta criada!',
      description: 'Você já pode acessar o sistema.',
    });

    navigate('/admin/dashboard');
    setIsLoading(false);
  };

  if (loadingCodigo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full gradient-primary">
            <Lock className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Área Administrativa</h1>
          <p className="text-muted-foreground">Acesse o painel de controle</p>
        </div>

        {/* Tabs */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-card">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login" className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Entrar
              </TabsTrigger>
              <TabsTrigger value="register" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Criar Conta
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Código Admin
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Digite o código de acesso"
                      value={codigo}
                      onChange={(e) => setCodigo(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Solicite o código ao administrador do sistema
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full gradient-primary text-primary-foreground font-semibold h-12"
                  disabled={isLoading}
                >
                  {isLoading ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Código Admin
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Digite o código de acesso"
                      value={codigo}
                      onChange={(e) => setCodigo(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Solicite o código ao administrador do sistema
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full gradient-primary text-primary-foreground font-semibold h-12"
                  disabled={isLoading}
                >
                  {isLoading ? 'Criando...' : 'Criar Conta'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        {/* Back Link */}
        <Link
          to="/"
          className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao formulário de pedidos
        </Link>
      </div>
    </div>
  );
}
