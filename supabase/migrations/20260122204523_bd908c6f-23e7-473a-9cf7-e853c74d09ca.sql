-- Tabela para controle visual de separação de produtos
CREATE TABLE public.pedido_separacao_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  separado BOOLEAN NOT NULL DEFAULT true,
  data_registro TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(pedido_id, produto_id)
);

-- Habilitar RLS
ALTER TABLE public.pedido_separacao_itens ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público (mesmo padrão das outras tabelas)
CREATE POLICY "Separação é pública para leitura" 
ON public.pedido_separacao_itens FOR SELECT USING (true);

CREATE POLICY "Qualquer um pode criar separação" 
ON public.pedido_separacao_itens FOR INSERT WITH CHECK (true);

CREATE POLICY "Qualquer um pode atualizar separação" 
ON public.pedido_separacao_itens FOR UPDATE USING (true);

CREATE POLICY "Qualquer um pode deletar separação" 
ON public.pedido_separacao_itens FOR DELETE USING (true);

-- Índice para busca rápida por pedido
CREATE INDEX idx_pedido_separacao_pedido_id ON public.pedido_separacao_itens(pedido_id);