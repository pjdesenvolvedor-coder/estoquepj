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
    onUpdateServices(services.filter(s => s !== serviceToRemove));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[450px] p-0 gap-0 overflow-hidden flex flex-col max-h-[90vh]">
        <DialogHeader className="p-6 pb-2 shrink-0 border-b bg-white z-10">
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-primary" />
            Configurar Serviços
          </DialogTitle>
          <DialogDescription>
            Gerencie os nomes dos serviços disponíveis no sistema.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-4 flex-1 flex flex-col min-h-0 overflow-hidden bg-muted/5">
          <div className="flex gap-2 shrink-0">
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

          <ScrollArea className="flex-1 border rounded-lg bg-white shadow-inner">
            <div className="space-y-2 p-3">
              {services.map((service) => (
                <div key={service} className="flex items-center justify-between p-3 bg-white rounded-md border shadow-sm group hover:border-primary/30 transition-colors">
                  <span className="text-sm font-semibold">{service}</span>
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

        <DialogFooter className="p-6 pt-4 shrink-0 border-t bg-white">
          <Button onClick={() => onOpenChange(false)} className="w-full h-11 shadow-md">Concluído</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
