

## Atualizar Sistema de Pedidos com Tipo de Entidade e Rastreabilidade

### Resumo

Adicionar `tipo_pedido` como propriedade da entidade (nao do pedido individual). Entidades "controle" exigem campos de rastreabilidade no formulario. Badge de pedidos pendentes por entidade. Sem empresa_id por enquanto. Manter entidade_id (uuid).

### 1. Migracao no Banco (Supabase)

**Tabela `entidades`** - adicionar coluna:
- `tipo_pedido` (text, default 'padrao') -- valores: 'padrao' ou 'controle'

**Tabela `pedidos`** - adicionar colunas:
- `nome_solicitante` (text, nullable)
- `email_solicitante` (text, nullable)
- `nome_colaborador` (text, nullable)
- `funcao_colaborador` (text, nullable)
- `matricula_funcionario` (text, nullable)
- `motivo_solicitacao` (text, nullable)

Todas nullable porque pedidos "padrao" nao precisam desses campos.

### 2. Arquivos a Modificar

| Arquivo | O que muda |
|---------|-----------|
| `src/types/index.ts` | Adicionar `tipoPedido` em Entidade; campos de rastreio em Pedido |
| `src/hooks/useSupabaseData.ts` | Mapear novos campos no fetch/insert de entidades e pedidos |
| `src/pages/admin/Entidades.tsx` | Select de tipo (padrao/controle) ao criar/editar entidade; badge de pendentes |
| `src/pages/FormularioPedido.tsx` | Campos extras obrigatorios quando entidade e "controle"; validacao frontend |
| `src/pages/admin/Pedidos.tsx` | Exibir novas colunas na planilha quando entidade e controle |

### 3. Detalhes por Ponto

**Badge de pendentes (Entidades.tsx):**
- Query `pedidos` agrupando por `entidade_id` onde `status = 'pendente'`
- Exibir badge vermelho com numero ao lado de cada card de entidade
- Atualiza automaticamente porque o hook `usePedidos` ja faz fetch dos pedidos

**Formulario (FormularioPedido.tsx):**
- Se `entidade.tipoPedido === 'controle'`, mostrar secao extra com:
  - Nome do solicitante, Email, Nome do colaborador, Funcao, Matricula, Motivo
- Validacao: bloquear envio se campos obrigatorios estiverem vazios
- Campos salvos no insert do pedido

**Planilha (Pedidos.tsx):**
- Quando entidade selecionada for "controle", adicionar colunas extras na tabela
- Exportacao XLSX tambem inclui os novos campos

### 4. O que NAO muda

- Logica de pedidos "padrao" continua identica
- Sem empresa_id (futuro)
- entidade_id continua como uuid
- Separacao, inventario, analytics - intocados
- Status mantém 'pendente', 'feito', 'nao_atendido' (expansao futura)

