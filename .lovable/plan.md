

## Plano: Tela "Pedidos Enviados" para Lojas

### Visao Geral

Criar uma tela simples e exclusiva para lojas visualizarem os pedidos enviados a partir do terminal atual. A identificacao sera feita pelo `loja_id` armazenado no localStorage quando um pedido e enviado.

---

### Arquitetura da Solucao

```text
+-------------------+
|   localStorage    |
| (ultima loja_id)  |
+--------+----------+
         |
         v
+--------+----------+
|  PedidosEnviados  |
|      (pagina)     |
+--------+----------+
         |
         v
+--------+----------+
|   pedidos table   |
| (filtro: loja_id) |
+-------------------+
```

---

### 1. Identificacao do Terminal

**Problema:** Atualmente nao existe identificador de terminal no localStorage.

**Solucao:** Salvar o `loja_id` selecionado quando um pedido e enviado.

**Arquivo:** `src/store/useLojaAuth.ts`

```typescript
interface AcessoState {
  acessoLiberado: boolean;
  ultimaLojaId: string | null;  // NOVO
  setAcessoLiberado: (liberado: boolean) => void;
  setUltimaLojaId: (lojaId: string) => void;  // NOVO
  logout: () => void;
}
```

---

### 2. Salvar Loja ao Enviar Pedido

**Arquivo:** `src/pages/FormularioPedido.tsx`

Modificar `handleSubmit` para salvar a loja apos envio bem-sucedido:

```typescript
if (result) {
  setUltimaLojaId(selectedLojaId!);  // NOVO
  // Reset form...
  toast({ title: 'Pedido enviado com sucesso!' });
}
```

---

### 3. Criar Pagina PedidosEnviados

**Arquivo:** `src/pages/uso-consumo/PedidosEnviados.tsx`

| Elemento | Descricao |
|----------|-----------|
| Header | Titulo "Pedidos Enviados" + botao voltar |
| Aviso | Texto explicativo sobre filtragem por terminal |
| Lista | Cards com numero, data, ML e status |
| Vazio | Mensagem quando nao ha pedidos |

**Dados exibidos por pedido:**

| Campo | Fonte | Formato |
|-------|-------|---------|
| Numero | pedido.id (primeiros 8 chars) | #XXXXXXXX |
| Data | pedido.data | DD/MM/YYYY HH:mm |
| ML | loja.nome | ML XX |
| Status | fixo | "Enviado ao Almoxarifado" |

**Dados NAO exibidos:**
- Itens
- Produtos
- Quantidades
- Observacoes
- Status de separacao

---

### 4. Consulta ao Banco

**Query simplificada:**

```typescript
// Buscar apenas pedidos da loja armazenada no localStorage
const { data } = await supabase
  .from('pedidos')
  .select('id, data, loja_id, entidade_id')
  .eq('loja_id', ultimaLojaId)
  .order('data', { ascending: false });
```

**Nao buscar:**
- pedido_itens (nao mostrar produtos)
- produtos (nao mostrar detalhes)

---

### 5. Routing

**Arquivo:** `src/App.tsx`

```typescript
// Nova rota protegida (requer acesso liberado)
<Route 
  path="/pedidos-enviados" 
  element={
    <RequireAcesso>
      <PedidosEnviados />
    </RequireAcesso>
  } 
/>
```

---

### 6. Link de Acesso

**Arquivo:** `src/pages/Index.tsx`

Adicionar botao/link discreto no rodape da pagina de selecao de tipo:

```typescript
<Link to="/pedidos-enviados">
  <Button variant="ghost" size="sm">
    <ClipboardList className="h-4 w-4 mr-2" />
    Ver pedidos enviados
  </Button>
</Link>
```

---

### 7. Estrutura de Arquivos

| Arquivo | Acao |
|---------|------|
| `src/store/useLojaAuth.ts` | MODIFICAR - adicionar ultimaLojaId |
| `src/pages/FormularioPedido.tsx` | MODIFICAR - salvar loja no envio |
| `src/pages/uso-consumo/PedidosEnviados.tsx` | CRIAR |
| `src/App.tsx` | MODIFICAR - adicionar rota |
| `src/pages/Index.tsx` | MODIFICAR - adicionar link |

---

### 8. Layout da Pagina

```text
+------------------------------------------+
|  <- Voltar          PEDIDOS ENVIADOS     |
+------------------------------------------+
|                                          |
|  Esta tela mostra apenas pedidos         |
|  enviados a partir deste computador.     |
|  Pedidos feitos em outro computador      |
|  nao aparecem aqui.                      |
|                                          |
+------------------------------------------+
|  +------------------------------------+  |
|  | #A1B2C3D4                          |  |
|  | 04/02/2026 15:30                   |  |
|  | ML 01                              |  |
|  | Enviado ao Almoxarifado            |  |
|  +------------------------------------+  |
|                                          |
|  +------------------------------------+  |
|  | #E5F6G7H8                          |  |
|  | 03/02/2026 10:15                   |  |
|  | ML 01                              |  |
|  | Enviado ao Almoxarifado            |  |
|  +------------------------------------+  |
|                                          |
+------------------------------------------+
```

---

### 9. Estado Vazio

```text
+------------------------------------------+
|  <- Voltar          PEDIDOS ENVIADOS     |
+------------------------------------------+
|                                          |
|  Esta tela mostra apenas pedidos         |
|  enviados a partir deste computador.     |
|                                          |
+------------------------------------------+
|                                          |
|          (icone de lista vazia)          |
|                                          |
|    Nenhum pedido foi enviado a partir    |
|    deste computador.                     |
|                                          |
|    Faca seu primeiro pedido para         |
|    ve-lo aqui.                           |
|                                          |
+------------------------------------------+
```

---

### 10. Seguranca e Isolamento

| Regra | Implementacao |
|-------|---------------|
| Filtro obrigatorio | WHERE loja_id = ultimaLojaId |
| Sem loja salva | Exibe estado vazio (nao erro) |
| Acesso admin | Rota NAO adicionada ao menu admin |
| Dados sensiveis | Nao exibe itens/quantidades |

---

### 11. Comportamento Esperado

| Cenario | Resultado |
|---------|-----------|
| Primeiro acesso (sem pedidos) | Estado vazio com orientacao |
| Terminal com pedidos | Lista ordenada por data |
| Outro terminal | Nao ve pedidos deste |
| Admin acessa /pedidos-enviados | Nao ve link, mas rota funciona se souber URL |

---

### 12. Secao Tecnica

**Por que usar loja_id como identificador:**
- Ja existe no banco de dados
- E selecionado pelo usuario ao fazer pedido
- Nao requer alteracao de schema
- "ML" e a terminologia usada (lojas sao ML 01, ML 02, etc.)

**Limitacoes conhecidas:**
- Se usuario trocar de ML no mesmo terminal, vera apenas pedidos da ultima ML usada
- Nao e um identificador unico de hardware (e uma escolha do usuario)

**Alternativa nao implementada:**
- Gerar UUID unico por browser e salvar em cada pedido
- Requer alteracao de schema (adicionar coluna terminal_id)
- Mais complexo e invasivo

---

### 13. Fluxo Completo

```text
Loja acessa sistema
        |
        v
Seleciona tipo de pedido
        |
        v
Seleciona ML (loja) -> Salvo em state
        |
        v
Preenche itens
        |
        v
Envia pedido
        |
        v
loja_id salvo no localStorage  <-- NOVO
        |
        v
Pode clicar em "Ver pedidos enviados"
        |
        v
Ve lista filtrada pelo loja_id salvo
```

