-- Insert maintenance mode configuration
INSERT INTO configuracoes (chave, valor) 
VALUES ('maintenance_mode', 'false')
ON CONFLICT DO NOTHING;