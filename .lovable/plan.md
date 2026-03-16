

## Plano: Agendamento de Abertura/Fechamento + Correção do Estoque Estimado

### 1. Agendamento de horário nos Tipos de Pedido

**Problema**: Atualmente só existe controle manual (abrir/fechar). O usuário quer definir dia da semana + hora para abrir e fechar automaticamente, mantendo a opção manual.

**Mudanças no banco** (migração):
- Adicionar colunas na tabela `entidades`:
  - `horario_abertura_dia` (integer, nullable) — dia da semana (0=Domingo, 1=Segunda...6=Sábado)
  - `horario_abertura_hora` (text, nullable) — hora no formato "HH:mm" (ex: "10:00")
  - `horario_fechamento_dia` (integer, nullable)
  - `horario_fechamento_hora` (text, nullable)
  - `agendamento_ativo` (boolean, default false) — se o agendamento está ligado

**Lógica de funcionamento**:
- Quando `agendamento_ativo = true`, o sistema verifica no frontend (ao carregar o formulário público) se o momento atual está dentro da janela de abertura. Se segunda 10h abre e sexta 8h fecha, qualquer acesso entre segunda 10h e sexta 8h considera aberto.
- O toggle manual continua funcionando: se o admin desligar manualmente, fica fechado independente do agendamento.
- No card da entidade, mostrar info do agendamento configurado.

**Arquivos alterados**:
- `supabase/migrations/` — nova migração com as colunas
- `src/types/index.ts` — adicionar campos de agendamento ao tipo `Entidade`
- `src/hooks/useSupabaseData.ts` — mapear novas colunas no `fetchEntidades` e `updateEntidade`
- `src/pages/admin/Entidades.tsx` — no modal de edição, adicionar seção de agendamento com selects de dia da semana e inputs de hora; no card, mostrar horário configurado
- `src/pages/FormularioPedido.tsx` — ao verificar `aceitandoPedidos`, também checar se está dentro da janela de agendamento

### 2. Correção do Estoque Estimado no Inventário

**Problema**: O hook `useEstoqueEstimado` exige `entidadeIds.length > 0` (linha 685). Quando o filtro está em "Todas as entidades", `entidadeFiltro` é `[]` e as estimativas nunca são calculadas.

**Correção em `src/pages/admin/Inventario.tsx`**:
- Passar todas as entidades como fallback quando `entidadeFiltro` está vazio:
```
const idsParaEstoque = entidadeFiltro.length > 0 
  ? entidadeFiltro 
  : entidades.map(e => e.id);
const { estimativas } = useEstoqueEstimado(inventario, idsParaEstoque);
```

Isso é a única mudança necessária — o hook já funciona corretamente, apenas não recebe IDs quando o filtro está vazio.

### Resumo de arquivos
1. Nova migração SQL (5 colunas em `entidades`)
2. `src/types/index.ts` — campos de agendamento
3. `src/hooks/useSupabaseData.ts` — mapeamento das novas colunas
4. `src/pages/admin/Entidades.tsx` — UI de configuração de agendamento
5. `src/pages/FormularioPedido.tsx` — verificação de janela de horário
6. `src/pages/admin/Inventario.tsx` — fix do estoque estimado (1 linha)

