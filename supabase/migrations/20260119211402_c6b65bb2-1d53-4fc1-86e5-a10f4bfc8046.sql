-- Adicionar coluna unidade_medida na tabela inventario
ALTER TABLE inventario 
ADD COLUMN unidade_medida TEXT NOT NULL DEFAULT 'un';