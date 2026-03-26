import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Entidade, Loja, Produto, Pedido, PedidoItem, Inventario, LojaEntidade } from "@/types";
import { saveToCache, loadFromCache } from "@/lib/offlineCache";
import { addToQueue, removeFromQueue, markAsSent, PedidoOfflineData } from "@/lib/offlineQueue";

// Flag global: para todo polling se Supabase retornar 402 (quota excedida)
let supabaseRestricted = false;

function checkRestricted(error: any): boolean {
  if (!error) return false;
  const msg = error?.message || "";
  if (msg.includes("restricted") || msg.includes("exceed") || error?.code === "402") {
    supabaseRestricted = true;
    console.warn("[Polling] Supabase restrito (402). Polling pausado até recarregar a página.");
    return true;
  }
  return false;
}

// ============= ENTIDADES =============
export function useEntidades() {
  const [entidades, setEntidades] = useState<Entidade[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntidades = useCallback(async () => {
    if (supabaseRestricted) return;
    const { data, error } = await supabase.from("entidades").select("*").order("criado_em", { ascending: false });

    if (checkRestricted(error)) {
      const cached = loadFromCache<Entidade[]>("entidades");
      if (cached) {
        setEntidades(cached);
        console.log("[Cache] Usando entidades do cache local");
      }
      setLoading(false);
      return;
    }
    if (error) {
      const cached = loadFromCache<Entidade[]>("entidades");
      if (cached) {
        setEntidades(cached);
        console.log("[Cache] Usando entidades do cache local (erro de rede)");
      }
      setLoading(false);
      return;
    }
    if (data) {
      const mapped = data.map((e) => ({
        id: e.id,
        nome: e.nome,
        aceitandoPedidos: e.aceitando_pedidos,
        tipoPedido: ((e as any).tipo_pedido || "padrao") as "padrao" | "controle",
        agendamentoAtivo: (e as any).agendamento_ativo ?? false,
        horarioAberturaDia: (e as any).horario_abertura_dia ?? undefined,
        horarioAberturaHora: (e as any).horario_abertura_hora ?? undefined,
        horarioFechamentoDia: (e as any).horario_fechamento_dia ?? undefined,
        horarioFechamentoHora: (e as any).horario_fechamento_hora ?? undefined,
        criadoEm: new Date(e.criado_em),
      }));
      setEntidades((prev) => (JSON.stringify(prev) === JSON.stringify(mapped) ? prev : mapped));
      saveToCache("entidades", mapped);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEntidades();
  }, [fetchEntidades]);

  // Polling 30s + Realtime
  useEffect(() => {
    const interval = setInterval(fetchEntidades, 30000);
    const channel = supabase
      .channel("entidades-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "entidades" }, () => {
        fetchEntidades();
      });
    channel.subscribe();
    return () => {
      clearInterval(interval);
      try {
        supabase.removeChannel(channel);
      } catch (_) {}
    };
  }, [fetchEntidades]);

  const addEntidade = async (nome: string, aceitandoPedidos: boolean, tipoPedido: "padrao" | "controle" = "padrao") => {
    const { data, error } = await supabase
      .from("entidades")
      .insert({ nome, aceitando_pedidos: aceitandoPedidos, tipo_pedido: tipoPedido } as any)
      .select()
      .single();

    if (!error && data) {
      await fetchEntidades();
      return data;
    }
    return null;
  };

  const updateEntidade = async (
    id: string,
    updates: Partial<{
      nome: string;
      aceitandoPedidos: boolean;
      tipoPedido: "padrao" | "controle";
      agendamentoAtivo: boolean;
      horarioAberturaDia: number | null;
      horarioAberturaHora: string | null;
      horarioFechamentoDia: number | null;
      horarioFechamentoHora: string | null;
    }>,
  ) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.nome !== undefined) dbUpdates.nome = updates.nome;
    if (updates.aceitandoPedidos !== undefined) dbUpdates.aceitando_pedidos = updates.aceitandoPedidos;
    if (updates.tipoPedido !== undefined) dbUpdates.tipo_pedido = updates.tipoPedido;
    if (updates.agendamentoAtivo !== undefined) dbUpdates.agendamento_ativo = updates.agendamentoAtivo;
    if (updates.horarioAberturaDia !== undefined) dbUpdates.horario_abertura_dia = updates.horarioAberturaDia;
    if (updates.horarioAberturaHora !== undefined) dbUpdates.horario_abertura_hora = updates.horarioAberturaHora;
    if (updates.horarioFechamentoDia !== undefined) dbUpdates.horario_fechamento_dia = updates.horarioFechamentoDia;
    if (updates.horarioFechamentoHora !== undefined) dbUpdates.horario_fechamento_hora = updates.horarioFechamentoHora;

    const { error } = await supabase.from("entidades").update(dbUpdates).eq("id", id);

    if (!error) {
      await fetchEntidades();
      return true;
    }
    return false;
  };

  const deleteEntidade = async (id: string) => {
    const { error } = await supabase.from("entidades").delete().eq("id", id);

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
    if (supabaseRestricted) return;
    const { data, error } = await supabase
      .from("lojas")
      .select("*")
      .order("ordem", { ascending: true, nullsFirst: false })
      .order("criado_em", { ascending: false });

    if (checkRestricted(error) || error) {
      const cached = loadFromCache<Loja[]>("lojas");
      if (cached) {
        setLojas(cached);
        console.log("[Cache] Usando lojas do cache local");
      }
      setLoading(false);
      return;
    }
    if (data) {
      const mapped = data.map((l) => ({
        id: l.id,
        nome: l.nome,
        status: l.status as "ativo" | "inativo",
        ordem: l.ordem ?? undefined,
        criadoEm: new Date(l.criado_em),
      }));
      setLojas((prev) => (JSON.stringify(prev) === JSON.stringify(mapped) ? prev : mapped));
      saveToCache("lojas", mapped);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLojas();
  }, [fetchLojas]);

  // Polling 30s + Realtime
  useEffect(() => {
    const interval = setInterval(fetchLojas, 30000);
    const channel = supabase
      .channel("lojas-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "lojas" }, () => {
        fetchLojas();
      });
    channel.subscribe();
    return () => {
      clearInterval(interval);
      try {
        supabase.removeChannel(channel);
      } catch (_) {}
    };
  }, [fetchLojas]);

  const addLoja = async (nome: string, status: "ativo" | "inativo", ordem?: number) => {
    const codigoAcesso = `LOJA${Date.now().toString(36).toUpperCase()}`;

    const { data, error } = await supabase
      .from("lojas")
      .insert({ nome, status, codigo_acesso: codigoAcesso, ativo: true, ordem: ordem ?? null })
      .select()
      .single();

    if (!error && data) {
      await fetchLojas();
      return data;
    }
    return null;
  };

  const updateLoja = async (
    id: string,
    updates: Partial<{ nome: string; status: "ativo" | "inativo"; ordem: number | undefined }>,
  ) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.nome !== undefined) dbUpdates.nome = updates.nome;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if ("ordem" in updates) dbUpdates.ordem = updates.ordem ?? null;

    const { error } = await supabase.from("lojas").update(dbUpdates).eq("id", id);

    if (!error) {
      await fetchLojas();
      return true;
    }
    return false;
  };

  const deleteLoja = async (id: string) => {
    const { error } = await supabase.from("lojas").delete().eq("id", id);

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
  const [codigoAcesso, setCodigoAcesso] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const fetchCodigoAcesso = useCallback(async () => {
    const { data, error } = await supabase
      .from("configuracoes" as any)
      .select("valor")
      .eq("chave", "codigo_acesso")
      .maybeSingle();

    if (!error && data) {
      setCodigoAcesso((data as any).valor);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCodigoAcesso();
  }, [fetchCodigoAcesso]);

  const validarCodigo = async (codigo: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from("configuracoes" as any)
      .select("valor")
      .eq("chave", "codigo_acesso")
      .maybeSingle();

    if (!error && data) {
      return (data as any).valor.toUpperCase() === codigo.toUpperCase();
    }
    return false;
  };

  const updateCodigoAcesso = async (novoCodigo: string) => {
    const { error } = await supabase
      .from("configuracoes" as any)
      .update({ valor: novoCodigo })
      .eq("chave", "codigo_acesso");

    if (!error) {
      setCodigoAcesso(novoCodigo);
      return true;
    }
    return false;
  };

  return { codigoAcesso, loading, fetchCodigoAcesso, validarCodigo, updateCodigoAcesso };
}

// ============= PRODUTOS =============
export const useProdutos = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProdutos = async () => {
    setLoading(true);

    try {
      // Busca produtos
      const { data: produtosData, error } = await supabase.from("produtos").select("*");

      if (error) throw error;

      // Busca relações produtos_entidades
      const { data: relData, error: relError } = await supabase
        .from("produtos_entidades")
        .select("produto_id, entidade_id");

      if (relError) throw relError;

      // Mapeia entidades por produto
      const entidadesPorProduto: Record<string, string[]> = {};
      (relData || []).forEach((rel: { produto_id: string; entidade_id: string }) => {
        if (!entidadesPorProduto[rel.produto_id]) {
          entidadesPorProduto[rel.produto_id] = [];
        }
        entidadesPorProduto[rel.produto_id].push(rel.entidade_id);
      });

      // Mapeia produtos finais
      const mapped = (produtosData || []).map((p) => ({
        id: p.id,
        codigo: p.codigo,
        nome: p.nome,
        qtdMaxima: p.qtd_maxima,
        fotoUrl: p.imagem_url || undefined,
        status: p.status as "ativo" | "inativo",
        entidadeIds: entidadesPorProduto[p.id] || (p.entidade_id ? [p.entidade_id] : []),
        ordem: p.ordem ? Number(p.ordem) : undefined,
        corCodigo: p.cor_codigo || undefined,
        criadoEm: new Date(p.criado_em),
      }));

      console.log("Produtos carregados:", mapped);
      setProdutos(mapped);
    } catch (err) {
      console.error("Erro ao buscar produtos:", err);
      setProdutos([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchProdutos();
  }, []);

  return { produtos, loading, fetchProdutos };
};
// ============= PEDIDOS =============
export function usePedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPedidos = useCallback(async () => {
    if (supabaseRestricted) return;

    // Filtro: apenas pedidos dos últimos 30 dias para reduzir egress
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const filterDate = thirtyDaysAgo.toISOString();

    let allPedidos: any[] = [];
    let pedidoOffset = 0;
    const pedidoPageSize = 1000;
    let pedidoHasMore = true;

    while (pedidoHasMore) {
      const { data: batch, error } = await supabase
        .from("pedidos")
        .select("*")
        .gte("data", filterDate)
        .order("data", { ascending: false })
        .range(pedidoOffset, pedidoOffset + pedidoPageSize - 1);

      if (error) {
        if (checkRestricted(error)) return;
        console.error("Erro ao buscar pedidos:", error);
        break;
      }

      allPedidos = [...allPedidos, ...(batch || [])];
      pedidoHasMore = (batch?.length || 0) === pedidoPageSize;
      pedidoOffset += pedidoPageSize;
    }

    const pedidosData = allPedidos;

    if (pedidosData.length === 0) {
      setPedidos([]);
      setLoading(false);
      return;
    }

    const pedidoIds = pedidosData.map((p) => p.id);

    let allItens: any[] = [];
    const chunkSize = 200;

    for (let i = 0; i < pedidoIds.length; i += chunkSize) {
      const chunk = pedidoIds.slice(i, i + chunkSize);
      let offset = 0;
      const pageSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data: batch, error } = await supabase
          .from("pedidos_itens" as any)
          .select("*")
          .in("pedido_id", chunk)
          .order("id", { ascending: true })
          .range(offset, offset + pageSize - 1);

        if (error) {
          console.error("Erro ao buscar itens de pedidos:", error);
          break;
        }

        allItens = [...allItens, ...(batch || [])];
        hasMore = (batch?.length || 0) === pageSize;
        offset += pageSize;
      }
    }

    const itensData = allItens;

    const pedidosFormatados: Pedido[] = pedidosData.map((p) => {
      const itens = (itensData || [])
        .filter((i) => i.pedido_id === p.id)
        .map((i) => ({
          produtoId: i.produto_id,
          quantidade: i.quantidade,
        }));

      return {
        id: p.id,
        lojaId: p.loja_id,
        entidadeId: p.entidade_id,
        observacoes: p.observacoes || undefined,
        data: new Date(p.data),
        status: p.status as "pendente" | "feito" | "nao_atendido",
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

    setPedidos((prev) => (JSON.stringify(prev) === JSON.stringify(pedidosFormatados) ? prev : pedidosFormatados));
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPedidos();
  }, [fetchPedidos]);

  // Apenas Realtime (sem polling) — pedidos+itens são pesados demais para polling
  useEffect(() => {
    const channel = supabase
      .channel("pedidos-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "pedidos" }, () => {
        fetchPedidos();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "pedido_itens" }, () => {
        fetchPedidos();
      });
    channel.subscribe();
    return () => {
      try {
        supabase.removeChannel(channel);
      } catch (_) {}
    };
  }, [fetchPedidos]);

  const addPedido = async (pedido: {
    lojaId: string;
    entidadeId: string;
    observacoes?: string;
    itens: PedidoItem[];
    nomeSolicitante?: string;
    emailSolicitante?: string;
    nomeColaborador?: string;
    funcaoColaborador?: string;
    matriculaFuncionario?: string;
    motivoSolicitacao?: string;
  }) => {
    // 1. Salvar na fila offline imediatamente (segurança)
    const offlineData: PedidoOfflineData = {
      lojaId: pedido.lojaId,
      entidadeId: pedido.entidadeId,
      observacoes: pedido.observacoes,
      emailSolicitante: pedido.emailSolicitante,
      itens: pedido.itens,
      nomeSolicitante: pedido.nomeSolicitante,
      nomeColaborador: pedido.nomeColaborador,
      funcaoColaborador: pedido.funcaoColaborador,
      matriculaFuncionario: pedido.matriculaFuncionario,
      motivoSolicitacao: pedido.motivoSolicitacao,
    };
    const localId = addToQueue(offlineData);

    // 2. Tentar enviar ao Supabase
    try {
      const { data: pedidoData, error: pedidoError } = await supabase
        .from("pedidos")
        .insert({
          loja_id: pedido.lojaId,
          entidade_id: pedido.entidadeId,
          observacoes: pedido.observacoes || null,
          status: "pendente",
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
        throw pedidoError || new Error("Sem resposta");
      }

      const itensInsert = pedido.itens.map((item) => ({
        pedido_id: pedidoData.id,
        produto_id: item.produtoId,
        quantidade: item.quantidade,
      }));

      const { error: itensError } = await supabase.from("pedidos_itens" as any).insert(itensInsert);

      if (itensError) {
        await supabase.from("pedidos").delete().eq("id", pedidoData.id);
        throw itensError;
      }

      // 3. Sucesso — remover da fila offline
      markAsSent(localId);
      removeFromQueue(localId);

      const novoPedido: Pedido = {
        id: pedidoData.id,
        lojaId: pedido.lojaId,
        entidadeId: pedido.entidadeId,
        observacoes: pedido.observacoes,
        data: new Date(pedidoData.data),
        status: "pendente",
        corLinha: undefined,
        itens: pedido.itens,
        nomeSolicitante: pedido.nomeSolicitante,
        emailSolicitante: pedido.emailSolicitante,
        nomeColaborador: pedido.nomeColaborador,
        funcaoColaborador: pedido.funcaoColaborador,
        matriculaFuncionario: pedido.matriculaFuncionario,
        motivoSolicitacao: pedido.motivoSolicitacao,
      };
      setPedidos((prev) => [novoPedido, ...prev]);
      return pedidoData;
    } catch (err) {
      // 4. Falha — manter na fila offline, retornar objeto com flag offline
      console.warn("[addPedido] Falha ao enviar, salvo offline:", err);
      return { id: localId, offline: true } as any;
    }
  };

  const updatePedidoStatus = async (
    id: string,
    status: "pendente" | "feito" | "nao_atendido",
    observacoes?: string,
  ) => {
    const updates: Record<string, unknown> = { status };
    if (observacoes !== undefined) updates.observacoes = observacoes;

    const { error } = await supabase.from("pedidos").update(updates).eq("id", id);

    if (!error) {
      setPedidos((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, status: status as Pedido["status"], ...(observacoes !== undefined ? { observacoes } : {}) }
            : p,
        ),
      );
      return true;
    }
    return false;
  };

  const updatePedidoCor = async (id: string, cor: string | undefined) => {
    const { error } = await supabase
      .from("pedidos")
      .update({ cor_linha: cor || null })
      .eq("id", id);

    if (!error) {
      setPedidos((prev) => prev.map((p) => (p.id === id ? { ...p, corLinha: cor } : p)));
      return true;
    }
    return false;
  };

  return { pedidos, loading, fetchPedidos, addPedido, updatePedidoStatus, updatePedidoCor };
}

// ============= CÓDIGO ADMIN =============
export function useCodigoAdmin() {
  const [codigoAdmin, setCodigoAdmin] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const fetchCodigoAdmin = useCallback(async () => {
    const { data, error } = await supabase
      .from("configuracoes" as any)
      .select("valor")
      .eq("chave", "codigo_admin")
      .maybeSingle();

    if (!error && data) {
      setCodigoAdmin((data as any).valor);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCodigoAdmin();
  }, [fetchCodigoAdmin]);

  const updateCodigoAdmin = async (novoCodigo: string) => {
    const { error } = await supabase
      .from("configuracoes" as any)
      .update({ valor: novoCodigo })
      .eq("chave", "codigo_admin");

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
      .from("inventario")
      .select("*")
      .order("data_conferencia", { ascending: false });

    if (!error && data) {
      setInventario(
        data.map((i: any) => ({
          id: i.id,
          produtoId: i.produto_id,
          entidadeId: i.entidade_id,
          quantidade: i.quantidade,
          unidadeMedida: i.unidade_medida || "un",
          dataConferencia: new Date(i.data_conferencia),
          status: i.status as "pendente" | "conferido",
        })),
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchInventario();
  }, [fetchInventario]);

  const conferirProduto = async (
    produtoId: string,
    entidadeId: string,
    quantidade: number,
    unidadeMedida: string = "un",
  ) => {
    const { error } = await supabase.from("inventario").upsert(
      {
        produto_id: produtoId,
        entidade_id: entidadeId,
        quantidade,
        unidade_medida: unidadeMedida,
        data_conferencia: new Date().toISOString(),
        status: "conferido",
      },
      {
        onConflict: "produto_id",
      },
    );

    if (!error) {
      await fetchInventario();
      return true;
    }
    console.error("Erro ao conferir produto:", error);
    return false;
  };

  return { inventario, loading, fetchInventario, conferirProduto };
}

// ============= ESTOQUE ESTIMADO =============
export function useEstoqueEstimado(inventarioList: Inventario[], entidadeIds: string[]) {
  const [estimativas, setEstimativas] = useState<Map<string, { saidas: number; estimado: number }>>(new Map());
  const [loading, setLoading] = useState(false);

  const calcular = useCallback(async () => {
    const conferidos = inventarioList.filter((i) => i.status === "conferido" && i.quantidade !== null);
    if (conferidos.length === 0 || entidadeIds.length === 0) {
      setEstimativas(new Map());
      return;
    }

    setLoading(true);
    try {
      const novasEstimativas = new Map<string, { saidas: number; estimado: number }>();

      const dataMinima = conferidos.reduce((min, i) => {
        return i.dataConferencia < min ? i.dataConferencia : min;
      }, conferidos[0].dataConferencia);

      let allPedidos: any[] = [];
      let offset = 0;
      const pageSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data: batch, error } = await supabase
          .from("pedidos")
          .select("id, data, entidade_id")
          .in("entidade_id", entidadeIds)
          .gt("data", dataMinima.toISOString())
          .range(offset, offset + pageSize - 1);

        if (error) break;
        allPedidos = [...allPedidos, ...(batch || [])];
        hasMore = (batch?.length || 0) === pageSize;
        offset += pageSize;
      }

      if (allPedidos.length === 0) {
        setEstimativas(new Map());
        setLoading(false);
        return;
      }

      const pedidoIds = allPedidos.map((p) => p.id);
      let allItens: any[] = [];
      const chunkSize = 200;

      for (let i = 0; i < pedidoIds.length; i += chunkSize) {
        const chunk = pedidoIds.slice(i, i + chunkSize);
        let iOffset = 0;
        let iHasMore = true;

        while (iHasMore) {
          const { data: batch, error } = await supabase
            .from("pedidos_itens" as any)
            .select("pedido_id, produto_id, quantidade")
            .in("pedido_id", chunk)
            .range(iOffset, iOffset + pageSize - 1);

          if (error) break;
          allItens = [...allItens, ...(batch || [])];
          iHasMore = (batch?.length || 0) === pageSize;
          iOffset += pageSize;
        }
      }

      const pedidoDataMap = new Map<string, Date>();
      allPedidos.forEach((p) => pedidoDataMap.set(p.id, new Date(p.data)));

      for (const inv of conferidos) {
        let totalSaidas = 0;

        for (const item of allItens) {
          if (item.produto_id !== inv.produtoId) continue;
          const dataPedido = pedidoDataMap.get(item.pedido_id);
          if (dataPedido && dataPedido > inv.dataConferencia) {
            totalSaidas += item.quantidade;
          }
        }

        if (totalSaidas > 0) {
          novasEstimativas.set(inv.produtoId, {
            saidas: totalSaidas,
            estimado: inv.quantidade - totalSaidas,
          });
        }
      }

      setEstimativas(novasEstimativas);
    } catch (err) {
      console.error("Erro ao calcular estoque estimado:", err);
    } finally {
      setLoading(false);
    }
  }, [inventarioList, entidadeIds]);

  useEffect(() => {
    calcular();
  }, [calcular]);

  return { estimativas, loading };
}

// Hook para controle visual de separação de produtos
export function useSeparacao() {
  const [separacoes, setSeparacoes] = useState<Map<string, boolean>>(new Map());
  const [loading, setLoading] = useState(false);

  const fetchSeparacoes = async (pedidoId: string) => {
    try {
      const { data, error } = await supabase.from("pedido_separacao_itens").select("*").eq("pedido_id", pedidoId);

      if (error) throw error;

      const map = new Map<string, boolean>();
      data?.forEach((item) => {
        map.set(`${item.pedido_id}_${item.produto_id}`, item.separado);
      });
      setSeparacoes((prev) => {
        const newMap = new Map(prev);
        data?.forEach((item) => {
          newMap.set(`${item.pedido_id}_${item.produto_id}`, item.separado);
        });
        return newMap;
      });
      return data;
    } catch (error) {
      console.error("Erro ao buscar separações:", error);
      return [];
    }
  };

  const fetchSeparacoesMultiplos = async (pedidoIds: string[]) => {
    if (pedidoIds.length === 0) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from("pedido_separacao_itens").select("*").in("pedido_id", pedidoIds);

      if (error) throw error;

      const map = new Map<string, boolean>();
      data?.forEach((item) => {
        map.set(`${item.pedido_id}_${item.produto_id}`, item.separado);
      });
      setSeparacoes(map);
    } catch (error) {
      console.error("Erro ao buscar separações:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSeparacao = async (pedidoId: string, produtoId: string) => {
    const key = `${pedidoId}_${produtoId}`;
    const currentValue = separacoes.get(key);
    const novoValor = currentValue === undefined ? false : !currentValue;

    setSeparacoes((prev) => {
      const newMap = new Map(prev);
      newMap.set(key, novoValor);
      return newMap;
    });

    try {
      const { error } = await supabase.from("pedido_separacao_itens").upsert(
        {
          pedido_id: pedidoId,
          produto_id: produtoId,
          separado: novoValor,
          data_registro: new Date().toISOString(),
        },
        {
          onConflict: "pedido_id,produto_id",
        },
      );

      if (error) throw error;
      return true;
    } catch (error) {
      setSeparacoes((prev) => {
        const newMap = new Map(prev);
        if (currentValue === undefined) {
          newMap.delete(key);
        } else {
          newMap.set(key, currentValue);
        }
        return newMap;
      });
      console.error("Erro ao atualizar separação:", error);
      return false;
    }
  };

  const isSeparado = (pedidoId: string, produtoId: string): boolean => {
    const key = `${pedidoId}_${produtoId}`;
    const value = separacoes.get(key);
    return value === undefined ? true : value;
  };

  return {
    separacoes,
    loading,
    fetchSeparacoes,
    fetchSeparacoesMultiplos,
    toggleSeparacao,
    isSeparado,
  };
}

// ============= LOJA ENTIDADES (PERMISSÕES) =============
export function useLojaEntidades() {
  const [lojaEntidades, setLojaEntidades] = useState<LojaEntidade[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLojaEntidades = useCallback(async () => {
    if (supabaseRestricted) return;
    const { data, error } = await supabase.from("loja_entidades").select("*");

    if (error) {
      const cached = loadFromCache<LojaEntidade[]>("lojaEntidades");
      if (cached) {
        setLojaEntidades(cached);
        console.log("[Cache] Usando lojaEntidades do cache local");
      }
      setLoading(false);
      return;
    }
    if (data) {
      const mapped = data.map((le: any) => ({
        id: le.id,
        lojaId: le.loja_id,
        entidadeId: le.entidade_id,
        criadoEm: new Date(le.criado_em),
      }));
      setLojaEntidades(mapped);
      saveToCache("lojaEntidades", mapped);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLojaEntidades();
  }, [fetchLojaEntidades]);

  // Polling 30s + Realtime
  useEffect(() => {
    const interval = setInterval(fetchLojaEntidades, 30000);
    const channel = supabase
      .channel("loja-entidades-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "loja_entidades" }, () => {
        fetchLojaEntidades();
      });
    channel.subscribe();
    return () => {
      clearInterval(interval);
      try {
        supabase.removeChannel(channel);
      } catch (_) {}
    };
  }, [fetchLojaEntidades]);

  const setPermissoes = async (lojaId: string, entidadeIds: string[]) => {
    await supabase.from("loja_entidades").delete().eq("loja_id", lojaId);

    if (entidadeIds.length > 0) {
      const inserts = entidadeIds.map((entidadeId) => ({
        loja_id: lojaId,
        entidade_id: entidadeId,
      }));
      await supabase.from("loja_entidades").insert(inserts);
    }

    await fetchLojaEntidades();
    return true;
  };

  const getEntidadesPermitidas = (lojaId: string): string[] => {
    return lojaEntidades.filter((le) => le.lojaId === lojaId).map((le) => le.entidadeId);
  };

  return { lojaEntidades, loading, fetchLojaEntidades, setPermissoes, getEntidadesPermitidas };
}
