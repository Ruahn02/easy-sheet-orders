ALTER TABLE public.entidades
  ADD COLUMN agendamento_ativo boolean NOT NULL DEFAULT false,
  ADD COLUMN horario_abertura_dia integer,
  ADD COLUMN horario_abertura_hora text,
  ADD COLUMN horario_fechamento_dia integer,
  ADD COLUMN horario_fechamento_hora text;