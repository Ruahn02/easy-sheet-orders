
# Diagnostico: Solicitacoes Nao Aparecem para Almoxarifado

## FASE 1 - INVESTIGACAO COMPLETA

### 1. Frontend (Formulario de Pedido)

**Fluxo analisado (`FormularioPedido.tsx` linhas 114-149):**

| Ponto | Comportamento | Status |
|-------|---------------|--------|
| Clique em "Enviar" | Abre modal de confirmacao | OK |
| Modal de confirmacao | Lista todos os itens selecionados | OK |
| Botao "Confirmar Envio" | Chama `addPedido()` e aguarda resultado | OK |
| Insert do pedido | Salva no banco e espera resposta | OK |
| Insert dos itens | Salva todos os itens vinculados ao pedido | OK |
| Rollback em falha | Se itens falharem, deleta pedido pai | OK |
| Toast de sucesso | So aparece se insert retornar dados | OK |

**Conclusao Frontend:** O fluxo de envio esta correto e aguarda confirmacao do banco.

---

### 2. Backend / Banco de Dados

**Verificacao de dados:**

| Metrica | Valor | Observacao |
|---------|-------|------------|
| Total de pedidos | 261 | Todos com dados validos |
| Total de itens | 4530 | Nenhum item orfao |
| Pedidos sem itens | 0 | Rollback funcionando |
| Pedidos com itens | 261 | 100% de integridade |
| Pedidos pendentes | 69 | Esperando processamento |
| Pedidos feitos | 192 | Ja processados |

**Conclusao Backend:** Os dados estao sendo salvos corretamente. Nao ha pedidos orfaos ou itens perdidos.

---

### 3. Listagem do Almoxarifado (Pedidos.tsx)

**Filtros aplicados:**

| Filtro | Descricao | Impacto |
|--------|-----------|---------|
| `selectedEntidadeId` | Obrigatorio | Filtra pedidos por entidade |
| `statusFilter` | Opcional | Pode ocultar pedidos feitos/pendentes |
| `selectedLojaId` | Opcional | Pode filtrar por loja |
| `startDate` / `endDate` | Opcional | Pode cortar pedidos antigos |
| `searchQuery` | Opcional | Busca em produtos |

**PONTO CRITICO IDENTIFICADO (linha 72-74):**

```typescript
const produtosDaEntidade = useMemo(() => {
  if (!selectedEntidadeId) return [];
  return produtos.filter((p) => p.entidadeIds.includes(selectedEntidadeId));
}, [produtos, selectedEntidadeId]);
```

Este filtro define quais COLUNAS aparecem na grade. Se um produto nao esta vinculado via N:N a entidade do pedido, sua coluna NAO aparece - mesmo que haja itens solicitando esse produto.

---

### 4. RLS (Row Level Security)

**Politicas verificadas:**

| Tabela | SELECT | INSERT | UPDATE | DELETE |
|--------|--------|--------|--------|--------|
| pedidos | true (publico) | true | true | true |
| pedido_itens | true (publico) | true | NAO | NAO |
| produtos | true (publico) | true | true | true |

**Conclusao RLS:** Nao ha bloqueio de visualizacao. Todos podem ver todos os dados.

---

### 5. UX (Experiencia do Usuario)

| Pergunta | Resposta |
|----------|----------|
| Usuario ve a propria solicitacao apos enviar? | NAO - nao ha tela "Minhas Solicitacoes" |
| Existe numero ou confirmacao clara? | SIM - toast com "Pedido enviado com sucesso" |
| Existe tela de historico para lojas? | NAO |

---

## FASE 2 - HIPOTESES

### ALTA PROBABILIDADE

**Hipotese 1: Colunas de produtos ausentes na grade**

| Item | Detalhe |
|------|---------|
| Causa | Grade filtra colunas por `produto.entidadeIds.includes(entidadeId)` |
| Sintoma | Pedido existe, itens existem, mas coluna do produto nao aparece |
| Evidencia | 53 itens em 9 pedidos tem produtos com N:N correto mas `entidade_id` diferente |
| Como confirmar | Verificar se apos a correcao do filtro N:N (ja feita) os itens aparecem |

**Hipotese 2: Produtos sem vinculo N:N apos migracao**

| Item | Detalhe |
|------|---------|
| Causa | Produto foi solicitado quando pertencia a entidade A, depois vinculo foi alterado para entidade B |
| Sintoma | Item existe no pedido mas coluna nao aparece pois produto nao pertence mais a entidade |
| Evidencia | 8 itens em 8 pedidos referem produtos SEM vinculo N:N a entidade do pedido |
| Como confirmar | Query mostra produto "Calculadora Pequena" em pedidos de "MATERIAL ESCRITORIO" mas vinculado apenas a "ESCRITORIO INTERNA" |

### MEDIA PROBABILIDADE

**Hipotese 3: Usuario seleciona entidade errada ao visualizar**

| Item | Detalhe |
|------|---------|
| Causa | Admin seleciona entidade A para ver pedidos, mas pedido foi feito na entidade B |
| Sintoma | Pedido "nao aparece" pois esta em outra aba |
| Como confirmar | Verificar com usuario qual entidade foi selecionada |

**Hipotese 4: Filtro de data oculta pedidos recentes**

| Item | Detalhe |
|------|---------|
| Causa | Data de inicio/fim aplicada pode estar cortando pedidos |
| Sintoma | Pedidos existem mas nao aparecem devido ao filtro |
| Como confirmar | Limpar filtros de data e verificar se pedido aparece |

### BAIXA PROBABILIDADE

**Hipotese 5: Limite de 1000 pedidos**

| Item | Detalhe |
|------|---------|
| Causa | PostgREST tem limite de 1000 linhas por query |
| Sintoma | Pedidos antigos nao aparecem |
| Status | JA CORRIGIDO - paginacao implementada em `useSupabaseData.ts` |

**Hipotese 6: Falha silenciosa no insert**

| Item | Detalhe |
|------|---------|
| Causa | Insert falha mas toast de sucesso aparece |
| Status | DESCARTADA - codigo faz await e so exibe sucesso se retornar dados |

---

## FASE 3 - CORRECOES PROPOSTAS

### Correcao 1: Grade deve mostrar TODOS os produtos dos itens (CRITICO)

**Arquivo:** `src/pages/admin/Pedidos.tsx`

**Problema:** Grade filtra colunas apenas por produtos vinculados a entidade, ignorando itens de produtos historicos.

**Solucao:** Extrair produtos unicos dos itens dos pedidos filtrados e mesclar com produtos da entidade.

```typescript
// ANTES (linha 72-75)
const produtosDaEntidade = useMemo(() => {
  if (!selectedEntidadeId) return [];
  return produtos.filter((p) => p.entidadeIds.includes(selectedEntidadeId));
}, [produtos, selectedEntidadeId]);

// DEPOIS - incluir produtos dos itens dos pedidos filtrados
const produtosDaEntidade = useMemo(() => {
  if (!selectedEntidadeId) return [];
  
  // Produtos vinculados via N:N
  const produtosVinculados = produtos.filter(
    (p) => p.entidadeIds.includes(selectedEntidadeId)
  );
  
  // IDs dos produtos que aparecem nos itens dos pedidos filtrados
  const produtosIdsNosItens = new Set(
    filteredPedidos.flatMap(p => p.itens.map(i => i.produtoId))
  );
  
  // Produtos que estao nos itens mas NAO estao vinculados
  const produtosHistoricos = produtos.filter(
    (p) => produtosIdsNosItens.has(p.id) && !p.entidadeIds.includes(selectedEntidadeId)
  );
  
  // Mesclar ambos (vinculados primeiro, historicos depois)
  return [...produtosVinculados, ...produtosHistoricos];
}, [produtos, selectedEntidadeId, filteredPedidos]);
```

**Impacto:** Todos os itens solicitados terao colunas visiveis, mesmo que o produto nao esteja mais vinculado a entidade.

---

### Correcao 2: Indicador visual para produtos historicos (UX)

**Arquivo:** `src/pages/admin/Pedidos.tsx`

**Descricao:** Marcar visualmente produtos que aparecem nos pedidos mas nao estao mais vinculados a entidade.

**Implementacao:** No cabecalho da coluna, adicionar icone de alerta se produto for historico.

---

### Correcao 3: Adicionar confirmacao/historico para lojas (UX - OPCIONAL)

**Descricao:** Criar tela simples para loja ver seus pedidos enviados.

**Beneficio:** Loja pode confirmar que pedido foi enviado sem precisar contatar admin.

---

## RESUMO EXECUTIVO

| Aspecto | Diagnostico |
|---------|-------------|
| Pedidos estao sendo salvos? | SIM - 100% de integridade |
| Itens estao sendo salvos? | SIM - 4530 itens, nenhum orfao |
| RLS bloqueia visualizacao? | NAO - todas as policies sao permissivas |
| Causa raiz | Grade nao exibe colunas de produtos sem vinculo N:N atual |
| Pedidos afetados | 8 pedidos com itens de produtos "historicos" |
| Solucao principal | Modificar filtro para incluir produtos dos itens existentes |

---

## SECAO TECNICA

### Dados de evidencia coletados

**Pedidos sem itens (orfaos):** 0

**Itens com produto de entidade diferente (N:N correto):** 53 itens em 9 pedidos

**Itens com produto de entidade diferente (SEM N:N):** 8 itens em 8 pedidos

**Produto problematico identificado:**
- Codigo: 101855
- Nome: Calculadora Pequena
- Entidade legado: SOLICITACAO ESCRITORIO INTERNA
- Pedidos em: MATERIAL ESCRITORIO (sem vinculo N:N)

### Query para identificar itens invisiveis

```sql
SELECT 
  pi.*, ped.entidade_id as pedido_entidade,
  p.entidade_id as produto_entidade_legado
FROM pedido_itens pi
JOIN pedidos ped ON ped.id = pi.pedido_id
JOIN produtos p ON p.id = pi.produto_id
WHERE p.entidade_id != ped.entidade_id
  AND NOT EXISTS (
    SELECT 1 FROM produto_entidades pe 
    WHERE pe.produto_id = pi.produto_id 
      AND pe.entidade_id = ped.entidade_id
  );
```

### Arquivos a modificar

| Arquivo | Alteracao | Prioridade |
|---------|-----------|------------|
| `src/pages/admin/Pedidos.tsx` | Filtro de produtos incluir historicos | ALTA |
| `src/pages/admin/Pedidos.tsx` | Indicador visual para produtos historicos | MEDIA |
| (novo) Tela historico loja | Opcional para UX | BAIXA |

