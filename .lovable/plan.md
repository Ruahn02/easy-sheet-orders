

## Plano: Aumentar polling de 5s para 30s + parar polling em erro 402

### Problema
O polling a cada 5 segundos gerou excesso de requisicoes e estourou a cota de egress do Supabase (erro 402). Mesmo com o Supabase bloqueado, o polling continua disparando a cada 5 segundos, piorando a situacao.

### Solucao (2 partes)

**1. Aumentar intervalo de 5s para 30s**
Em `src/hooks/useSupabaseData.ts`, trocar todos os `setInterval(..., 5000)` por `setInterval(..., 30000)` nos 5 hooks:
- `useEntidades` (linha 40)
- `useLojas` (linha 137)
- `useProdutos` (linha 304)
- `usePedidos` (linha 529)
- `useLojaEntidades` (linha 981)

**2. Parar polling quando receber erro 402**
Adicionar verificacao nas funcoes fetch: se o Supabase retornar erro com "restricted" ou status 402, guardar um flag e parar de fazer novas requisicoes ate o usuario recarregar a pagina. Isso evita que o polling continue consumindo cota quando o Supabase ja esta bloqueado.

### Resultado
- 6x menos requisicoes (de 12/min para 2/min por hook)
- Realtime continua funcionando como complemento
- Se o Supabase bloquear, o polling para automaticamente
- Seus dados estao seguros no banco, vao voltar quando a cota resetar

### Risco
Nenhum. Apenas muda o intervalo e adiciona protecao contra erro 402.

