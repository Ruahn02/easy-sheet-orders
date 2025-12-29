import { Copy, ExternalLink, Link2, ShoppingCart, Settings } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function Links() {
  const { toast } = useToast();

  const baseUrl = window.location.origin;
  const formLink = baseUrl;
  const adminLink = `${baseUrl}/admin`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Link copiado!' });
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
      </div>
    </AdminLayout>
  );
}
