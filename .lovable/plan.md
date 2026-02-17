

## Reordenar Produtos por Drag-and-Drop no Admin

### O que voce quer

Ver o catalogo como a loja ve (cards dos produtos) dentro da area admin, e poder arrastar os produtos para reordenar. Essa nova ordem salva no campo `ordem` do banco, afetando a ordem na planilha/exportacao e no formulario da loja -- sem alterar quantidades, nomes ou qualquer outro dado.

### Risco

Baixo. A unica coisa que muda e o campo `ordem` (INTEGER) de cada produto. Nenhum outro campo e tocado. A logica de pedidos, exportacao e quantidades continua identica.

### Como vai funcionar

1. Na pagina de Produtos do admin, ao filtrar por uma entidade especifica, aparece um botao "Reordenar Catalogo"
2. Ao clicar, abre um dialog/modal mostrando os produtos em formato de cards (similar ao que a loja ve)
3. Voce arrasta os cards para cima/baixo para definir a ordem
4. Ao clicar "Salvar Ordem", o sistema atualiza apenas o campo `ordem` de cada produto com a nova posicao (1, 2, 3...)
5. A ordem e refletida automaticamente no formulario da loja e nas exportacoes

### Detalhes Tecnicos

**Biblioteca de drag-and-drop:** Usar `@dnd-kit/core` + `@dnd-kit/sortable` (leve, acessivel, bem mantida para React).

**Arquivos a criar/modificar:**

| Arquivo | Acao |
|---------|------|
| `src/components/admin/ReorderProducts.tsx` | Novo - modal com lista de cards arrastavel |
| `src/pages/admin/Produtos.tsx` | Modificar - adicionar botao "Reordenar Catalogo" (visivel quando entidade filtrada) |
| `src/hooks/useSupabaseData.ts` | Modificar - adicionar funcao `reorderProdutos(ids: string[])` que faz batch update do campo `ordem` |

**Funcao de reorder no hook:**
```typescript
const reorderProdutos = async (orderedIds: string[]) => {
  // Para cada produto, atualiza ordem = index + 1
  const updates = orderedIds.map((id, index) =>
    supabase.from('produtos').update({ ordem: index + 1 }).eq('id', id)
  );
  await Promise.all(updates);
  await fetchProdutos();
};
```

**Modal de reorder:**
- Mostra cards com imagem, codigo e nome (visual simplificado do ProductCard)
- Icone de "arrastar" (GripVertical) em cada card
- Botoes "Salvar Ordem" e "Cancelar"
- Filtra apenas produtos da entidade selecionada

**Condicao para aparecer:** O botao so aparece quando uma entidade especifica esta selecionada no filtro (nao faz sentido reordenar "todas" misturadas).

### O que NAO muda

- Quantidades dos produtos
- Status (ativo/inativo)
- Dados de pedidos existentes
- Logica de exportacao (ja usa o campo `ordem` para ordenar)
- Formulario da loja (ja respeita `ordem`)

