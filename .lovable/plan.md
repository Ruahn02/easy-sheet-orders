

## Plano: Modo Manutencao Global

### Visao Geral

Implementar um sistema de manutencao que permite bloquear temporariamente o acesso das lojas ao sistema, enquanto administradores continuam com acesso normal e veem um banner de aviso.

---

### Arquitetura da Solucao

```text
+------------------+
|   configuracoes  |
|  (banco de dados)|
+--------+---------+
         |
         v
+--------+---------+
| useMaintenanceMode|  <-- Hook React
+--------+---------+
         |
    +----+----+
    |         |
    v         v
+-------+  +----------+
| Lojas |  |  Admin   |
+-------+  +----------+
    |           |
    v           v
+---------+ +----------+
|Tela de  | |Banner de |
|Manutencao| |Aviso     |
+---------+ +----------+
```

---

### 1. Inserir Configuracao no Banco

Usar o insert tool para adicionar a linha de configuracao:

```sql
INSERT INTO configuracoes (chave, valor)
VALUES ('maintenance_mode', 'false');
```

Nao e necessaria migration - a tabela ja existe com RLS permissiva.

---

### 2. Hook useMaintenanceMode

**Novo arquivo:** `src/hooks/useMaintenanceMode.ts`

```typescript
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useMaintenanceMode() {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchMaintenanceMode = useCallback(async () => {
    const { data, error } = await supabase
      .from('configuracoes')
      .select('valor')
      .eq('chave', 'maintenance_mode')
      .single();

    if (!error && data) {
      setIsMaintenanceMode(data.valor === 'true');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMaintenanceMode();
  }, [fetchMaintenanceMode]);

  const toggleMaintenanceMode = async () => {
    const newValue = !isMaintenanceMode;
    const { error } = await supabase
      .from('configuracoes')
      .update({ valor: newValue ? 'true' : 'false' })
      .eq('chave', 'maintenance_mode');

    if (!error) {
      setIsMaintenanceMode(newValue);
      return true;
    }
    return false;
  };

  return { 
    isMaintenanceMode, 
    loading, 
    toggleMaintenanceMode, 
    refetch: fetchMaintenanceMode 
  };
}
```

---

### 3. Componente MaintenanceScreen

**Novo arquivo:** `src/components/MaintenanceScreen.tsx`

Tela fullscreen para lojas quando em manutencao:

```typescript
import { Wrench } from 'lucide-react';

export function MaintenanceScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="mx-auto w-24 h-24 rounded-full bg-amber-100 
                        flex items-center justify-center">
          <Wrench className="h-12 w-12 text-amber-600" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Sistema em Manutencao
          </h1>
          <p className="text-muted-foreground">
            Estamos realizando ajustes no sistema.
            Em breve ele estara disponivel novamente.
          </p>
        </div>
      </div>
    </div>
  );
}
```

---

### 4. Componente MaintenanceBanner

**Novo arquivo:** `src/components/admin/MaintenanceBanner.tsx`

Banner fixo para admins:

```typescript
import { AlertTriangle } from 'lucide-react';

export function MaintenanceBanner() {
  return (
    <div className="bg-amber-500 text-amber-950 px-4 py-2 
                    flex items-center justify-center gap-2 text-sm font-medium">
      <AlertTriangle className="h-4 w-4" />
      <span>
        SISTEMA EM MANUTENCAO - Usuarios externos estao bloqueados no momento
      </span>
    </div>
  );
}
```

---

### 5. Atualizar App.tsx

Modificar o componente `RequireAcesso` para verificar manutencao:

```typescript
const RequireAcesso = ({ children }: { children: React.ReactNode }) => {
  const { acessoLiberado } = useAcesso();
  const { isMaintenanceMode, loading } = useMaintenanceMode();
  
  // Loading
  if (loading) {
    return <LoadingSpinner />;
  }
  
  // Manutencao bloqueia lojas
  if (isMaintenanceMode) {
    return <MaintenanceScreen />;
  }
  
  // Acesso normal
  if (!acessoLiberado) {
    return <Navigate to="/acesso" replace />;
  }
  
  return <>{children}</>;
};
```

---

### 6. Atualizar AdminLayout

Adicionar banner condicional:

```typescript
export function AdminLayout({ children }: AdminLayoutProps) {
  const { isMaintenanceMode, loading } = useMaintenanceMode();
  
  return (
    <div className="min-h-screen bg-background flex flex-col w-full">
      {/* Banner de Manutencao */}
      {!loading && isMaintenanceMode && <MaintenanceBanner />}
      
      <div className="flex flex-1">
        {/* Sidebar Desktop */}
        <aside className="hidden lg:flex w-64 ...">
          <SidebarContent />
        </aside>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Mobile Header */}
          <header className="lg:hidden ...">
            ...
          </header>
          
          <main className="flex-1 p-4 lg:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
```

---

### 7. Controle no Dashboard

Adicionar botao na area de admin do Dashboard:

```typescript
// No Dashboard.tsx
const { isMaintenanceMode, toggleMaintenanceMode } = useMaintenanceMode();
const [isToggling, setIsToggling] = useState(false);

const handleToggleMaintenance = async () => {
  setIsToggling(true);
  const success = await toggleMaintenanceMode();
  setIsToggling(false);
  
  if (success) {
    toast({
      title: isMaintenanceMode ? 'Manutencao desativada' : 'Manutencao ativada',
      description: isMaintenanceMode 
        ? 'Sistema liberado para usuarios.' 
        : 'Usuarios externos estao bloqueados.',
    });
  }
};

// No JSX do header:
<Button
  variant={isMaintenanceMode ? 'destructive' : 'outline'}
  onClick={handleToggleMaintenance}
  disabled={isToggling}
>
  {isToggling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wrench className="h-4 w-4" />}
  {isMaintenanceMode ? 'Desativar Manutencao' : 'Ativar Manutencao'}
</Button>
```

---

### 8. Arquivos a Criar/Modificar

| Arquivo | Acao |
|---------|------|
| (banco) configuracoes | INSERT nova linha |
| `src/hooks/useMaintenanceMode.ts` | CRIAR |
| `src/components/MaintenanceScreen.tsx` | CRIAR |
| `src/components/admin/MaintenanceBanner.tsx` | CRIAR |
| `src/App.tsx` | MODIFICAR RequireAcesso |
| `src/components/admin/AdminLayout.tsx` | MODIFICAR para banner |
| `src/pages/admin/Dashboard.tsx` | MODIFICAR para botao |

---

### 9. Fluxo de Uso

```text
Admin acessa Dashboard
        |
        v
Clica em [Ativar Manutencao]
        |
        v
configuracoes.maintenance_mode = 'true'
        |
        +--------------------+
        |                    |
        v                    v
   Lojas veem         Admin ve banner
   tela fixa          amarelo no topo
        |                    |
        v                    |
  Nao conseguem              |
  fazer pedidos              |
        |                    |
        +--------------------+
                |
                v
       Admin clica em
    [Desativar Manutencao]
                |
                v
   configuracoes.maintenance_mode = 'false'
                |
                v
       Sistema volta ao normal
```

---

### 10. Comportamento Esperado

| Cenario | Antes | Depois |
|---------|-------|--------|
| Loja tenta acessar /pedido | Formulario normal | Tela de manutencao |
| Loja tenta enviar pedido | Funciona | Bloqueado (tela fixa) |
| Admin acessa dashboard | Normal | Normal + banner amarelo |
| Admin alterna manutencao | Nao existe | 1 clique |
| Pedidos existentes | - | Nao afetados |
| Dados no banco | - | Nao afetados |

---

### 11. Secao Tecnica

**Por que usar configuracoes em vez de nova tabela:**
- Tabela ja existe com RLS configurada
- Padrao key-value ja usado (codigo_admin, codigo_acesso)
- Nao requer migration
- Simples de consultar e atualizar

**Por que verificar no RequireAcesso:**
- Ponto central de protecao de rotas publicas
- Nao precisa modificar cada pagina individualmente
- Manutencao afeta todas as rotas de loja automaticamente

**Otimizacao futura (opcional):**
- Realtime subscription para atualizar automaticamente
- Campo para mensagem customizada de manutencao
- Log de quem ativou/desativou com timestamp

---

### 12. Reversibilidade

Para remover completamente:
1. Deletar linha `maintenance_mode` da tabela configuracoes
2. Remover hook useMaintenanceMode
3. Remover componentes MaintenanceScreen e MaintenanceBanner
4. Reverter alteracoes em App.tsx e AdminLayout

Nenhum dado sera perdido, pedidos continuam funcionando.

