-- Adicionar coluna imagem_url (nullable) na tabela produtos
ALTER TABLE produtos 
ADD COLUMN imagem_url TEXT;

-- Criar bucket publico para imagens de produtos
INSERT INTO storage.buckets (id, name, public)
VALUES ('produtos-imagens', 'produtos-imagens', true);

-- Politicas RLS para o bucket
CREATE POLICY "Imagens de produtos sao publicas para leitura"
ON storage.objects FOR SELECT
USING (bucket_id = 'produtos-imagens');

CREATE POLICY "Qualquer um pode fazer upload de imagens de produtos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'produtos-imagens');

CREATE POLICY "Qualquer um pode atualizar imagens de produtos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'produtos-imagens');

CREATE POLICY "Qualquer um pode deletar imagens de produtos"
ON storage.objects FOR DELETE
USING (bucket_id = 'produtos-imagens');