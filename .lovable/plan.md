

## Plano: Melhorias no Dashboard

### 3 mudanças no arquivo `src/pages/admin/Dashboard.tsx`:

**1. "Ver todos" no Consumo por Loja**
- Criar um modal/dialog similar ao `ProdutosAnalytics` mas para lojas (ou um estado `showAllLojas` com um Dialog inline)
- Remover o `.slice(0, 5)` na versão completa do modal
- Adicionar botão "Ver todos" no header do card "Consumo por Loja", igual ao que já existe em "Produtos Mais Pedidos"

**2. Filtro de período preset no card "Consumo por Loja"**
- Adicionar os mesmos botões de período (Hoje, Esta Semana, Este Mês, etc.) que existem no `ProdutosAnalytics`
- O filtro será local ao modal de "Ver todos" das lojas, filtrando os pedidos por data antes de calcular o ranking

**3. Filtro de período preset no topo do Dashboard (aba de Filtros)**
- Adicionar uma fileira de botões de atalho de período (Hoje, Esta Semana, Sem. Passada, Este Mês, Mês Passado, Trimestre, Semestre, Ano) na seção de Filtros
- Ao clicar, preenche automaticamente `dataInicio` e `dataFim` com as datas correspondentes
- Se o usuário alterar manualmente as datas, os presets ficam desmarcados

### Implementação

**Novo componente: `src/components/admin/LojasAnalytics.tsx`**
- Modal dialog idêntico ao `ProdutosAnalytics` em estrutura
- Recebe `pedidos`, `lojas`, `produtos`, `entidadeFiltro`, `open`, `onOpenChange`
- Inclui filtros de período preset (mesma lógica do ProdutosAnalytics)
- Lista todas as lojas com ranking de itens consumidos, sem limite de 5

**Alterações em `src/pages/admin/Dashboard.tsx`**
- Importar e usar `LojasAnalytics`
- Adicionar estado `showLojasAnalytics`
- Adicionar botão "Ver todos" no header do card "Consumo por Loja"
- Na seção de Filtros, adicionar uma linha de botões de período preset acima dos date pickers, com estado `periodoPresetDashboard` que controla `dataInicio`/`dataFim`

