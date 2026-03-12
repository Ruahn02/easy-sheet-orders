

## Diagnóstico: Confirmação de inventário não salva

### Causa raiz

Existem **dois problemas**:

**1. `entidadeFiltroId` vazio (causa principal)**
Linha 131: `const entidadeFiltroId = entidadeFiltro.length > 0 ? entidadeFiltro[0] : '';`

Se nenhuma entidade está selecionada no filtro, `entidadeFiltroId` é `''` (falsy). Na linha 145 de `confirmarConferencia`:
```typescript
if (!produtoSelecionado || !entidadeFiltroId) return; // retorna silenciosamente!
```
O usuário preenche tudo, clica confirmar, mas a função sai sem fazer nada e sem mostrar erro.

**2. AlertDialogAction fecha antes do async completar**
O componente `AlertDialogAction` do Radix fecha o dialog automaticamente ao clicar. Como `confirmarConferencia` é async, o dialog fecha antes da operação terminar, impedindo feedback visual (loader) e potencialmente causando problemas de estado.

### Correções

**Arquivo: `src/pages/admin/Inventario.tsx`**

1. **Bloquear conferência sem entidade selecionada**: Desabilitar o botão "Conferir" na tabela e mostrar toast de aviso se `entidadeFiltro` estiver vazio. Adicionar validação em `confirmarConferencia` com toast de erro em vez de return silencioso.

2. **Trocar `AlertDialogAction` por `Button` comum**: Para evitar o auto-close do Radix antes do async completar. Controlar o fechamento manualmente após a operação finalizar (como já é feito nas linhas 155-162).

```text
Antes:  <AlertDialogAction onClick={confirmarConferencia}>
Depois: <Button onClick={confirmarConferencia}>Confirmar</Button>
```

3. **Adicionar toast de erro** quando `entidadeFiltroId` estiver vazio: `toast.error('Selecione uma entidade no filtro antes de conferir')`

### Impacto
- Apenas 1 arquivo modificado (`Inventario.tsx`)
- Sem mudanças no banco de dados
- Corrige o bug sem afetar outras funcionalidades

