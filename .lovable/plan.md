

## Botao de Modo Noturno/Dia no Dashboard

### Situacao Atual

O projeto ja tem a biblioteca `next-themes` instalada e variaveis CSS para `.dark` definidas no `index.css`, mas nao existe nenhum `ThemeProvider` configurado -- ou seja, o modo escuro nunca e ativado.

### O que sera feito

1. **Envolver o app com `ThemeProvider`** (`src/App.tsx`)
   - Importar `ThemeProvider` de `next-themes`
   - Envolver todo o conteudo do app com ele (atributo `attribute="class"`, `defaultTheme="light"`)

2. **Adicionar botao de alternancia no header do AdminLayout** (`src/components/admin/AdminLayout.tsx`)
   - Icone de sol/lua no canto superior direito
   - Ao clicar, alterna entre `light` e `dark`
   - Visivel tanto no header mobile quanto no desktop

### Arquivos a modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/App.tsx` | Adicionar `ThemeProvider` envolvendo o app |
| `src/components/admin/AdminLayout.tsx` | Adicionar botao sol/lua no header |

### Impacto

- Todas as paginas admin ganham suporte a modo escuro (as variaveis CSS `.dark` ja existem)
- Preferencia do usuario e salva automaticamente no `localStorage` pelo `next-themes`
- Nenhuma alteracao de banco, logica de pedidos ou metricas
- Paginas publicas (lojas) tambem respeitam o tema escolhido

