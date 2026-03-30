import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const LOCAL_KEY = 'manutencao_local';

export function useMaintenanceMode() {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchMaintenanceMode = useCallback(async () => {
    // 1. Verificar localStorage PRIMEIRO (funciona offline)
    try {
      const localValue = localStorage.getItem(LOCAL_KEY);
      if (localValue === 'true') {
        setIsMaintenanceMode(true);
        setLoading(false);
        // Ainda tenta sincronizar com remoto, mas já está ativo
        try {
          const { data, error } = await supabase
            .from('configuracoes' as any)
            .select('valor')
            .eq('chave', 'maintenance_mode')
            .single();
          // Se remoto diz false mas local diz true, local vence
          // (admin ativou localmente quando Supabase caiu)
        } catch {}
        return;
      }
    } catch {}

    // 2. Se local não está ativo, tentar Supabase
    try {
      const { data, error } = await supabase
        .from('configuracoes' as any)
        .select('valor')
        .eq('chave', 'maintenance_mode')
        .single();

      if (!error && data) {
        const remoteValue = (data as any).valor === 'true';
        setIsMaintenanceMode(remoteValue);
        // Sincronizar local com remoto
        try {
          localStorage.setItem(LOCAL_KEY, remoteValue ? 'true' : 'false');
        } catch {}
      }
    } catch {
      // Supabase indisponível — usar valor local
      try {
        const localValue = localStorage.getItem(LOCAL_KEY);
        setIsMaintenanceMode(localValue === 'true');
      } catch {}
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMaintenanceMode();
  }, [fetchMaintenanceMode]);

  const toggleMaintenanceMode = async () => {
    const newValue = !isMaintenanceMode;

    // Sempre gravar no localStorage (funciona offline)
    try {
      localStorage.setItem(LOCAL_KEY, newValue ? 'true' : 'false');
    } catch {}

    // Tentar gravar no Supabase (pode falhar se offline)
    try {
      const { error } = await supabase
        .from('configuracoes' as any)
        .update({ valor: newValue ? 'true' : 'false' })
        .eq('chave', 'maintenance_mode');

      if (error) {
        console.warn('[Maintenance] Falha ao gravar no Supabase, usando apenas local:', error);
      }
    } catch {
      console.warn('[Maintenance] Supabase indisponível, gravado apenas localmente');
    }

    setIsMaintenanceMode(newValue);
    return true;
  };

  return { 
    isMaintenanceMode, 
    loading, 
    toggleMaintenanceMode, 
    refetch: fetchMaintenanceMode 
  };
}
