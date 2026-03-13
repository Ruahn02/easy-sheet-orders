import { useState, useMemo } from 'react';
import { Store, Calendar, List, X } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay, startOfWeek, startOfMonth, startOfQuarter, startOfYear, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { Pedido, Produto, Loja } from '@/types';

type PeriodoPreset = 'hoje' | 'esta_semana' | 'semana_passada' | 'este_mes' | 'mes_passado' | 'trimestre' | 'semestre' | 'ano' | 'personalizado';

interface LojasAnalyticsProps {
  pedidos: Pedido[];
  lojas: Loja[];
  produtos: Produto[];
  entidadeFiltro: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LojasAnalytics({
  pedidos,
  lojas,
  produtos,
  entidadeFiltro,
  open,
  onOpenChange,
}: LojasAnalyticsProps) {
  const [periodoPreset, setPeriodoPreset] = useState<PeriodoPreset>('este_mes');
  const [dataInicioLocal, setDataInicioLocal] = useState<Date | undefined>(undefined);
  const [dataFimLocal, setDataFimLocal] = useState<Date | undefined>(undefined);

  const { dataInicio, dataFim } = useMemo(() => {
    const hoje = new Date();
    switch (periodoPreset) {
      case 'hoje':
        return { dataInicio: startOfDay(hoje), dataFim: endOfDay(hoje) };
      case 'esta_semana':
        return { dataInicio: startOfWeek(hoje, { weekStartsOn: 1 }), dataFim: endOfDay(hoje) };
      case 'semana_passada': {
        const inicioSemanaPassada = startOfWeek(subDays(hoje, 7), { weekStartsOn: 1 });
        const fimSemanaPassada = endOfDay(subDays(startOfWeek(hoje, { weekStartsOn: 1 }), 1));
        return { dataInicio: inicioSemanaPassada, dataFim: fimSemanaPassada };
      }
      case 'este_mes':
        return { dataInicio: startOfMonth(hoje), dataFim: endOfDay(hoje) };
      case 'mes_passado': {
        const mesPassado = subMonths(hoje, 1);
        return { dataInicio: startOfMonth(mesPassado), dataFim: endOfDay(subDays(startOfMonth(hoje), 1)) };
      }
      case 'trimestre':
        return { dataInicio: startOfQuarter(hoje), dataFim: endOfDay(hoje) };
      case 'semestre':
        return { dataInicio: startOfDay(subMonths(hoje, 6)), dataFim: endOfDay(hoje) };
      case 'ano':
        return { dataInicio: startOfYear(hoje), dataFim: endOfDay(hoje) };
      case 'personalizado':
        return {
          dataInicio: dataInicioLocal ? startOfDay(dataInicioLocal) : undefined,
          dataFim: dataFimLocal ? endOfDay(dataFimLocal) : undefined,
        };
      default:
        return { dataInicio: undefined, dataFim: undefined };
    }
  }, [periodoPreset, dataInicioLocal, dataFimLocal]);

  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter((pedido) => {
      if (entidadeFiltro.length > 0 && !entidadeFiltro.includes(pedido.entidadeId)) return false;
      const dataPedido = new Date(pedido.data);
      if (dataInicio && dataPedido < dataInicio) return false;
      if (dataFim && dataPedido > dataFim) return false;
      return true;
    });
  }, [pedidos, entidadeFiltro, dataInicio, dataFim]);

  const lojasConsolidadas = useMemo(() => {
    const contagem: Record<string, { pedidos: number; itens: number }> = {};

    pedidosFiltrados.forEach((pedido) => {
      if (!contagem[pedido.lojaId]) {
        contagem[pedido.lojaId] = { pedidos: 0, itens: 0 };
      }
      contagem[pedido.lojaId].pedidos += 1;
      pedido.itens.forEach((item) => {
        contagem[pedido.lojaId].itens += item.quantidade;
      });
    });

    return Object.entries(contagem)
      .map(([lojaId, dados]) => {
        const loja = lojas.find((l) => l.id === lojaId);
        return loja ? { loja, ...dados } : null;
      })
      .filter((item): item is { loja: Loja; pedidos: number; itens: number } => item !== null)
      .sort((a, b) => b.itens - a.itens);
  }, [pedidosFiltrados, lojas]);

  const totalItensNoPeriodo = lojasConsolidadas.reduce((acc, item) => acc + item.itens, 0);

  const getPresetLabel = () => {
    switch (periodoPreset) {
      case 'hoje': return 'Hoje';
      case 'esta_semana': return 'Esta Semana';
      case 'semana_passada': return 'Semana Passada';
      case 'este_mes': return 'Este Mês';
      case 'mes_passado': return 'Mês Passado';
      case 'trimestre': return 'Trimestre';
      case 'semestre': return 'Semestre';
      case 'ano': return 'Ano';
      case 'personalizado':
        if (dataInicioLocal && dataFimLocal) {
          return `${format(dataInicioLocal, 'dd/MM')} - ${format(dataFimLocal, 'dd/MM')}`;
        }
        return 'Personalizado';
      default: return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-6 [&>button]:top-4 [&>button]:right-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="h-5 w-5 text-accent" />
            Consumo por Loja
          </DialogTitle>
        </DialogHeader>

        {/* Filtros de período */}
        <div className="space-y-3 pb-4 border-b">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Período:</span>
            <Badge variant="secondary">{getPresetLabel()}</Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            {([
              ['hoje', 'Hoje'],
              ['esta_semana', 'Esta Semana'],
              ['semana_passada', 'Sem. Passada'],
              ['este_mes', 'Este Mês'],
              ['mes_passado', 'Mês Passado'],
              ['trimestre', 'Trimestre'],
              ['semestre', 'Semestre'],
              ['ano', 'Ano'],
              ['personalizado', 'Personalizado'],
            ] as [PeriodoPreset, string][]).map(([key, label]) => (
              <Button
                key={key}
                variant={periodoPreset === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPeriodoPreset(key)}
              >
                {label}
              </Button>
            ))}
          </div>

          {periodoPreset === 'personalizado' && (
            <div className="flex flex-wrap gap-3 pt-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      'justify-start text-left font-normal min-w-[140px]',
                      !dataInicioLocal && 'text-muted-foreground'
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {dataInicioLocal ? format(dataInicioLocal, 'dd/MM/yyyy') : 'Data início'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={dataInicioLocal}
                    onSelect={setDataInicioLocal}
                    locale={ptBR}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      'justify-start text-left font-normal min-w-[140px]',
                      !dataFimLocal && 'text-muted-foreground'
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {dataFimLocal ? format(dataFimLocal, 'dd/MM/yyyy') : 'Data fim'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={dataFimLocal}
                    onSelect={setDataFimLocal}
                    locale={ptBR}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>

              {(dataInicioLocal || dataFimLocal) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDataInicioLocal(undefined);
                    setDataFimLocal(undefined);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Resumo */}
        <div className="flex items-center justify-between py-3 px-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <List className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {lojasConsolidadas.length} lojas encontradas
            </span>
          </div>
          <Badge variant="outline" className="font-mono">
            Total: {totalItensNoPeriodo} itens
          </Badge>
        </div>

        {/* Lista de lojas */}
        <div className="flex-1 min-h-0 overflow-y-auto -mx-6 px-6" style={{ WebkitOverflowScrolling: 'touch' }}>
          {lojasConsolidadas.length > 0 ? (
            <div className="space-y-2 pr-4">
              {lojasConsolidadas.map((item, index) => {
                const maxItens = lojasConsolidadas[0]?.itens || 1;
                const percentage = (item.itens / maxItens) * 100;

                return (
                  <div
                    key={item.loja.id}
                    className="p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent shrink-0">
                          {index + 1}
                        </span>
                        <p className="text-sm font-medium text-foreground truncate">
                          {item.loja.nome}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-lg font-bold text-accent">{item.itens}</span>
                        <span className="text-xs text-muted-foreground ml-1">itens</span>
                        <p className="text-xs text-muted-foreground">{item.pedidos} pedido{item.pedidos !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden ml-10">
                      <div
                        className="h-full bg-accent rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Store className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                Nenhum consumo encontrado neste período.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
