
'use client';

import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InventoryItem, ServiceType } from '@/lib/types';
import { Check, Copy, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

interface WithdrawAccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: InventoryItem[];
  onWithdraw: (id: string) => void;
}

export function WithdrawAccessDialog({ open, onOpenChange, items, onWithdraw }: WithdrawAccessDialogProps) {
  const { toast } = useToast();
  const [selectedService, setSelectedService] = useState<ServiceType | ''>('');
  const [isSupport, setIsSupport] = useState<'no' | 'yes'>('no');
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const availableItems = useMemo(() => {
    return items.filter(item => item.status === 'available');
  }, [items]);

  const uniqueServices = useMemo(() => {
    const services = availableItems.map(item => item.service);
    return Array.from(new Set(services));
  }, [availableItems]);

  const itemsForService = useMemo(() => {
    if (!selectedService) return [];
    return availableItems.filter(item => item.service === selectedService);
  }, [selectedService, availableItems]);

  const handleGenerate = () => {
    const item = itemsForService.find(i => i.id === selectedItemId) || itemsForService[0];
    if (!item) return;

    const serviceDisplay = isSupport === 'yes' ? `${item.service} - SUPORTE` : item.service;
    
    const message = `🔴*${serviceDisplay}*🔴

> *EMAIL:* ${item.account}
> *SENHA:* ${item.credentials}

🚨 *Proibido altera senha da conta ou dos perfis* 🚨`;

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
      description: "Mensagem copiada e item removido do estoque.",
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
          <DialogTitle>Retirar Acesso do Estoque</DialogTitle>
          <DialogDescription>Selecione o serviço para gerar a mensagem de entrega.</DialogDescription>
        </DialogHeader>

        {!generatedMessage ? (
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Serviço Disponível</Label>
              <Select value={selectedService} onValueChange={(val) => {
                setSelectedService(val as ServiceType);
                setSelectedItemId(null);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha o serviço..." />
                </SelectTrigger>
                <SelectContent>
                  {uniqueServices.length > 0 ? (
                    uniqueServices.map(service => (
                      <SelectItem key={service} value={service}>{service}</SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground text-center">Nenhum item disponível</div>
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedService && (
              <div className="space-y-2">
                <Label>Tipo de Entrega (Suporte?)</Label>
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
            )}

            {itemsForService.length > 1 && (
              <div className="space-y-2">
                <Label>Selecionar Conta Específica</Label>
                <Select value={selectedItemId || ''} onValueChange={setSelectedItemId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha a conta..." />
                  </SelectTrigger>
                  <SelectContent>
                    {itemsForService.map(item => (
                      <SelectItem key={item.id} value={item.id}>{item.account}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button 
              className="w-full h-11" 
              disabled={!selectedService} 
              onClick={handleGenerate}
            >
              Gerar Mensagem de Entrega
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Mensagem Formatada:</Label>
              <Textarea 
                readOnly 
                value={generatedMessage} 
                className="h-48 font-mono text-sm resize-none bg-muted"
              />
            </div>
            <div className="flex items-start gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg text-xs text-primary">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p>Ao clicar em copiar, o item será marcado como "Vendido" automaticamente.</p>
            </div>
          </div>
        )}

        <DialogFooter className="flex gap-2">
          {generatedMessage ? (
            <>
              <Button variant="outline" onClick={() => setGeneratedMessage('')} className="flex-1">Voltar</Button>
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
