-- Adicionar coluna ordem em lojas
ALTER TABLE lojas ADD COLUMN ordem INTEGER;

-- Adicionar coluna ordem em produtos
ALTER TABLE produtos ADD COLUMN ordem INTEGER;

-- Criar indices para performance na ordenacao
CREATE INDEX idx_lojas_ordem ON lojas(ordem NULLS LAST);
CREATE INDEX idx_produtos_ordem ON produtos(ordem NULLS LAST);