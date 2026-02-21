'use client';

import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InventoryItem, HistoryEntry } from '@/lib/types';
import { Copy, AlertCircle, Sparkles, RefreshCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

interface WithdrawAccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: InventoryItem[];
  onWithdraw: (id: string, historyEntry: HistoryEntry) => void;
  services: string[];
}

export function WithdrawAccessDialog({ open, onOpenChange, items, onWithdraw, services }: WithdrawAccessDialogProps) {
  const { toast } = useToast();
  const [selectedService, setSelectedService] = useState<string | ''>('');
  const [isSupport, setIsSupport] = useState<'no' | 'yes'>('no');
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const availableItems = useMemo(() => {
    return items.filter(item => item.status === 'available');
  }, [items]);

  const activeUniqueServices = useMemo(() => {
    const servicesInStock = availableItems.map(item => item.service);
    return services.filter(s => servicesInStock.includes(s));
  }, [availableItems, services]);

  const handleGenerate = () => {
    const itemsForService = availableItems
      .filter(item => item.service === selectedService)
      .sort((a, b) => a.createdAt - b.createdAt);
    
    const item = itemsForService[0];
    if (!item) return;

    const serviceDisplay = isSupport === 'yes' ? `${item.service} - SUPORTE` : item.service;
    
    let message = `🔴*${serviceDisplay}*🔴\n\n`;
    message += `> *ACESSO:* ${item.account}\n`;
    message += `> *SENHA:* ${item.credentials}\n`;
    
    if (item.profiles) {
      const nextProfileNum = ((item.profilesUsed || 0) + 1).toString().padStart(2, '0');
      message += `> *PERFIL PRIVADO:* PERFIL ${nextProfileNum}\n`;
    }

    message += `\n🚨 *Proibido altera senha da conta ou dos perfis* 🚨`;

    setGeneratedMessage(message);
    setSelectedItemId(item.id);
  };

  const handleCopyAndFinish = () => {
    const item = items.find(i => i.id === selectedItemId);
    if (!item) return;

    navigator.clipboard.writeText(generatedMessage).then(() => {
      const historyEntry: HistoryEntry = {
        id: crypto.randomUUID(),
        itemId: item.id,
        service: item.service,
        account: item.account,
        message: generatedMessage,
        timestamp: Date.now()
      };

      onWithdraw(item.id, historyEntry);
      
      toast({
        title: "Copiado!",
        description: "Acesso retirado e gravado no histórico.",
      });
      resetAndClose();
    }).catch(() => {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível copiar para a área de transferência.",
      });
    });
  };

  const resetAndClose = () => {
    setSelectedService('');
    setIsSupport('no');
    setGeneratedMessage('');
    setSelectedItemId(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[450px] p-0 gap-0 overflow-hidden flex flex-col max-h-[90vh]">
        <DialogHeader className="p-6 pb-2 shrink-0 border-b bg-white z-10">
          <DialogTitle>Retirar Acesso</DialogTitle>
          <DialogDescription>
            Pega automaticamente a conta disponível mais antiga.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-5">
            {!generatedMessage ? (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label>Selecione o Serviço</Label>
                  <Select value={selectedService} onValueChange={(val) => setSelectedService(val)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Escolha..." />
                    </SelectTrigger>
                    <SelectContent>
                      {activeUniqueServices.length > 0 ? (
                        activeUniqueServices.map(service => (
                          <SelectItem key={service} value={service}>{service}</SelectItem>
                        ))
                      ) : (
                        <div className="p-4 text-sm text-muted-foreground text-center">
                          Sem estoque disponível.
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Finalidade</Label>
                  <Select value={isSupport} onValueChange={(val) => setIsSupport(val as 'no' | 'yes')}>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">Venda Nova</SelectItem>
                      <SelectItem value="yes">Suporte / Reposição</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  className="w-full h-12 bg-primary hover:bg-primary/90 mt-4 shadow-md" 
                  disabled={!selectedService} 
                  onClick={handleGenerate}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Gerar Mensagem de Entrega
                </Button>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Mensagem de Entrega:</Label>
                  <Textarea 
                    readOnly 
                    value={generatedMessage} 
                    className="h-48 font-mono text-xs sm:text-sm resize-none bg-muted border-primary/20 leading-relaxed"
                  />
                </div>
                <div className="flex items-start gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg text-[11px] text-primary">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>Ao copiar, o perfil/conta será marcado como vendido automaticamente.</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="p-6 pt-4 shrink-0 flex flex-col sm:flex-row gap-2 border-t bg-white">
          {generatedMessage ? (
            <>
              <Button variant="outline" onClick={() => setGeneratedMessage('')} className="w-full sm:flex-1 h-11">
                <RefreshCcw className="w-4 h-4 mr-2" />
                Trocar Conta
              </Button>
              <Button className="w-full sm:flex-1 bg-green-600 hover:bg-green-700 h-11 shadow-lg" onClick={handleCopyAndFinish}>
                <Copy className="w-4 h-4 mr-2" />
                Copiar e Baixar
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={resetAndClose} className="w-full h-11">Cancelar</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
