

## Plano: Status "Nao Atendido" para Pedidos

### Analise do Fluxo Atual

**Criacao:** Loja envia pedido -> status = `pendente` -> salvo em `pedidos` + `pedido_itens`

**Visualizacao:** Admin seleciona entidade -> grade mostra pedidos com filtro de status (`all`, `pendente`, `feito`)

**Botao "Feito":** Aparece apenas quando `status = 'pendente'`. Ao clicar, abre AlertDialog de confirmacao e atualiza para `feito`. O pedido continua visivel na grade.

**Metricas (Dashboard):** `pedidosPendentes` conta `status === 'pendente'`, `pedidosFeitos` conta `status === 'feito'`. Nao existe tratamento para outro status.

**Exportacao:** PDF e XLSX mostram status como `Feito` ou `Pendente`. Nao ha terceira opcao.

---

### Onde o "Nao Atendido" se Encaixa

| Aspecto | Impacto |
|---------|---------|
| Lista operacional | Sai da lista de pendentes (nao precisa mais ser processado) |
| Historico | Permanece visivel com filtro especifico |
| Metricas | NAO conta como "feito" nem como "pendente" |
| Dados | Nenhum dado apagado |

---

### Alteracoes Necessarias

#### 1. Banco de Dados (Migration)

Nenhuma migration necessaria. O campo `status` ja e do tipo `text` sem constraint. Basta salvar `'nao_atendido'` como valor.

#### 2. TypeScript (`src/types/index.ts`)

Expandir o tipo do status:

```typescript
status: 'pendente' | 'feito' | 'nao_atendido';
```

#### 3. Hook `useSupabaseData.ts`

- Atualizar o cast do status no `fetchPedidos` para incluir `'nao_atendido'`
- Atualizar a assinatura de `updatePedidoStatus` para aceitar `'nao_atendido'`

#### 4. Pagina `Pedidos.tsx` - Botao e Filtro

**Novo botao:** Ao lado de "Feito", visivel apenas quando `status === 'pendente'`:

```text
[Feito]  [Nao Atendido]  [Cor]
```

- "Feito": estilo verde (ja existente)
- "Nao Atendido": estilo neutro/outline com icone `XCircle`

**Confirmacao:** AlertDialog similar ao "Feito", com campo opcional de motivo (select simples, nao obrigatorio):
- Pedido duplicado
- Pedido errado
- Item indisponivel
- Cancelado pela loja
- Outro

O motivo sera salvo no campo `observacoes` do pedido (concatenado ao existente, se houver), evitando nova coluna.

**Filtro de status:** Adicionar opcao "Nao Atendido" ao select:

```text
Todos | Pendentes | Feitos | Nao Atendidos
```

**Badge de status:** Novo visual para `nao_atendido`:
- Cor: cinza/neutro
- Texto: "Nao Atendido"

#### 5. Dashboard (`Dashboard.tsx`) - Metricas

Adicionar contagem separada:

```typescript
const pedidosNaoAtendidos = pedidosFiltrados.filter(
  p => p.status === 'nao_atendido'
).length;
```

Novo card de metrica ou indicador no dashboard mostrando "Nao Atendidos" separado de "Feitos" e "Pendentes".

#### 6. Exportacao (XLSX e PDF)

Atualizar mapeamento de status nos exports:
- `'feito'` -> `'Feito'`
- `'pendente'` -> `'Pendente'`
- `'nao_atendido'` -> `'Nao Atendido'`

Se houver motivo, ele ja estara nas observacoes.

---

### Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/types/index.ts` | Adicionar `'nao_atendido'` ao tipo status |
| `src/hooks/useSupabaseData.ts` | Atualizar cast e assinatura de updatePedidoStatus |
| `src/pages/admin/Pedidos.tsx` | Botao, AlertDialog com motivo, filtro, badge, export |
| `src/pages/admin/Dashboard.tsx` | Metrica separada para nao atendidos |

---

### O que Muda

| Item | Antes | Depois |
|------|-------|--------|
| Status possiveis | pendente, feito | pendente, feito, nao_atendido |
| Botoes na linha | Feito + Cor | Feito + Nao Atendido + Cor |
| Filtro de status | Todos/Pendentes/Feitos | Todos/Pendentes/Feitos/Nao Atendidos |
| Dashboard | Pendentes + Feitos | Pendentes + Feitos + Nao Atendidos |
| Export | Pendente/Feito | Pendente/Feito/Nao Atendido |

### O que NAO Muda

| Item | Comportamento |
|------|---------------|
| Dados existentes | Nenhum pedido alterado |
| Fluxo de criacao | Lojas continuam criando normalmente |
| Botao "Feito" | Funciona exatamente igual |
| Separacao (toggle) | Nao afetado |
| Cores de linha | Nao afetado |
| Tela "Pedidos Enviados" (lojas) | Nao afetada |
| Schema do banco | Nenhuma migration necessaria |

---

### Secao Tecnica

**Por que nao criar nova coluna:**
- O campo `status` ja e `text` sem constraint
- Aceita qualquer valor, basta expandir o tipo TypeScript
- Nenhuma migration = zero risco para dados existentes

**Por que salvar motivo nas observacoes:**
- Evita criar nova coluna no banco
- Campo ja existe e e exibido na grade
- Motivo e informacao secundaria, nao operacional
- Formato: `[Nao atendido: Pedido duplicado] observacao original`

**Reversibilidade:**
- Para desfazer: reverter os 4 arquivos e executar `UPDATE pedidos SET status = 'pendente' WHERE status = 'nao_atendido'`
- Nenhum dado e perdido

