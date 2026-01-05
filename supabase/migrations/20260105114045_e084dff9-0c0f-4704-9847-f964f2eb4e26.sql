-- Adicionar campos de acesso por código na tabela lojas
ALTER TABLE public.lojas 
ADD COLUMN IF NOT EXISTS codigo_acesso text UNIQUE,
ADD COLUMN IF NOT EXISTS ativo boolean NOT NULL DEFAULT true;

-- Gerar códigos iniciais para lojas existentes
UPDATE public.lojas 
SET codigo_acesso = UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6))
WHERE codigo_acesso IS NULL;

-- Tornar codigo_acesso obrigatório após popular
ALTER TABLE public.lojas 
ALTER COLUMN codigo_acesso SET NOT NULL;