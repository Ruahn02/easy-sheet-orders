import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Entidade, Loja, Produto, Pedido, PedidoItem, Inventario, LojaEntidade } from '@/types';

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
        tipoPedido: ((e as any).tipo_pedido || 'padrao') as 'padrao' | 'controle',
        criadoEm: new Date(e.criado_em),
      })));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEntidades();
  }, [fetchEntidades]);

  const addEntidade = async (nome: string, aceitandoPedidos: boolean, tipoPedido: 'padrao' | 'controle' = 'padrao') => {
    const { data, error } = await supabase
      .from('entidades')
      .insert({ nome, aceitando_pedidos: aceitandoPedidos, tipo_pedido: tipoPedido } as any)
      .select()
      .single();
    
    if (!error && data) {
      await fetchEntidades();
      return data;
    }
    return null;
  };

  const updateEntidade = async (id: string, updates: Partial<{ nome: string; aceitandoPedidos: boolean; tipoPedido: 'padrao' | 'controle' }>) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.nome !== undefined) dbUpdates.nome = updates.nome;
    if (updates.aceitandoPedidos !== undefined) dbUpdates.aceitando_pedidos = updates.aceitandoPedidos;
    if (updates.tipoPedido !== undefined) dbUpdates.tipo_pedido = updates.tipoPedido;

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
      .order('ordem', { ascending: true, nullsFirst: false })
      .order('criado_em', { ascending: false });

    if (!error && data) {
      setLojas(data.map(l => ({
        id: l.id,
        nome: l.nome,
        status: l.status as 'ativo' | 'inativo',
        ordem: l.ordem ?? undefined,
        criadoEm: new Date(l.criado_em),
      })));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLojas();
  }, [fetchLojas]);

  const addLoja = async (nome: string, status: 'ativo' | 'inativo', ordem?: number) => {
    // Gerar código de acesso único para satisfazer constraint do banco
    const codigoAcesso = `LOJA${Date.now().toString(36).toUpperCase()}`;
    
    const { data, error } = await supabase
      .from('lojas')
      .insert({ nome, status, codigo_acesso: codigoAcesso, ativo: true, ordem: ordem ?? null })
      .select()
      .single();
    
    if (!error && data) {
      await fetchLojas();
      return data;
    }
    return null;
  };

  const updateLoja = async (id: string, updates: Partial<{ nome: string; status: 'ativo' | 'inativo'; ordem: number | undefined }>) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.nome !== undefined) dbUpdates.nome = updates.nome;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if ('ordem' in updates) dbUpdates.ordem = updates.ordem ?? null;

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

  return { lojas, loading, fetchLojas, addLoja, updateLoja, deleteLoja };
}

// ============= CÓDIGO DE ACESSO GLOBAL =============
export function useCodigoAcesso() {
  const [codigoAcesso, setCodigoAcesso] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const fetchCodigoAcesso = useCallback(async () => {
    const { data, error } = await supabase
      .from('configuracoes')
      .select('valor')
      .eq('chave', 'codigo_acesso')
      .maybeSingle();

    if (!error && data) {
      setCodigoAcesso(data.valor);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCodigoAcesso();
  }, [fetchCodigoAcesso]);

  const validarCodigo = async (codigo: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('configuracoes')
      .select('valor')
      .eq('chave', 'codigo_acesso')
      .maybeSingle();

    if (!error && data) {
      return data.valor.toUpperCase() === codigo.toUpperCase();
    }
    return false;
  };

  const updateCodigoAcesso = async (novoCodigo: string) => {
    const { error } = await supabase
      .from('configuracoes')
      .update({ valor: novoCodigo })
      .eq('chave', 'codigo_acesso');
    
    if (!error) {
      setCodigoAcesso(novoCodigo);
      return true;
    }
    return false;
  };

  return { codigoAcesso, loading, fetchCodigoAcesso, validarCodigo, updateCodigoAcesso };
}

// ============= PRODUTOS =============
export function useProdutos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProdutos = useCallback(async () => {
    // Buscar produtos
    const { data: produtosData, error: produtosError } = await supabase
      .from('produtos')
      .select('*')
      .order('ordem', { ascending: true, nullsFirst: false })
      .order('criado_em', { ascending: false });

    if (produtosError || !produtosData) {
      setLoading(false);
      return;
    }

    // Buscar relacionamentos N:N
    const { data: relData } = await supabase
      .from('produto_entidades')
      .select('produto_id, entidade_id');

    // Agrupar entidades por produto
    const entidadesPorProduto: Record<string, string[]> = {};
    (relData || []).forEach((rel: { produto_id: string; entidade_id: string }) => {
      if (!entidadesPorProduto[rel.produto_id]) {
        entidadesPorProduto[rel.produto_id] = [];
      }
      entidadesPorProduto[rel.produto_id].push(rel.entidade_id);
    });

    setProdutos(produtosData.map(p => ({
      id: p.id,
      codigo: p.codigo,
      nome: p.nome,
      qtdMaxima: p.qtd_maxima,
      fotoUrl: (p as any).imagem_url || undefined,
      status: p.status as 'ativo' | 'inativo',
      // N:N: usar relacionamentos ou fallback para entidade_id original
      entidadeIds: entidadesPorProduto[p.id] || (p.entidade_id ? [p.entidade_id] : []),
      entidadeId: p.entidade_id, // manter para compatibilidade
      ordem: p.ordem ?? undefined,
      corCodigo: (p as any).cor_codigo || undefined,
      criadoEm: new Date(p.criado_em),
    })));

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProdutos();
  }, [fetchProdutos]);

  const addProduto = async (produto: { codigo: string; nome: string; qtdMaxima: number; status: 'ativo' | 'inativo'; entidadeIds: string[]; ordem?: number; fotoUrl?: string }) => {
    // Inserir produto com primeira entidade como fallback
    const { data, error } = await supabase
      .from('produtos')
      .insert({
        codigo: produto.codigo,
        nome: produto.nome,
        qtd_maxima: produto.qtdMaxima,
        status: produto.status,
        entidade_id: produto.entidadeIds[0] || null, // fallback
        ordem: produto.ordem ?? null,
        imagem_url: produto.fotoUrl || null,
      } as any)
      .select()
      .single();
    
    if (!error && data) {
      // Inserir relacionamentos N:N
      if (produto.entidadeIds.length > 0) {
        const relInserts = produto.entidadeIds.map(entidadeId => ({
          produto_id: data.id,
          entidade_id: entidadeId,
        }));
        await supabase.from('produto_entidades').insert(relInserts);
      }
      
      await fetchProdutos();
      return data;
    }
    return null;
  };

  const updateProduto = async (id: string, updates: Partial<{ codigo: string; nome: string; qtdMaxima: number; status: 'ativo' | 'inativo'; entidadeIds: string[]; ordem: number | undefined; fotoUrl: string | undefined }>) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.codigo !== undefined) dbUpdates.codigo = updates.codigo;
    if (updates.nome !== undefined) dbUpdates.nome = updates.nome;
    if (updates.qtdMaxima !== undefined) dbUpdates.qtd_maxima = updates.qtdMaxima;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.entidadeIds !== undefined && updates.entidadeIds.length > 0) {
      dbUpdates.entidade_id = updates.entidadeIds[0]; // fallback
    }
    if ('ordem' in updates) dbUpdates.ordem = updates.ordem ?? null;
    if ('fotoUrl' in updates) dbUpdates.imagem_url = updates.fotoUrl || null;

    const { error } = await supabase
      .from('produtos')
      .update(dbUpdates)
      .eq('id', id);
    
    if (error) return false;

    // Atualizar relacionamentos N:N
    if (updates.entidadeIds !== undefined) {
      // Deletar relacionamentos antigos
      await supabase.from('produto_entidades').delete().eq('produto_id', id);
      
      // Inserir novos relacionamentos
      if (updates.entidadeIds.length > 0) {
        const relInserts = updates.entidadeIds.map(entidadeId => ({
          produto_id: id,
          entidade_id: entidadeId,
        }));
        await supabase.from('produto_entidades').insert(relInserts);
      }
    }
    
    await fetchProdutos();
    return true;
  };

  const deleteProduto = async (id: string) => {
    // Relacionamentos são deletados automaticamente (ON DELETE CASCADE)
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

  const reorderProdutos = async (orderedIds: string[]) => {
    const updates = orderedIds.map((id, index) =>
      supabase.from('produtos').update({ ordem: index + 1 }).eq('id', id)
    );
    await Promise.all(updates);
    await fetchProdutos();
  };

  const updateProdutoCor = async (id: string, cor: string | undefined) => {
    const { error } = await supabase
      .from('produtos')
      .update({ cor_codigo: cor || null } as any)
      .eq('id', id);
    
    if (!error) {
      setProdutos(prev => prev.map(p => p.id === id ? { ...p, corCodigo: cor } : p));
      return true;
    }
    return false;
  };

  return { produtos, loading, fetchProdutos, addProduto, updateProduto, deleteProduto, reorderProdutos, updateProdutoCor };
}

// ============= PEDIDOS =============
export function usePedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPedidos = useCallback(async () => {
    // Buscar pedidos em lotes para contornar limite de 1000 do PostgREST
    let allPedidos: any[] = [];
    let pedidoOffset = 0;
    const pedidoPageSize = 1000;
    let pedidoHasMore = true;

    while (pedidoHasMore) {
      const { data: batch, error } = await supabase
        .from('pedidos')
        .select('*')
        .order('data', { ascending: false })
        .range(pedidoOffset, pedidoOffset + pedidoPageSize - 1);

      if (error) {
        console.error('Erro ao buscar pedidos:', error);
        break;
      }

      allPedidos = [...allPedidos, ...(batch || [])];
      pedidoHasMore = (batch?.length || 0) === pedidoPageSize;
      pedidoOffset += pedidoPageSize;
    }

    const pedidosData = allPedidos;

    if (pedidosData.length === 0) {
      setLoading(false);
      return;
    }

    // Extrair IDs dos pedidos que foram buscados
    const pedidoIds = pedidosData.map(p => p.id);

    // Buscar itens em lotes de 1000 para contornar limite do PostgREST
    let allItens: any[] = [];
    let offset = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data: batch, error } = await supabase
        .from('pedido_itens')
        .select('*')
        .in('pedido_id', pedidoIds)
        .order('id', { ascending: true })
        .range(offset, offset + pageSize - 1);

      if (error) {
        console.error('Erro ao buscar itens de pedidos:', error);
        break;
      }

      allItens = [...allItens, ...(batch || [])];
      hasMore = (batch?.length || 0) === pageSize;
      offset += pageSize;
    }

    const itensData = allItens;

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
        status: p.status as 'pendente' | 'feito' | 'nao_atendido',
        corLinha: p.cor_linha || undefined,
        itens,
        nomeSolicitante: (p as any).nome_solicitante || undefined,
        emailSolicitante: (p as any).email_solicitante || undefined,
        nomeColaborador: (p as any).nome_colaborador || undefined,
        funcaoColaborador: (p as any).funcao_colaborador || undefined,
        matriculaFuncionario: (p as any).matricula_funcionario || undefined,
        motivoSolicitacao: (p as any).motivo_solicitacao || undefined,
      };
    });

    setPedidos(pedidosFormatados);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPedidos();
  }, [fetchPedidos]);

  const addPedido = async (pedido: { lojaId: string; entidadeId: string; observacoes?: string; itens: PedidoItem[]; nomeSolicitante?: string; emailSolicitante?: string; nomeColaborador?: string; funcaoColaborador?: string; matriculaFuncionario?: string; motivoSolicitacao?: string }) => {
    // Insert pedido
    const { data: pedidoData, error: pedidoError } = await supabase
      .from('pedidos')
      .insert({
        loja_id: pedido.lojaId,
        entidade_id: pedido.entidadeId,
        observacoes: pedido.observacoes || null,
        status: 'pendente',
        nome_solicitante: pedido.nomeSolicitante || null,
        email_solicitante: pedido.emailSolicitante || null,
        nome_colaborador: pedido.nomeColaborador || null,
        funcao_colaborador: pedido.funcaoColaborador || null,
        matricula_funcionario: pedido.matriculaFuncionario || null,
        motivo_solicitacao: pedido.motivoSolicitacao || null,
      } as any)
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

    // Se falhar o insert dos itens, fazer rollback do pedido pai
    if (itensError) {
      console.error('Erro ao criar itens do pedido:', {
        pedidoId: pedidoData.id,
        quantidadeItens: itensInsert.length,
        erro: itensError,
        itens: itensInsert
      });
      
      // Rollback: deletar o pedido pai que ficou órfão
      await supabase.from('pedidos').delete().eq('id', pedidoData.id);
      
      return null; // Retorna null para indicar falha completa
    }

    await fetchPedidos();
    return pedidoData;
  };

  const updatePedidoStatus = async (id: string, status: 'pendente' | 'feito' | 'nao_atendido', observacoes?: string) => {
    const updates: Record<string, unknown> = { status };
    if (observacoes !== undefined) updates.observacoes = observacoes;
    
    const { error } = await supabase
      .from('pedidos')
      .update(updates)
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

// ============= INVENTÁRIO =============
export function useInventario() {
  const [inventario, setInventario] = useState<Inventario[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInventario = useCallback(async () => {
    const { data, error } = await supabase
      .from('inventario')
      .select('*')
      .order('data_conferencia', { ascending: false });

    if (!error && data) {
      setInventario(data.map((i: any) => ({
        id: i.id,
        produtoId: i.produto_id,
        entidadeId: i.entidade_id,
        quantidade: i.quantidade,
        unidadeMedida: i.unidade_medida || 'un',
        dataConferencia: new Date(i.data_conferencia),
        status: i.status as 'pendente' | 'conferido',
      })));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchInventario();
  }, [fetchInventario]);

  // UPSERT - Cria ou atualiza conferência
  const conferirProduto = async (produtoId: string, entidadeId: string, quantidade: number, unidadeMedida: string = 'un') => {
    const { error } = await supabase
      .from('inventario')
      .upsert({
        produto_id: produtoId,
        entidade_id: entidadeId,
        quantidade,
        unidade_medida: unidadeMedida,
        data_conferencia: new Date().toISOString(),
        status: 'conferido',
      }, {
        onConflict: 'produto_id'
      });

    if (!error) {
      await fetchInventario();
      return true;
    }
    console.error('Erro ao conferir produto:', error);
    return false;
  };

  return { inventario, loading, fetchInventario, conferirProduto };
}

// Hook para controle visual de separação de produtos
export function useSeparacao() {
  const [separacoes, setSeparacoes] = useState<Map<string, boolean>>(new Map());
  const [loading, setLoading] = useState(false);

  // Buscar separações de um pedido específico
  const fetchSeparacoes = async (pedidoId: string) => {
    try {
      const { data, error } = await supabase
        .from('pedido_separacao_itens')
        .select('*')
        .eq('pedido_id', pedidoId);

      if (error) throw error;

      const map = new Map<string, boolean>();
      data?.forEach(item => {
        map.set(`${item.pedido_id}_${item.produto_id}`, item.separado);
      });
      setSeparacoes(prev => {
        const newMap = new Map(prev);
        data?.forEach(item => {
          newMap.set(`${item.pedido_id}_${item.produto_id}`, item.separado);
        });
        return newMap;
      });
      return data;
    } catch (error) {
      console.error('Erro ao buscar separações:', error);
      return [];
    }
  };

  // Buscar separações de múltiplos pedidos
  const fetchSeparacoesMultiplos = async (pedidoIds: string[]) => {
    if (pedidoIds.length === 0) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pedido_separacao_itens')
        .select('*')
        .in('pedido_id', pedidoIds);

      if (error) throw error;

      const map = new Map<string, boolean>();
      data?.forEach(item => {
        map.set(`${item.pedido_id}_${item.produto_id}`, item.separado);
      });
      setSeparacoes(map);
    } catch (error) {
      console.error('Erro ao buscar separações:', error);
    } finally {
      setLoading(false);
    }
  };

  // Alternar estado de separação (upsert)
  const toggleSeparacao = async (pedidoId: string, produtoId: string) => {
    const key = `${pedidoId}_${produtoId}`;
    const currentValue = separacoes.get(key);
    // Se não existe registro, assumimos separado=true, então ao clicar vai para false
    const novoValor = currentValue === undefined ? false : !currentValue;

    // Atualização otimista
    setSeparacoes(prev => {
      const newMap = new Map(prev);
      newMap.set(key, novoValor);
      return newMap;
    });

    try {
      const { error } = await supabase
        .from('pedido_separacao_itens')
        .upsert({
          pedido_id: pedidoId,
          produto_id: produtoId,
          separado: novoValor,
          data_registro: new Date().toISOString()
        }, {
          onConflict: 'pedido_id,produto_id'
        });

      if (error) throw error;
      return true;
    } catch (error) {
      // Reverter em caso de erro
      setSeparacoes(prev => {
        const newMap = new Map(prev);
        if (currentValue === undefined) {
          newMap.delete(key);
        } else {
          newMap.set(key, currentValue);
        }
        return newMap;
      });
      console.error('Erro ao atualizar separação:', error);
      return false;
    }
  };

  // Verificar se um produto está separado
  const isSeparado = (pedidoId: string, produtoId: string): boolean => {
    const key = `${pedidoId}_${produtoId}`;
    const value = separacoes.get(key);
    // Se não existe registro, assume separado=true (comportamento padrão)
    return value === undefined ? true : value;
  };

  return { 
    separacoes, 
    loading, 
    fetchSeparacoes, 
    fetchSeparacoesMultiplos,
    toggleSeparacao, 
    isSeparado 
  };
}
