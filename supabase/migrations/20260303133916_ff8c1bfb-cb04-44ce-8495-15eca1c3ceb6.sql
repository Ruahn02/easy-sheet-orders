
-- Adicionar tipo_pedido na tabela entidades
ALTER TABLE public.entidades 
ADD COLUMN tipo_pedido text NOT NULL DEFAULT 'padrao';

-- Adicionar campos de rastreabilidade na tabela pedidos
ALTER TABLE public.pedidos 
ADD COLUMN nome_solicitante text,
ADD COLUMN email_solicitante text,
ADD COLUMN nome_colaborador text,
ADD COLUMN funcao_colaborador text,
ADD COLUMN matricula_funcionario text,
ADD COLUMN motivo_solicitacao text;
