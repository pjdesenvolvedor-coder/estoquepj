'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ServiceType, InventoryItem } from '@/lib/types';

interface EditItemDialogProps {
  item: InventoryItem | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (item: InventoryItem) => void;
  services: string[];
}

export function EditItemDialog({ item, onOpenChange, onSubmit, services }: EditItemDialogProps) {
  const [service, setService] = useState<ServiceType>('');
  const [account, setAccount] = useState('');
  const [credentials, setCredentials] = useState('');
  const [status, setStatus] = useState<'available' | 'used'>('available');
  const [profiles, setProfiles] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (item) {
      setService(item.service);
      setAccount(item.account);
      setCredentials(item.credentials);
      setStatus(item.status);
      setProfiles(item.profiles);
    }
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (item) {
      onSubmit({
        ...item,
        service,
        account,
        credentials,
        status,
        profiles,
      });
      onOpenChange(false);
    }
  };

  if (!item) return null;

  return (
    <Dialog open={!!item} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Acesso</DialogTitle>
          <DialogDescription>Modifique os dados desta conta digital.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-service" className="text-right">Serviço</Label>
            <div className="col-span-3">
              <Select value={service} onValueChange={(val) => setService(val)}>
                <SelectTrigger id="edit-service">
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
            <Label htmlFor="edit-account" className="text-right">E-mail</Label>
            <Input 
              id="edit-account" 
              className="col-span-3" 
              value={account} 
              onChange={(e) => setAccount(e.target.value)} 
              required 
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-credentials" className="text-right">Senha</Label>
            <Input 
              id="edit-credentials" 
              className="col-span-3" 
              value={credentials} 
              onChange={(e) => setCredentials(e.target.value)} 
              required 
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-status" className="text-right">Status</Label>
            <div className="col-span-3">
              <Select value={status} onValueChange={(val) => setStatus(val as 'available' | 'used')}>
                <SelectTrigger id="edit-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Disponível</SelectItem>
                  <SelectItem value="used">Vendido / Usado</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">Salvar Alterações</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
