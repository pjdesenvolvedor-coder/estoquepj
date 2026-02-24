'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ServiceType, InventoryItem } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (item: Omit<InventoryItem, 'id' | 'createdAt'>) => void;
  services: string[];
}

export function AddItemDialog({ open, onOpenChange, onSubmit, services }: AddItemDialogProps) {
  const [service, setService] = useState<ServiceType>('');
  const [account, setAccount] = useState('');
  const [credentials, setCredentials] = useState('');
  const [profiles, setProfiles] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (services.length > 0 && !service) {
      setService(services[0]);
    }
  }, [services, service]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      service,
      account,
      credentials,
      status: 'available',
      notes: '',
      profiles,
    });
    setAccount('');
    setCredentials('');
    setProfiles(undefined);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[450px] p-0 gap-0 overflow-hidden flex flex-col max-h-[90vh]">
        <DialogHeader className="p-6 pb-2 shrink-0">
          <DialogTitle>Novo Acesso Digital</DialogTitle>
          <DialogDescription>Insira os dados da conta para o estoque.</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <ScrollArea className="flex-1 p-6 pt-2">
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="service">Serviço</Label>
                <Select value={service} onValueChange={(val) => setService(val)}>
                  <SelectTrigger id="service" className="h-11">
                    <SelectValue placeholder="Selecione o serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="account">E-mail ou CPF</Label>
                <Input 
                  id="account" 
                  className="h-11" 
                  value={account} 
                  onChange={(e) => setAccount(e.target.value)} 
                  required 
                  placeholder="Ex: email@exemplo.com ou CPF"
                  type="text"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="credentials">Senha</Label>
                <Input 
                  id="credentials" 
                  type="text"
                  className="h-11" 
                  value={credentials} 
                  onChange={(e) => setCredentials(e.target.value)} 
                  required 
                  placeholder="Senha da conta"
                />
              </div>

              <div className="space-y-2">
                <Label>Quantidade de Perfis</Label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                    <Button
                      key={num}
                      type="button"
                      variant={profiles === num ? 'default' : 'outline'}
                      className="h-11"
                      onClick={() => setProfiles(profiles === num ? undefined : num)}
                    >
                      {num}
                    </Button>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground italic">Se não selecionar, a conta será considerada inteira.</p>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="p-6 pt-2 shrink-0 flex flex-col sm:flex-row gap-2 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:flex-1 h-11">
              Cancelar
            </Button>
            <Button type="submit" className="w-full sm:flex-1 h-11">
              Adicionar ao Estoque
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
