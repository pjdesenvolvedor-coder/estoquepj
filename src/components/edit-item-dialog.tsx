'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InventoryItem } from '@/lib/types';

interface EditItemDialogProps {
  item: InventoryItem | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (item: InventoryItem) => void;
  services: string[];
}

export function EditItemDialog({ item, onOpenChange, onSubmit, services }: EditItemDialogProps) {
  const [service, setService] = useState('');
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
      <DialogContent className="w-[95vw] sm:max-w-[450px] p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Editar Acesso</DialogTitle>
          <DialogDescription>Modifique os dados desta conta digital.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-service">Serviço</Label>
              <Select value={service} onValueChange={(val) => setService(val)}>
                <SelectTrigger id="edit-service" className="h-11">
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
              <Label htmlFor="edit-account">E-mail ou CPF</Label>
              <Input 
                id="edit-account" 
                className="h-11" 
                value={account} 
                onChange={(e) => setAccount(e.target.value)} 
                required 
                type="text"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-credentials">Senha</Label>
              <Input 
                id="edit-credentials" 
                className="h-11" 
                value={credentials} 
                onChange={(e) => setCredentials(e.target.value)} 
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">Status no Estoque</Label>
              <Select value={status} onValueChange={(val) => setStatus(val as 'available' | 'used')}>
                <SelectTrigger id="edit-status" className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Disponível</SelectItem>
                  <SelectItem value="used">Vendido / Usado</SelectItem>
                </SelectContent>
              </Select>
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
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
