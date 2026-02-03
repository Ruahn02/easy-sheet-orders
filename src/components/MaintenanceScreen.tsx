import { Wrench } from 'lucide-react';

export function MaintenanceScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="mx-auto w-24 h-24 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
          <Wrench className="h-12 w-12 text-amber-600 dark:text-amber-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Sistema em Manutenção
          </h1>
          <p className="text-muted-foreground">
            Estamos realizando ajustes no sistema.
            Em breve ele estará disponível novamente.
          </p>
        </div>
      </div>
    </div>
  );
}
