import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Entidade, Loja, Produto, Pedido, PedidoItem } from '@/types';

// ============= ENTIDADES =============
export function useEntidades() {
  const [entidades, setEntidades] = useState<Entidade[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntidades = useCallback(async () => {
    const { data, error } = await supabase
      .from('entidades')
      .select('*')
      .order('criado_em', { ascending: false });

    if (!error && data) {
      setEntidades(data.map(e => ({
        id: e.id,
        nome: e.nome,
        aceitandoPedidos: e.aceitando_pedidos,
        criadoEm: new Date(e.criado_em),
      })));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEntidades();
  }, [fetchEntidades]);

  const addEntidade = async (nome: string, aceitandoPedidos: boolean) => {
    const { data, error } = await supabase
      .from('entidades')
      .insert({ nome, aceitando_pedidos: aceitandoPedidos })
      .select()
      .single();
    
    if (!error && data) {
      await fetchEntidades();
      return data;
    }
    return null;
  };

  const updateEntidade = async (id: string, updates: Partial<{ nome: string; aceitandoPedidos: boolean }>) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.nome !== undefined) dbUpdates.nome = updates.nome;
    if (updates.aceitandoPedidos !== undefined) dbUpdates.aceitando_pedidos = updates.aceitandoPedidos;

    const { error } = await supabase
      .from('entidades')
      .update(dbUpdates)
      .eq('id', id);
    
    if (!error) {
      await fetchEntidades();
      return true;
    }
    return false;
  };

  const deleteEntidade = async (id: string) => {
    const { error } = await supabase
      .from('entidades')
      .delete()
      .eq('id', id);
    
    if (!error) {
      await fetchEntidades();
      return true;
    }
    return false;
  };

  return { entidades, loading, fetchEntidades, addEntidade, updateEntidade, deleteEntidade };
}

// ============= LOJAS =============
export function useLojas() {
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLojas = useCallback(async () => {
    const { data, error } = await supabase
      .from('lojas')
      .select('*')
      .order('criado_em', { ascending: false });

    if (!error && data) {
      setLojas(data.map(l => ({
        id: l.id,
        nome: l.nome,
        status: l.status as 'ativo' | 'inativo',
        codigoAcesso: l.codigo_acesso,
        ativo: l.ativo,
        criadoEm: new Date(l.criado_em),
      })));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLojas();
  }, [fetchLojas]);

  const addLoja = async (nome: string, status: 'ativo' | 'inativo', codigoAcesso: string, ativo: boolean = true) => {
    const { data, error } = await supabase
      .from('lojas')
      .insert({ nome, status, codigo_acesso: codigoAcesso, ativo })
      .select()
      .single();
    
    if (!error && data) {
      await fetchLojas();
      return data;
    }
    return null;
  };

  const updateLoja = async (id: string, updates: Partial<{ nome: string; status: 'ativo' | 'inativo'; codigoAcesso: string; ativo: boolean }>) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.nome !== undefined) dbUpdates.nome = updates.nome;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.codigoAcesso !== undefined) dbUpdates.codigo_acesso = updates.codigoAcesso;
    if (updates.ativo !== undefined) dbUpdates.ativo = updates.ativo;

    const { error } = await supabase
      .from('lojas')
      .update(dbUpdates)
      .eq('id', id);
    
    if (!error) {
      await fetchLojas();
      return true;
    }
    return false;
  };

  const deleteLoja = async (id: string) => {
    const { error } = await supabase
      .from('lojas')
      .delete()
      .eq('id', id);
    
    if (!error) {
      await fetchLojas();
      return true;
    }
    return false;
  };

  // Buscar loja por código de acesso
  const getLojaByCodigoAcesso = async (codigo: string): Promise<Loja | null> => {
    const { data, error } = await supabase
      .from('lojas')
      .select('*')
      .eq('codigo_acesso', codigo.toUpperCase())
      .eq('ativo', true)
      .maybeSingle();
    
    if (!error && data) {
      return {
        id: data.id,
        nome: data.nome,
        status: data.status as 'ativo' | 'inativo',
        codigoAcesso: data.codigo_acesso,
        ativo: data.ativo,
        criadoEm: new Date(data.criado_em),
      };
    }
    return null;
  };

  return { lojas, loading, fetchLojas, addLoja, updateLoja, deleteLoja, getLojaByCodigoAcesso };
}

// ============= PRODUTOS =============
export function useProdutos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProdutos = useCallback(async () => {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .order('criado_em', { ascending: false });

    if (!error && data) {
      setProdutos(data.map(p => ({
        id: p.id,
        codigo: p.codigo,
        nome: p.nome,
        qtdMaxima: p.qtd_maxima,
        status: p.status as 'ativo' | 'inativo',
        entidadeId: p.entidade_id,
        criadoEm: new Date(p.criado_em),
      })));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProdutos();
  }, [fetchProdutos]);

  const addProduto = async (produto: { codigo: string; nome: string; qtdMaxima: number; status: 'ativo' | 'inativo'; entidadeId: string }) => {
    const { data, error } = await supabase
      .from('produtos')
      .insert({
        codigo: produto.codigo,
        nome: produto.nome,
        qtd_maxima: produto.qtdMaxima,
        status: produto.status,
        entidade_id: produto.entidadeId,
      })
      .select()
      .single();
    
    if (!error && data) {
      await fetchProdutos();
      return data;
    }
    return null;
  };

  const updateProduto = async (id: string, updates: Partial<{ codigo: string; nome: string; qtdMaxima: number; status: 'ativo' | 'inativo'; entidadeId: string }>) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.codigo !== undefined) dbUpdates.codigo = updates.codigo;
    if (updates.nome !== undefined) dbUpdates.nome = updates.nome;
    if (updates.qtdMaxima !== undefined) dbUpdates.qtd_maxima = updates.qtdMaxima;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.entidadeId !== undefined) dbUpdates.entidade_id = updates.entidadeId;

    const { error } = await supabase
      .from('produtos')
      .update(dbUpdates)
      .eq('id', id);
    
    if (!error) {
      await fetchProdutos();
      return true;
    }
    return false;
  };

  const deleteProduto = async (id: string) => {
    const { error } = await supabase
      .from('produtos')
      .delete()
      .eq('id', id);
    
    if (!error) {
      await fetchProdutos();
      return true;
    }
    return false;
  };

  return { produtos, loading, fetchProdutos, addProduto, updateProduto, deleteProduto };
}

// ============= PEDIDOS =============
export function usePedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPedidos = useCallback(async () => {
    // Fetch pedidos
    const { data: pedidosData, error: pedidosError } = await supabase
      .from('pedidos')
      .select('*')
      .order('data', { ascending: false });

    if (pedidosError || !pedidosData) {
      setLoading(false);
      return;
    }

    // Fetch all itens
    const { data: itensData, error: itensError } = await supabase
      .from('pedido_itens')
      .select('*');

    if (itensError) {
      setLoading(false);
      return;
    }

    const pedidosFormatados: Pedido[] = pedidosData.map(p => {
      const itens = (itensData || [])
        .filter(i => i.pedido_id === p.id)
        .map(i => ({
          produtoId: i.produto_id,
          quantidade: i.quantidade,
        }));

      return {
        id: p.id,
        lojaId: p.loja_id,
        entidadeId: p.entidade_id,
        observacoes: p.observacoes || undefined,
        data: new Date(p.data),
        status: p.status as 'pendente' | 'feito',
        corLinha: p.cor_linha || undefined,
        itens,
      };
    });

    setPedidos(pedidosFormatados);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPedidos();
  }, [fetchPedidos]);

  const addPedido = async (pedido: { lojaId: string; entidadeId: string; observacoes?: string; itens: PedidoItem[] }) => {
    // Insert pedido
    const { data: pedidoData, error: pedidoError } = await supabase
      .from('pedidos')
      .insert({
        loja_id: pedido.lojaId,
        entidade_id: pedido.entidadeId,
        observacoes: pedido.observacoes || null,
        status: 'pendente',
      })
      .select()
      .single();

    if (pedidoError || !pedidoData) {
      console.error('Erro ao criar pedido:', pedidoError);
      return null;
    }

    // Insert itens
    const itensInsert = pedido.itens.map(item => ({
      pedido_id: pedidoData.id,
      produto_id: item.produtoId,
      quantidade: item.quantidade,
    }));

    const { error: itensError } = await supabase
      .from('pedido_itens')
      .insert(itensInsert);

    if (itensError) {
      console.error('Erro ao criar itens do pedido:', itensError);
    }

    await fetchPedidos();
    return pedidoData;
  };

  const updatePedidoStatus = async (id: string, status: 'pendente' | 'feito') => {
    const { error } = await supabase
      .from('pedidos')
      .update({ status })
      .eq('id', id);
    
    if (!error) {
      await fetchPedidos();
      return true;
    }
    return false;
  };

  const updatePedidoCor = async (id: string, cor: string | undefined) => {
    const { error } = await supabase
      .from('pedidos')
      .update({ cor_linha: cor || null })
      .eq('id', id);
    
    if (!error) {
      await fetchPedidos();
      return true;
    }
    return false;
  };

  return { pedidos, loading, fetchPedidos, addPedido, updatePedidoStatus, updatePedidoCor };
}

// ============= CÓDIGO ADMIN =============
export function useCodigoAdmin() {
  const [codigoAdmin, setCodigoAdmin] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const fetchCodigoAdmin = useCallback(async () => {
    const { data, error } = await supabase
      .from('configuracoes')
      .select('valor')
      .eq('chave', 'codigo_admin')
      .maybeSingle();

    if (!error && data) {
      setCodigoAdmin(data.valor);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCodigoAdmin();
  }, [fetchCodigoAdmin]);

  const updateCodigoAdmin = async (novoCodigo: string) => {
    const { error } = await supabase
      .from('configuracoes')
      .update({ valor: novoCodigo })
      .eq('chave', 'codigo_admin');
    
    if (!error) {
      setCodigoAdmin(novoCodigo);
      return true;
    }
    return false;
  };

  return { codigoAdmin, loading, fetchCodigoAdmin, updateCodigoAdmin };
}
