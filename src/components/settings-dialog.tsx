'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, Settings2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  services: string[];
  onUpdateServices: (services: string[]) => void;
}

export function SettingsDialog({ open, onOpenChange, services, onUpdateServices }: SettingsDialogProps) {
  const [newService, setNewService] = useState('');

  const addService = () => {
    if (newService && !services.includes(newService)) {
      onUpdateServices([...services, newService]);
      setNewService('');
    }
  };

  const removeService = (serviceToRemove: string) => {
    onUpdateServices(services.filter(s => s !== serviceToRemove));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="w-5 h-5" />
            Configurações de Serviços
          </DialogTitle>
          <DialogDescription>
            Adicione ou remova os serviços que aparecem no sistema.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex gap-2">
            <Input 
              placeholder="Novo serviço (ex: HBO Max)" 
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addService()}
            />
            <Button onClick={addService} size="icon" className="shrink-0">
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <ScrollArea className="h-[250px] pr-4">
            <div className="space-y-2">
              {services.map((service) => (
                <div key={service} className="flex items-center justify-between p-2 bg-muted rounded-md border">
                  <span className="text-sm font-medium">{service}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeService(service)}
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {services.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-10">Nenhum serviço configurado.</p>
              )}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} className="w-full">Concluído</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
