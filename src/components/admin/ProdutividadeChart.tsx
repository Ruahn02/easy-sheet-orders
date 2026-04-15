import { useMemo, useState } from 'react';
import { format, eachDayOfInterval, startOfDay, endOfDay, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';
import type { Pedido, Entidade, Loja } from '@/types';

interface ProdutividadeChartProps {
  pedidos: Pedido[];
  entidades: Entidade[];
  lojas: Loja[];
  entidadesFiltro: string[];
  lojaFiltro: string[];
  dataInicio?: Date;
  dataFim?: Date;
}

export function ProdutividadeChart({
  pedidos,
  entidades,
  lojas,
  entidadesFiltro,
  lojaFiltro,
  dataInicio,
  dataFim,
}: ProdutividadeChartProps) {
  const [periodoLocal, setPeriodoLocal] = useState('30');

  // Determinar intervalo de datas
  const intervalo = useMemo(() => {
    const fim = dataFim ? endOfDay(dataFim) : endOfDay(new Date());
    const inicio = dataInicio ? startOfDay(dataInicio) : startOfDay(subDays(fim, parseInt(periodoLocal) - 1));
    return { inicio, fim };
  }, [dataInicio, dataFim, periodoLocal]);

  // Filtrar pedidos concluídos
  const pedidosConcluidos = useMemo(() => {
    return pedidos.filter((p) => {
      if (p.status !== 'feito') return false;
      if (!p.dataConclusao) return false;
      const dc = new Date(p.dataConclusao);
      if (dc < intervalo.inicio || dc > intervalo.fim) return false;
      if (entidadesFiltro.length > 0 && !entidadesFiltro.includes(p.entidadeId)) return false;
      if (lojaFiltro.length > 0 && !lojaFiltro.includes(p.lojaId)) return false;
      return true;
    });
  }, [pedidos, intervalo, entidadesFiltro, lojaFiltro]);

  // Agrupar por dia
  const dadosGrafico = useMemo(() => {
    const dias = eachDayOfInterval({ start: intervalo.inicio, end: intervalo.fim });
    const contagemPorDia: Record<string, number> = {};

    dias.forEach((dia) => {
      contagemPorDia[format(dia, 'yyyy-MM-dd')] = 0;
    });

    pedidosConcluidos.forEach((p) => {
      if (!p.dataConclusao) return;
      const key = format(new Date(p.dataConclusao), 'yyyy-MM-dd');
      if (key in contagemPorDia) {
        contagemPorDia[key]++;
      }
    });

    return dias.map((dia) => {
      const key = format(dia, 'yyyy-MM-dd');
      return {
        data: key,
        label: format(dia, 'dd/MM', { locale: ptBR }),
        concluidos: contagemPorDia[key] || 0,
      };
    });
  }, [pedidosConcluidos, intervalo]);

  const totalConcluidos = pedidosConcluidos.length;
  const mediaDiaria = dadosGrafico.length > 0 ? (totalConcluidos / dadosGrafico.length).toFixed(1) : '0';

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            Produtividade
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{totalConcluidos} concluídos</Badge>
            <Badge variant="outline">{mediaDiaria}/dia</Badge>
            {!dataInicio && !dataFim && (
              <Select value={periodoLocal} onValueChange={setPeriodoLocal}>
                <SelectTrigger className="w-[130px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 dias</SelectItem>
                  <SelectItem value="14">14 dias</SelectItem>
                  <SelectItem value="30">30 dias</SelectItem>
                  <SelectItem value="60">60 dias</SelectItem>
                  <SelectItem value="90">90 dias</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {dadosGrafico.length > 0 ? (
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosGrafico} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11 }}
                  className="fill-muted-foreground"
                  interval={dadosGrafico.length > 15 ? Math.floor(dadosGrafico.length / 10) : 0}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11 }}
                  className="fill-muted-foreground"
                  width={30}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="rounded-lg border bg-background px-3 py-2 shadow-md">
                        <p className="text-sm font-medium">{label}</p>
                        <p className="text-sm text-primary font-bold">
                          {payload[0].value} pedido{Number(payload[0].value) !== 1 ? 's' : ''} concluído{Number(payload[0].value) !== 1 ? 's' : ''}
                        </p>
                      </div>
                    );
                  }}
                />
                <Bar
                  dataKey="concluidos"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum pedido concluído no período selecionado.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
