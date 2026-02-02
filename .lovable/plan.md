

## Plano: Corrigir Modal de Produtos para Respeitar Viewport

### Diagnostico

**Problema atual (linha 411-572 de Produtos.tsx):**
- `DialogContent` sem `max-height` - cresce indefinidamente
- Conteudo do formulario sem scroll interno
- Header e Footer nao sao sticky
- Em telas pequenas, campos ficam fora da area visivel

**Estrutura atual:**
```
DialogContent (sem max-height)
  └── DialogHeader (nao sticky)
  └── div.space-y-4.py-4 (sem scroll)
       └── Todos os campos do formulario
  └── DialogFooter (nao sticky)
```

---

### Solucao

Reestruturar o modal com layout flexbox e scroll interno:

**Nova estrutura:**
```
DialogContent (max-h-[90vh], flex, flex-col)
  └── DialogHeader (sticky top, flex-shrink-0)
  └── div (flex-1, overflow-y-auto, px com padding)
       └── Campos do formulario
  └── DialogFooter (sticky bottom, flex-shrink-0, border-top)
```

---

### Alteracoes Necessarias

**Arquivo: `src/pages/admin/Produtos.tsx`**

1. **DialogContent** - Adicionar classes de controle de altura e flex:
   - `max-h-[90vh]` - limita altura a 90% do viewport
   - `flex flex-col` - layout em coluna
   - `overflow-hidden` - previne scroll no container pai

2. **DialogHeader** - Tornar sticky:
   - `sticky top-0 z-10 bg-card pb-4` - fixo no topo com fundo

3. **Div do formulario** - Tornar scrollavel:
   - `flex-1 overflow-y-auto px-1` - cresce e rola internamente
   - Manter `space-y-4` para espacamento dos campos

4. **DialogFooter** - Tornar sticky:
   - `sticky bottom-0 bg-card pt-4 border-t` - fixo no rodape com borda

---

### Codigo Antes vs Depois

**ANTES (linhas 411-416):**
```tsx
<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
  <DialogContent className="bg-card">
    <DialogHeader>
      <DialogTitle>{editingProduto ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
    </DialogHeader>
    <div className="space-y-4 py-4">
```

**DEPOIS:**
```tsx
<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
  <DialogContent className="bg-card max-h-[90vh] flex flex-col overflow-hidden">
    <DialogHeader className="flex-shrink-0">
      <DialogTitle>{editingProduto ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
    </DialogHeader>
    <div className="flex-1 overflow-y-auto space-y-4 py-4 px-1">
```

**ANTES (linhas 563-571):**
```tsx
    </div>
    <DialogFooter>
      <Button variant="outline" onClick={() => setIsModalOpen(false)}>
        Cancelar
      </Button>
      <Button onClick={handleSubmit} ...>
```

**DEPOIS:**
```tsx
    </div>
    <DialogFooter className="flex-shrink-0 border-t pt-4 mt-4">
      <Button variant="outline" onClick={() => setIsModalOpen(false)}>
        Cancelar
      </Button>
      <Button onClick={handleSubmit} ...>
```

---

### Comportamento Esperado

| Situacao | Antes | Depois |
|----------|-------|--------|
| Tela grande (1080p+) | Modal pode estourar | Modal centralizado, sem scroll |
| Tela media (768p) | Campos cortados | Scroll interno suave |
| Tela pequena (notebook) | Precisa zoom manual | Scroll interno, tudo acessivel |
| Header | Rola junto | Sempre visivel |
| Footer (botoes) | Rola junto / escondido | Sempre visivel |

---

### Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/pages/admin/Produtos.tsx` | Ajustar classes do DialogContent, DialogHeader, body div e DialogFooter |

---

### Regras Respeitadas

| Regra | Status |
|-------|--------|
| Nao usar altura fixa em px | OK - usa vh |
| Scroll interno ao modal | OK - overflow-y-auto |
| Background nao rola | OK - apenas body interno |
| Header/Footer fixos | OK - flex-shrink-0 |
| Layout coluna unica | OK - mantido |
| Nao quebrar funcionalidade | OK - apenas CSS |

---

### Secao Tecnica

**Classes CSS utilizadas:**
- `max-h-[90vh]`: altura maxima de 90% do viewport
- `flex flex-col`: container flex em coluna
- `overflow-hidden`: previne scroll no container
- `flex-shrink-0`: impede que header/footer encolham
- `flex-1`: body ocupa espaco restante
- `overflow-y-auto`: scroll vertical quando necessario
- `border-t`: separador visual no footer

**Por que funciona:**
O layout flexbox com `flex-col` distribui o espaco entre header (fixo), body (flexivel com scroll) e footer (fixo). O `max-h-[90vh]` garante que o modal nunca ultrapasse 90% da tela, forcando o scroll interno no body quando necessario.

