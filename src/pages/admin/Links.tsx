import { useState } from 'react';
import { Copy, ExternalLink, Link2, ShoppingCart, Settings, KeyRound, Eye, EyeOff, Save } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/store/useAppStore';

export default function Links() {
  const { toast } = useToast();
  const { codigoAdmin, setCodigoAdmin } = useAppStore();
  
  const [showCodigo, setShowCodigo] = useState(false);
  const [novoCodigo, setNovoCodigo] = useState(codigoAdmin);
  const [editandoCodigo, setEditandoCodigo] = useState(false);

  const baseUrl = window.location.origin;
  const formLink = baseUrl;
  const adminLink = `${baseUrl}/admin`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Link copiado!' });
  };

  const copyCodigo = () => {
    navigator.clipboard.writeText(codigoAdmin);
    toast({ title: 'Código Admin copiado!' });
  };

  const salvarNovoCodigo = () => {
    if (novoCodigo.trim().length < 4) {
      toast({
        title: 'Código muito curto',
        description: 'O código deve ter pelo menos 4 caracteres.',
        variant: 'destructive',
      });
      return;
    }
    setCodigoAdmin(novoCodigo.trim());
    setEditandoCodigo(false);
    toast({ title: 'Código Admin atualizado!' });
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Links de Acesso</h1>
          <p className="text-muted-foreground">Compartilhe os links do sistema</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Form Link */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
                  <ShoppingCart className="h-5 w-5 text-primary-foreground" />
                </div>
                Link de Solicitação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Compartilhe este link com as lojas/setores para que possam fazer pedidos.
                Não requer login.
              </p>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary text-sm">
                <Link2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate text-foreground">{formLink}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => copyToClipboard(formLink)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.open(formLink, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Abrir
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Admin Link */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                  <Settings className="h-5 w-5 text-accent-foreground" />
                </div>
                Link de Administração
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Link para acessar o painel administrativo. Requer login para acessar.
              </p>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary text-sm">
                <Link2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate text-foreground">{adminLink}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => copyToClipboard(adminLink)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.open(adminLink, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Abrir
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Código Admin */}
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500">
                <KeyRound className="h-5 w-5 text-white" />
              </div>
              Código Admin
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Este código é necessário para acessar a área administrativa. Compartilhe apenas com pessoas autorizadas.
            </p>
            
            {editandoCodigo ? (
              <div className="space-y-3">
                <Input
                  type="text"
                  value={novoCodigo}
                  onChange={(e) => setNovoCodigo(e.target.value)}
                  placeholder="Digite o novo código"
                  className="font-mono"
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setNovoCodigo(codigoAdmin);
                      setEditandoCodigo(false);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="flex-1 gradient-primary text-primary-foreground"
                    onClick={salvarNovoCodigo}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-white border text-sm">
                  <KeyRound className="h-4 w-4 text-amber-500 flex-shrink-0" />
                  <span className="font-mono text-foreground flex-1">
                    {showCodigo ? codigoAdmin : '••••••••'}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setShowCodigo(!showCodigo)}
                  >
                    {showCodigo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={copyCodigo}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar Código
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setEditandoCodigo(true)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Alterar Código
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
