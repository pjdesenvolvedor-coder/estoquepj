'use client';

import { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InventoryItem, ServiceType } from '@/lib/types';
import { Copy, AlertCircle, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

interface WithdrawAccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: InventoryItem[];
  onWithdraw: (id: string) => void;
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

  // Apenas serviços que existem nas configurações E possuem estoque
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
    message += `> *EMAIL:* ${item.account}\n`;
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
    navigator.clipboard.writeText(generatedMessage);
    if (selectedItemId) {
      onWithdraw(selectedItemId);
    }
    toast({
      title: "Sucesso!",
      description: "Mensagem copiada e retirada registrada.",
    });
    resetAndClose();
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
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Retirar Acesso</DialogTitle>
          <DialogDescription>
            O sistema escolherá automaticamente a conta mais antiga disponível.
          </DialogDescription>
        </DialogHeader>

        {!generatedMessage ? (
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label>Serviço</Label>
              <Select value={selectedService} onValueChange={(val) => setSelectedService(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha o serviço..." />
                </SelectTrigger>
                <SelectContent>
                  {activeUniqueServices.length > 0 ? (
                    activeUniqueServices.map(service => (
                      <SelectItem key={service} value={service}>{service}</SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground text-center">Nenhum serviço disponível com estoque</div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Entrega</Label>
              <Select value={isSupport} onValueChange={(val) => setIsSupport(val as 'no' | 'yes')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">Venda Comum</SelectItem>
                  <SelectItem value="yes">Suporte / Reposição</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              className="w-full h-11 bg-primary hover:bg-primary/90" 
              disabled={!selectedService} 
              onClick={handleGenerate}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Gerar Mensagem de Entrega
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Mensagem Pronta para Enviar:</Label>
              <Textarea 
                readOnly 
                value={generatedMessage} 
                className="h-48 font-mono text-sm resize-none bg-muted border-primary/20"
              />
            </div>
            <div className="flex items-start gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg text-xs text-primary">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p>Ao copiar, o estoque será atualizado automaticamente.</p>
            </div>
          </div>
        )}

        <DialogFooter className="flex gap-2">
          {generatedMessage ? (
            <>
              <Button variant="outline" onClick={() => setGeneratedMessage('')} className="flex-1">Trocar Conta</Button>
              <Button onClick={handleCopyAndFinish} className="flex-1 bg-green-600 hover:bg-green-700">
                <Copy className="w-4 h-4 mr-2" />
                Copiar e Finalizar
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={resetAndClose} className="w-full">Cancelar</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
