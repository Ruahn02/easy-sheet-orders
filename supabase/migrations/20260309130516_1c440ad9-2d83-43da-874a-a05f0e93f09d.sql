
CREATE TABLE public.loja_entidades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loja_id uuid NOT NULL REFERENCES public.lojas(id) ON DELETE CASCADE,
  entidade_id uuid NOT NULL REFERENCES public.entidades(id) ON DELETE CASCADE,
  criado_em timestamptz NOT NULL DEFAULT now(),
  UNIQUE(loja_id, entidade_id)
);

ALTER TABLE public.loja_entidades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Loja entidades são públicas para leitura"
  ON public.loja_entidades FOR SELECT TO public USING (true);

CREATE POLICY "Qualquer um pode criar loja entidades"
  ON public.loja_entidades FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Qualquer um pode deletar loja entidades"
  ON public.loja_entidades FOR DELETE TO public USING (true);
