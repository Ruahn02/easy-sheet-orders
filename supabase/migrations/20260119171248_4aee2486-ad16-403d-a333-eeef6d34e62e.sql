-- Criar tabela de inventário para controle manual de estoque
CREATE TABLE public.inventario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
  entidade_id UUID NOT NULL REFERENCES public.entidades(id) ON DELETE CASCADE,
  quantidade INTEGER NOT NULL DEFAULT 0,
  data_conferencia TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'conferido')),
  UNIQUE(produto_id)
);

-- Habilitar RLS
ALTER TABLE public.inventario ENABLE ROW LEVEL SECURITY;

-- Políticas RLS (mesmo padrão do projeto)
CREATE POLICY "Inventário é público para leitura" 
ON public.inventario 
FOR SELECT 
USING (true);

CREATE POLICY "Qualquer um pode criar inventário" 
ON public.inventario 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Qualquer um pode atualizar inventário" 
ON public.inventario 
FOR UPDATE 
USING (true);

CREATE POLICY "Qualquer um pode deletar inventário" 
ON public.inventario 
FOR DELETE 
USING (true);