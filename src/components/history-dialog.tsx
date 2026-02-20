'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HistoryEntry } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, Calendar, Copy, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface HistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  history: HistoryEntry[];
  onClearHistory: () => void;
}

export function HistoryDialog({ open, onOpenChange, history, onClearHistory }: HistoryDialogProps) {
  const { toast } = useToast();

  const copyMessage = (message: string) => {
    navigator.clipboard.writeText(message);
    toast({
      title: "Mensagem copiada!",
      description: "O conteúdo foi copiado para sua área de transferência.",
    });
  };

  const handleClear = () => {
    if (window.confirm("Deseja realmente apagar todo o histórico de vendas?")) {
      onClearHistory();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[500px] p-4 sm:p-6 max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Histórico de Retiradas
          </DialogTitle>
          <DialogDescription>
            Veja as últimas contas retiradas e as mensagens geradas.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 mt-4 pr-3">
          <div className="space-y-4">
            {history.length > 0 ? (
              history.map((entry) => (
                <div key={entry.id} className="p-4 border rounded-lg bg-muted/30 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-primary">{entry.service}</h4>
                      <p className="text-xs text-muted-foreground font-mono">{entry.account}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium uppercase">
                        <Calendar className="w-3 h-3" />
                        {format(entry.timestamp, "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium uppercase justify-end">
                        <Clock className="w-3 h-3" />
                        {format(entry.timestamp, "HH:mm", { locale: ptBR })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-2 rounded border text-[11px] font-mono whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto">
                    {entry.message}
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full h-8 text-[11px]" 
                    onClick={() => copyMessage(entry.message)}
                  >
                    <Copy className="w-3 h-3 mr-2" />
                    Copiar Mensagem Novamente
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-muted-foreground text-sm">
                Nenhuma venda registrada no histórico.
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="mt-4 gap-2 flex flex-col sm:flex-row">
          <Button 
            variant="ghost" 
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleClear}
            disabled={history.length === 0}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Limpar Histórico
          </Button>
          <Button onClick={() => onOpenChange(false)} className="flex-1">Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
