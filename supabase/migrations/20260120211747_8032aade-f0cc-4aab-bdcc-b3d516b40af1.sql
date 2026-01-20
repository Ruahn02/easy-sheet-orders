-- 1. Criar tabela de relacionamento N:N
CREATE TABLE public.produto_entidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
  entidade_id UUID NOT NULL REFERENCES public.entidades(id) ON DELETE CASCADE,
  criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(produto_id, entidade_id)
);

-- 2. Criar índices para performance
CREATE INDEX idx_produto_entidades_produto ON public.produto_entidades(produto_id);
CREATE INDEX idx_produto_entidades_entidade ON public.produto_entidades(entidade_id);

-- 3. Habilitar RLS
ALTER TABLE public.produto_entidades ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS (mesmo padrão das outras tabelas)
CREATE POLICY "Produto entidades são públicas para leitura"
ON public.produto_entidades FOR SELECT USING (true);

CREATE POLICY "Qualquer um pode criar produto entidades"
ON public.produto_entidades FOR INSERT WITH CHECK (true);

CREATE POLICY "Qualquer um pode deletar produto entidades"
ON public.produto_entidades FOR DELETE USING (true);

-- 5. Migrar dados existentes (cada produto -> sua entidade atual)
INSERT INTO public.produto_entidades (produto_id, entidade_id)
SELECT id, entidade_id FROM public.produtos WHERE entidade_id IS NOT NULL;