-- Inserir código de acesso global na tabela configuracoes
INSERT INTO public.configuracoes (chave, valor)
VALUES ('codigo_acesso', 'ACESSO123')
ON CONFLICT (chave) DO NOTHING;