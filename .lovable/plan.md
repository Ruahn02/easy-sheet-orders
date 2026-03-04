

## 3 Alteracoes no Sistema de Pedidos

### 1. Badge de pendentes no seletor de entidade (Pedidos.tsx)

Atualmente o badge de pendentes fica em Entidades.tsx. O usuario quer que no dropdown de "Tipo de Pedido" em Pedidos.tsx, cada opcao mostre a contagem de pendentes ao lado do nome.

**Arquivo:** `src/pages/admin/Pedidos.tsx` (linhas 593-604)

- Calcular contagem de pedidos pendentes por entidade_id a partir dos dados ja carregados em `pedidos`
- No `SelectItem`, exibir `{ent.nome} (X pendentes)` com badge

### 2. Email obrigatorio no pedido padrao

Adicionar campo `email_solicitante` obrigatorio para TODOS os pedidos (nao so controle). A coluna ja existe no banco (nullable). No formulario, apos selecionar a loja, exibir campo de email obrigatorio. Bloquear envio sem email.

**Arquivo:** `src/pages/FormularioPedido.tsx`

- Apos `<StoreSelect>`, adicionar campo de email obrigatorio
- Na validacao `handleOpenConfirmation`, verificar email preenchido para TODOS os tipos
- No `addPedido`, enviar `emailSolicitante` sempre
- Remover o campo `emailSolicitante` da secao de controle (ja esta no fluxo geral)

**Arquivo:** `src/pages/admin/Pedidos.tsx`

- Adicionar coluna "Email" na planilha para TODOS os tipos (nao so controle)
- Incluir no export XLSX/PDF

### 3. Reordenar formulario controle: dados antes dos produtos

No `FormularioPedido.tsx`, para entidades "controle", mover a secao de rastreabilidade para ANTES da lista de produtos. Ordem: Loja > Email > Dados de rastreabilidade > Produtos > Observacoes.

**Arquivo:** `src/pages/FormularioPedido.tsx`

- Mover o bloco de campos de controle (linhas 328-358) para logo apos o campo de email
- Manter a busca e lista de produtos abaixo

### Resumo de mudancas

| Arquivo | Mudanca |
|---------|---------|
| `src/pages/admin/Pedidos.tsx` | Badge pendentes no Select + coluna Email para todos |
| `src/pages/FormularioPedido.tsx` | Campo email obrigatorio para todos + reordenar controle |

Nenhuma migracao necessaria - a coluna `email_solicitante` ja existe no banco.

