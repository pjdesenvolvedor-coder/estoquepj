'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    if (window.confirm(`Deseja realmente remover o serviço "${serviceToRemove}"?`)) {
      onUpdateServices(services.filter(s => s !== serviceToRemove));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[400px] p-4 sm:p-6 max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-primary" />
            Configurar Serviços
          </DialogTitle>
          <DialogDescription>
            Gerencie os nomes dos serviços disponíveis no sistema.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 py-4 overflow-hidden flex flex-col">
          <div className="flex gap-2">
            <Input 
              placeholder="Novo serviço..." 
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addService()}
              className="h-11"
            />
            <Button onClick={addService} size="icon" className="shrink-0 h-11 w-11">
              <Plus className="w-5 h-5" />
            </Button>
          </div>

          <ScrollArea className="flex-1 border rounded-lg p-1 bg-muted/30">
            <div className="space-y-1 p-1">
              {services.map((service) => (
                <div key={service} className="flex items-center justify-between p-2 pl-3 bg-white rounded-md border shadow-sm">
                  <span className="text-sm font-medium">{service}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeService(service)}
                    className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {services.length === 0 && (
                <div className="text-center text-xs text-muted-foreground py-10">
                  Nenhum serviço configurado.
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="mt-4">
          <Button onClick={() => onOpenChange(false)} className="w-full h-11">Concluído</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}