-- Criar tabela de entidades (tipos de pedido)
CREATE TABLE public.entidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  aceitando_pedidos BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de lojas
CREATE TABLE public.lojas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ativa',
  criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de produtos
CREATE TABLE public.produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT NOT NULL,
  nome TEXT NOT NULL,
  qtd_maxima INTEGER NOT NULL DEFAULT 100,
  status TEXT NOT NULL DEFAULT 'ativo',
  entidade_id UUID REFERENCES public.entidades(id) ON DELETE CASCADE NOT NULL,
  criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de pedidos
CREATE TABLE public.pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loja_id UUID REFERENCES public.lojas(id) ON DELETE CASCADE NOT NULL,
  entidade_id UUID REFERENCES public.entidades(id) ON DELETE CASCADE NOT NULL,
  observacoes TEXT,
  data TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pendente',
  cor_linha TEXT
);

-- Criar tabela de itens do pedido
CREATE TABLE public.pedido_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id UUID REFERENCES public.pedidos(id) ON DELETE CASCADE NOT NULL,
  produto_id UUID REFERENCES public.produtos(id) ON DELETE CASCADE NOT NULL,
  quantidade INTEGER NOT NULL
);

-- Criar tabela de configurações (código admin)
CREATE TABLE public.configuracoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chave TEXT UNIQUE NOT NULL,
  valor TEXT NOT NULL
);

-- Inserir código admin padrão
INSERT INTO public.configuracoes (chave, valor) VALUES ('codigo_admin', 'admin123');

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.entidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lojas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedido_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;

-- Políticas públicas para leitura (formulário de pedido)
CREATE POLICY "Entidades são públicas para leitura" ON public.entidades FOR SELECT USING (true);
CREATE POLICY "Lojas são públicas para leitura" ON public.lojas FOR SELECT USING (true);
CREATE POLICY "Produtos são públicos para leitura" ON public.produtos FOR SELECT USING (true);
CREATE POLICY "Pedidos são públicos para leitura" ON public.pedidos FOR SELECT USING (true);
CREATE POLICY "Itens de pedido são públicos para leitura" ON public.pedido_itens FOR SELECT USING (true);
CREATE POLICY "Configurações são públicas para leitura" ON public.configuracoes FOR SELECT USING (true);

-- Políticas públicas para inserção (criar pedidos)
CREATE POLICY "Qualquer um pode criar pedidos" ON public.pedidos FOR INSERT WITH CHECK (true);
CREATE POLICY "Qualquer um pode criar itens de pedido" ON public.pedido_itens FOR INSERT WITH CHECK (true);

-- Políticas públicas para gerenciamento (admin - sem autenticação por enquanto)
CREATE POLICY "Qualquer um pode criar entidades" ON public.entidades FOR INSERT WITH CHECK (true);
CREATE POLICY "Qualquer um pode atualizar entidades" ON public.entidades FOR UPDATE USING (true);
CREATE POLICY "Qualquer um pode deletar entidades" ON public.entidades FOR DELETE USING (true);

CREATE POLICY "Qualquer um pode criar lojas" ON public.lojas FOR INSERT WITH CHECK (true);
CREATE POLICY "Qualquer um pode atualizar lojas" ON public.lojas FOR UPDATE USING (true);
CREATE POLICY "Qualquer um pode deletar lojas" ON public.lojas FOR DELETE USING (true);

CREATE POLICY "Qualquer um pode criar produtos" ON public.produtos FOR INSERT WITH CHECK (true);
CREATE POLICY "Qualquer um pode atualizar produtos" ON public.produtos FOR UPDATE USING (true);
CREATE POLICY "Qualquer um pode deletar produtos" ON public.produtos FOR DELETE USING (true);

CREATE POLICY "Qualquer um pode atualizar pedidos" ON public.pedidos FOR UPDATE USING (true);
CREATE POLICY "Qualquer um pode deletar pedidos" ON public.pedidos FOR DELETE USING (true);

CREATE POLICY "Qualquer um pode atualizar configurações" ON public.configuracoes FOR UPDATE USING (true);