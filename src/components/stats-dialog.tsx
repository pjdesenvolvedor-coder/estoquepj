'use client';

import { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { InventoryItem } from '@/lib/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LayoutGrid, Package } from 'lucide-react';

interface StatsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: InventoryItem[];
  services: string[];
}

const COLORS = [
  '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', 
  '#ec4899', '#06b6d4', '#84cc16', '#6366f1', '#f43f5e'
];

export function StatsDialog({ open, onOpenChange, items, services }: StatsDialogProps) {
  const stats = useMemo(() => {
    const availableItems = items.filter(item => item.status === 'available');
    
    return services.map(service => {
      const serviceItems = availableItems.filter(item => item.service === service);
      let totalCount = 0;
      
      serviceItems.forEach(item => {
        if (item.profiles) {
          // Conta quantos perfis restam
          totalCount += (item.profiles - (item.profilesUsed || 0));
        } else {
          // Conta a conta inteira
          totalCount += 1;
        }
      });

      return {
        name: service,
        value: totalCount,
      };
    }).filter(s => s.value > 0);
  }, [items, services]);

  const chartConfig = useMemo(() => {
    const config: any = {};
    stats.forEach((s, i) => {
      config[s.name] = {
        label: s.name,
        color: COLORS[i % COLORS.length],
      };
    });
    return config;
  }, [stats]);

  const totalSubscriptions = stats.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[600px] p-0 gap-0 h-[85vh] sm:h-auto sm:max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader className="p-4 sm:p-6 shrink-0 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Resumo do Estoque
          </DialogTitle>
          <DialogDescription>
            Análise detalhada de assinaturas disponíveis por serviço.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-8 bg-muted/5">
          {stats.length > 0 ? (
            <>
              {/* Gráfico de Pizza */}
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-2 border rounded shadow-sm text-xs">
                              <p className="font-bold">{payload[0].name}</p>
                              <p className="text-muted-foreground">{payload[0].value} assinaturas</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Blocos de Quantidade */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="col-span-full p-3 bg-primary/5 border border-primary/20 rounded-lg text-center">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total em Estoque</p>
                  <p className="text-3xl font-bold text-primary">{totalSubscriptions}</p>
                </div>
                
                {stats.map((s, i) => (
                  <div key={s.name} className="p-3 bg-white border rounded-lg shadow-sm space-y-1">
                    <div 
                      className="w-2 h-2 rounded-full mb-1" 
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    <p className="text-[11px] font-bold text-primary truncate">{s.name}</p>
                    <p className="text-xl font-bold">{s.value}</p>
                    <p className="text-[10px] text-muted-foreground">Disponíveis</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <LayoutGrid className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Nenhum item disponível no estoque no momento.</p>
            </div>
          )}
        </div>

        <DialogFooter className="p-4 border-t bg-white shrink-0">
          <Button onClick={() => onOpenChange(false)} className="w-full h-11">Fechar Resumo</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
