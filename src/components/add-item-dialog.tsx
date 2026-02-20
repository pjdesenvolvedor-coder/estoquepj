'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ServiceType, InventoryItem } from '@/lib/types';

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
      <DialogContent className="w-[95vw] sm:max-w-[450px] p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Novo Acesso Digital</DialogTitle>
          <DialogDescription>Insira os dados da conta para o estoque.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <div className="space-y-4">
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
              <Label htmlFor="account">E-mail</Label>
              <Input 
                id="account" 
                className="h-11" 
                value={account} 
                onChange={(e) => setAccount(e.target.value)} 
                required 
                placeholder="email@exemplo.com"
                type="email"
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
              <div className="grid grid-cols-3 gap-2">
                {[5, 6, 7].map((num) => (
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
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-6">
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