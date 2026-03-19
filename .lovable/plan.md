

## Plano: Toggle manual deve desativar agendamento automaticamente

### Problema
Quando o admin abre pedidos manualmente, o agendamento continua ativo e o formulário público bloqueia o acesso porque está fora da janela de horário programada. O toggle manual não tem efeito prático.

### Solução
Quando o admin clicar no toggle manual (abrir ou fechar), desativar automaticamente o agendamento (`agendamentoAtivo = false`). Isso garante que a decisão manual prevalece. O admin pode reativar o agendamento depois no modal de edição.

### Alterações

**`src/pages/admin/Entidades.tsx`** (2 pontos):

1. `handleToggleOpen` — ao abrir manualmente, também setar `agendamentoAtivo: false`:
   ```
   updateEntidade(entidade.id, { aceitandoPedidos: true, agendamentoAtivo: false })
   ```

2. `handleToggleConfirm` — ao fechar manualmente, também setar `agendamentoAtivo: false`:
   ```
   updateEntidade(toggleConfirm.id, { aceitandoPedidos: false, agendamentoAtivo: false })
   ```

3. Adicionar um aviso no toast informando que o agendamento foi desativado (se estava ativo):
   ```
   toast({ title: 'Pedidos abertos!', description: 'Agendamento automático foi desativado.' })
   ```

Nenhuma migração necessária. Nenhuma mudança no FormularioPedido.

