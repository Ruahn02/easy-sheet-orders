

## Plano: Motivo como Select, Filtros de Controle e Permissões de Entidade por Loja

### 3 funcionalidades solicitadas:

---

### 1. Motivo da Solicitação: Select com opções predefinidas

**Atual:** campo de texto livre (Textarea).
**Novo:** Select/dropdown com as opções:
- Funcionário novo
- Desgaste
- Quebra
- Perda/Extravio
- Promoção

**Arquivos:**
- `src/pages/FormularioPedido.tsx` -- trocar Textarea por Select nas linhas 338-341
- `src/pages/admin/Pedidos.tsx` -- adicionar filtro por motivo (novo Select nos filtros, filtrar `pedido.motivoSolicitacao`). Esse filtro só aparece quando a entidade selecionada é do tipo "controle"

---

### 2. Filtros por Nome do Funcionário e Cargo na tela Pedidos

Adicionar dois campos de texto (Input) nos filtros da tela admin Pedidos, visíveis apenas quando a entidade é tipo "controle":
- **Filtro por Nome do Colaborador** -- filtra `pedido.nomeColaborador` com busca parcial (contains)
- **Filtro por Cargo/Função** -- filtra `pedido.funcaoColaborador` com busca parcial

**Arquivo:** `src/pages/admin/Pedidos.tsx` -- adicionar estados + inputs + lógica no `filteredPedidos`

---

### 3. Permissão de Entidades por Loja

Controlar quais entidades cada loja pode solicitar pedidos.

**Banco de dados -- nova tabela:**
```sql
CREATE TABLE loja_entidades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loja_id uuid NOT NULL REFERENCES lojas(id) ON DELETE CASCADE,
  entidade_id uuid NOT NULL REFERENCES entidades(id) ON DELETE CASCADE,
  criado_em timestamptz NOT NULL DEFAULT now(),
  UNIQUE(loja_id, entidade_id)
);
```
Com RLS pública (mesmo padrão do projeto). Se a loja não tiver nenhum registro em `loja_entidades`, ela pode acessar TODAS as entidades (comportamento padrão, sem quebrar nada existente).

**Arquivos a modificar:**

| Arquivo | Mudança |
|---------|---------|
| `src/hooks/useSupabaseData.ts` | Novo hook `useLojaEntidades()` para CRUD na tabela `loja_entidades` |
| `src/types/index.ts` | Adicionar interface `LojaEntidade` |
| `src/pages/admin/Lojas.tsx` | No modal de edição, adicionar checkboxes com as entidades disponíveis para selecionar quais a loja pode acessar |
| `src/pages/FormularioPedido.tsx` | Filtrar entidades disponíveis com base nas permissões da loja selecionada (ou mostrar todas se sem restrição) |
| `src/pages/Index.tsx` | Se necessário, filtrar entidades visíveis baseado na loja logada |

### Resumo de impacto

- 1 migração SQL (tabela `loja_entidades`)
- Modificar 4-5 arquivos TypeScript
- Sem breaking changes (lojas sem permissões explícitas = acesso total)

