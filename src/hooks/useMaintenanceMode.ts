import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useMaintenanceMode() {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchMaintenanceMode = useCallback(async () => {
    const { data, error } = await supabase
      .from('configuracoes')
      .select('valor')
      .eq('chave', 'maintenance_mode')
      .single();

    if (!error && data) {
      setIsMaintenanceMode(data.valor === 'true');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMaintenanceMode();
  }, [fetchMaintenanceMode]);

  const toggleMaintenanceMode = async () => {
    const newValue = !isMaintenanceMode;
    const { error } = await supabase
      .from('configuracoes')
      .update({ valor: newValue ? 'true' : 'false' })
      .eq('chave', 'maintenance_mode');

    if (!error) {
      setIsMaintenanceMode(newValue);
      return true;
    }
    return false;
  };

  return { 
    isMaintenanceMode, 
    loading, 
    toggleMaintenanceMode, 
    refetch: fetchMaintenanceMode 
  };
}
