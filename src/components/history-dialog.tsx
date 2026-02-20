
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HistoryEntry } from '@/lib/types';
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[500px] p-0 gap-0 h-[85vh] sm:h-auto sm:max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader className="p-4 sm:p-6 shrink-0 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Histórico de Retiradas
          </DialogTitle>
          <DialogDescription>
            Veja as últimas contas retiradas e as mensagens geradas.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto bg-muted/10">
          <div className="p-4 space-y-4">
            {history.length > 0 ? (
              history.map((entry) => (
                <div key={entry.id} className="p-3 border rounded-lg bg-white shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-primary truncate">{entry.service}</h4>
                      <p className="text-[10px] text-muted-foreground font-mono truncate">{entry.account}</p>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium uppercase justify-end">
                        <Calendar className="w-3 h-3" />
                        {format(entry.timestamp, "dd/MM/yy", { locale: ptBR })}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium uppercase justify-end">
                        <Clock className="w-3 h-3" />
                        {format(entry.timestamp, "HH:mm", { locale: ptBR })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-muted p-2 rounded border text-[11px] font-mono whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto">
                    {entry.message}
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full h-8 text-[11px]" 
                    onClick={() => copyMessage(entry.message)}
                  >
                    <Copy className="w-3 h-3 mr-2" />
                    Copiar Mensagem
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-20 text-muted-foreground text-sm">
                Nenhuma venda registrada no histórico.
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="p-4 border-t bg-white shrink-0 gap-2 flex flex-col sm:flex-row">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-10 order-2 sm:order-1"
            onClick={onClearHistory}
            disabled={history.length === 0}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Limpar Tudo
          </Button>
          <Button onClick={() => onOpenChange(false)} className="h-10 flex-1 order-1 sm:order-2">Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
