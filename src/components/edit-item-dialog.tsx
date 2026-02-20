'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ServiceType, InventoryItem } from '@/lib/types';

interface EditItemDialogProps {
  item: InventoryItem | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (item: InventoryItem) => void;
}

export function EditItemDialog({ item, onOpenChange, onSubmit }: EditItemDialogProps) {
  const [service, setService] = useState<ServiceType>('Netflix');
  const [account, setAccount] = useState('');
  const [credentials, setCredentials] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'available' | 'used'>('available');

  useEffect(() => {
    if (item) {
      setService(item.service);
      setAccount(item.account);
      setCredentials(item.credentials);
      setNotes(item.notes);
      setStatus(item.status);
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
        notes,
        status,
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
              <Select value={service} onValueChange={(val) => setService(val as ServiceType)}>
                <SelectTrigger id="edit-service">
                  <SelectValue placeholder="Selecione o serviço" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Netflix">Netflix</SelectItem>
                  <SelectItem value="Disney+">Disney+</SelectItem>
                  <SelectItem value="HBO Max">HBO Max</SelectItem>
                  <SelectItem value="Prime Video">Prime Video</SelectItem>
                  <SelectItem value="Spotify">Spotify</SelectItem>
                  <SelectItem value="Youtube">Youtube</SelectItem>
                  <SelectItem value="Crunchyroll">Crunchyroll</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-account" className="text-right">Conta/E-mail</Label>
            <Input 
              id="edit-account" 
              className="col-span-3" 
              value={account} 
              onChange={(e) => setAccount(e.target.value)} 
              required 
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-credentials" className="text-right">Credenciais</Label>
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
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="edit-notes" className="text-right pt-2">Observações</Label>
            <Textarea 
              id="edit-notes" 
              className="col-span-3" 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
            />
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