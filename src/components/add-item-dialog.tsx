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
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Novo Acesso Digital</DialogTitle>
          <DialogDescription>Insira os dados da conta para o estoque.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="service" className="text-right">Serviço</Label>
              <div className="col-span-3">
                <Select value={service} onValueChange={(val) => setService(val)}>
                  <SelectTrigger id="service">
                    <SelectValue placeholder="Selecione o serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="account" className="text-right">E-mail</Label>
              <Input 
                id="account" 
                className="col-span-3" 
                value={account} 
                onChange={(e) => setAccount(e.target.value)} 
                required 
                placeholder="email@exemplo.com"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="credentials" className="text-right">Senha</Label>
              <Input 
                id="credentials" 
                type="text"
                className="col-span-3" 
                value={credentials} 
                onChange={(e) => setCredentials(e.target.value)} 
                required 
                placeholder="Senha da conta"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Perfis</Label>
              <div className="col-span-3 flex gap-2">
                {[5, 6, 7].map((num) => (
                  <Button
                    key={num}
                    type="button"
                    variant={profiles === num ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setProfiles(profiles === num ? undefined : num)}
                  >
                    {num}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">Adicionar ao Estoque</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
