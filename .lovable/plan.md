

## Plano: Filtros Multi-Select com Checkbox em Todas as Telas

### O que muda

Trocar os filtros de seleção única (Select/Combobox) por **multi-select com checkbox** (quadrado na frente de cada opção) nas seguintes telas e campos:

| Tela | Filtro | Atual | Novo |
|------|--------|-------|------|
| **Inventário** | Entidade | Select único | MultiSelectFilter (checkbox) |
| **Inventário** | Produto | Combobox único | MultiSelectFilter (checkbox) com busca |
| **Inventário** | Status | Select único | MultiSelectFilter (checkbox) |
| **Dashboard** | Loja | Combobox único | MultiSelectFilter (checkbox) com busca |
| **Dashboard** | Produto | Combobox único | MultiSelectFilter (checkbox) com busca |
| **Pedidos** | Loja | Combobox único | MultiSelectFilter (checkbox) com busca |
| **Pedidos** | Status | Select único | MultiSelectFilter (checkbox) |
| **Pedidos** | Motivo | Select único | MultiSelectFilter (checkbox) |

**NÃO muda:** Pedidos > Entidade (obrigatório ser único pois define as colunas da planilha).

### Componente `MultiSelectFilter`

O componente já existe em `src/components/ui/multi-select-filter.tsx` e já usa checkmarks (✓). Vou trocar o ícone `Check` por um **checkbox visual** (quadrado preenchido/vazio) para ficar mais claro que é multi-select.

### Mudanças por arquivo

**1. `src/components/ui/multi-select-filter.tsx`**
- Substituir o ícone `Check` por um checkbox visual (quadrado com/sem preenchimento) usando o componente `Checkbox` do Radix

**2. `src/pages/admin/Inventario.tsx`**
- `entidadeFiltro`: de `string` para `string[]`, usar MultiSelectFilter
- `produtoFiltro`: de `string` para `string[]`, usar MultiSelectFilter
- `statusFiltro`: de `string` para `string[]`, usar MultiSelectFilter
- Ajustar lógica de filtragem: `.includes()` → `.some()`
- Quando múltiplas entidades selecionadas, mostrar produtos de todas elas
- Exportação e conferência: funciona normalmente (confere por produto individual)

**3. `src/pages/admin/Dashboard.tsx`**
- `lojaFiltro`: de `string` para `string[]`, usar MultiSelectFilter
- `produtoFiltro`: de `string` para `string[]`, usar MultiSelectFilter
- Ajustar filtragem e métricas

**4. `src/pages/admin/Pedidos.tsx`**
- `selectedLojaId`: de `string` para `string[]`, usar MultiSelectFilter
- `statusFilter`: de `string` para `string[]`, usar MultiSelectFilter
- `motivoFilter`: de `string` para `string[]`, usar MultiSelectFilter
- Ajustar filtragem dos pedidos

### Lógica de filtragem

Padrão para todos: array vazio `[]` = "Todos" (sem filtro). Array com valores = filtrar por `.includes()`.

