

## Ampliar Paleta de Cores dos Pedidos

### Problema Atual

Existem apenas 5 cores, todas em tons muito claros (pastel), dificultando a diferenciacao visual entre pedidos na grade.

### Cores Atuais

- Verde claro (#dcfce7)
- Amarelo claro (#fef3c7)
- Rosa claro (#fce7f3)
- Azul claro (#dbeafe)
- Roxo claro (#f3e8ff)

### Nova Paleta (15 cores + "Sem cor")

Organizada em dois grupos: claras e chamativas.

**Claras (suaves):**
- Verde claro (#dcfce7)
- Amarelo claro (#fef3c7)
- Azul claro (#dbeafe)
- Rosa claro (#fce7f3)
- Roxo claro (#f3e8ff)
- Cinza claro (#f1f5f9)

**Chamativas (mais vibrantes):**
- Verde (#86efac)
- Amarelo (#fde047)
- Laranja (#fdba74)
- Rosa (#f9a8d4)
- Azul (#93c5fd)
- Roxo (#c4b5fd)
- Vermelho (#fca5a5)
- Ciano (#67e8f9)
- Lima (#bef264)

### Alteracao

**Arquivo:** `src/pages/admin/Pedidos.tsx`

Substituir o array `CORES_DISPONIVEIS` (linhas 38-45) pela nova paleta expandida com 15 opcoes.

### Impacto

- Pedidos ja coloridos mantem suas cores (os valores antigos continuam na lista)
- Nenhuma alteracao de banco ou logica
- Apenas a lista de opcoes no popover de cores muda

