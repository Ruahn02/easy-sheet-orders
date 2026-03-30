

## Plano: Resiliencia Offline Completa

### Avaliacao de Risco

**Risco: BAIXO-MEDIO.** As mudancas sao incrementais e nao reescrevem logica existente. O unico ponto de atencao e o login offline — hoje `validarCodigo` faz query ao Supabase. Se o Supabase estiver fora, o login falha. A solucao (cache do codigo) e segura porque o codigo ja foi validado antes e esta armazenado localmente.

O modo critico e o modo manutencao local sao aditivos (novas flags), nao alteram fluxos existentes. A exportacao PDF usa jsPDF que ja esta no projeto. A tela de PedidosEnviados ganha uma secao extra para pedidos offline — nao substitui a existente.

**O que pode dar errado:**
- Se o localStorage estiver cheio, o cache falha silenciosamente (ja trata com try/catch)
- O modo manutencao local pode ficar "preso" se o admin esquecer de desativar — solucao: mostrar indicador claro

**O que NAO quebra:**
- Fluxo normal com Supabase online (prioridade sempre do servidor)
- Realtime, polling do connectionMonitor, estrutura de hooks

---

### 1. Login offline (fallback para cache)

**Arquivo:** `src/hooks/useSupabaseData.ts` (hook `useCodigoAcesso`)

- No `fetchCodigoAcesso`, ao receber o valor do Supabase, salvar em `localStorage` como `cache_codigo_acesso`
- Na funcao `validarCodigo`, se a query ao Supabase falhar (erro/timeout), comparar com o valor cacheado
- Mesmo hook `useCodigoAdmin`: salvar `cache_codigo_admin` e fazer fallback

### 2. Modo manutencao local (funciona sem Supabase)

**Arquivo:** `src/hooks/useMaintenanceMode.ts`

- Ao ativar/desativar, alem de gravar no Supabase, gravar em `localStorage` (`manutencao_local`)
- Na leitura: verificar localStorage PRIMEIRO. Se `manutencao_local === 'true'`, ativar manutencao independente do Supabase
- Se Supabase responder, sincronizar o valor remoto tambem
- `toggleMaintenanceMode` grava em ambos (local + Supabase se disponivel)

### 3. Modo critico (freio de mao)

**Novo arquivo:** `src/store/useCriticalMode.ts` (Zustand com persist)

Estado:
```text
criticalMode: boolean
activatedAt: Date | null
reason: 'manual' | 'auto_402' | null
```

- Ativacao manual pelo admin (botao no Dashboard)
- Ativacao automatica: nos hooks de fetch, se o erro for 402, ativar automaticamente
- Quando ativo:
  - Admin pages (Produtos, Lojas, Entidades): exibem banner "modo critico" e bloqueiam criacao/edicao/exclusao
  - Formulario de pedido: funciona normalmente (usa cache)
  - Dashboard: mostra indicador + botao para desativar

**Arquivos afetados:**
- `src/pages/admin/Dashboard.tsx` — botao ativar/desativar modo critico
- `src/pages/admin/Produtos.tsx` — desabilitar botoes de edicao quando critico
- `src/pages/admin/Lojas.tsx` — idem
- `src/pages/admin/Entidades.tsx` — idem

### 4. Tela de pedidos em espera (offline queue)

**Arquivo:** `src/pages/uso-consumo/PedidosEnviados.tsx`

- Alem dos pedidos do Supabase, listar pedidos da fila offline (`getQueue()`)
- Pedidos offline aparecem com badge "Aguardando envio" em amarelo
- Botao "Tentar reenviar" individual (chama `sendPedidoToSupabase`)
- Botao "Baixar PDF" em cada pedido (online ou offline)

### 5. Exportar pedido em PDF

**Novo arquivo:** `src/lib/exportPedidoPDF.ts`

- Funcao `exportarPedidoPDF(pedido, loja, entidade, produtos)` usando jsPDF
- Layout similar ao export que ja existe em Pedidos.tsx (mesmo estilo visual)
- Gera: cabecalho com logo/titulo, dados da loja, data, tabela de produtos com codigo/nome/quantidade, observacoes
- Funciona 100% offline (jsPDF e client-side)

**Integracao:**
- `PedidosEnviados.tsx` — botao PDF em cada pedido (online e offline)
- `FormularioPedido.tsx` — apos enviar/salvar offline, opcao de baixar PDF

### 6. Cache de loja_entidades

**Arquivo:** `src/lib/offlineCache.ts`

- Adicionar `lojaEntidades` ao `CACHE_KEYS` (ja existe mas precisa confirmar uso)

**Arquivo:** `src/hooks/useSupabaseData.ts` (hook `useLojaEntidades`)

- Salvar no cache apos fetch bem-sucedido
- Usar cache como fallback em caso de erro

### 7. Deteccao automatica de erro 402

**Arquivo:** `src/hooks/useSupabaseData.ts`

- Em cada fetch principal (entidades, lojas, produtos), verificar se `error.message` contem "402" ou "exceed"
- Se sim, importar e ativar `useCriticalMode.getState().activate('auto_402')`
- Isso dispara o modo critico automaticamente

---

### Resumo de arquivos

| Arquivo | Tipo | Alteracao |
|---|---|---|
| `src/store/useCriticalMode.ts` | Novo | Store Zustand para modo critico |
| `src/lib/exportPedidoPDF.ts` | Novo | Funcao de gerar PDF de pedido |
| `src/hooks/useMaintenanceMode.ts` | Editar | Fallback localStorage |
| `src/hooks/useSupabaseData.ts` | Editar | Cache login, fallback lojaEntidades, deteccao 402 |
| `src/pages/uso-consumo/PedidosEnviados.tsx` | Editar | Listar fila offline + botao PDF |
| `src/pages/admin/Dashboard.tsx` | Editar | Botao modo critico |
| `src/pages/admin/Produtos.tsx` | Editar | Bloquear edicao em modo critico |
| `src/pages/admin/Lojas.tsx` | Editar | Bloquear edicao em modo critico |
| `src/pages/admin/Entidades.tsx` | Editar | Bloquear edicao em modo critico |
| `src/lib/offlineCache.ts` | Editar | Garantir key lojaEntidades |
| `src/pages/FormularioPedido.tsx` | Editar | Opcao baixar PDF apos envio |

