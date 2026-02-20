'use client';

import { useState, useEffect, useMemo } from 'react';
import { InventoryItem, ServiceType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  XCircle, 
  Tv, 
  MonitorPlay, 
  Gamepad, 
  Music, 
  Youtube, 
  LayoutGrid,
  LogOut,
  Users,
  ExternalLink,
  Settings2,
  AlertTriangle
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
} from '@/components/ui/card';
import { AddItemDialog } from './add-item-dialog';
import { EditItemDialog } from './edit-item-dialog';
import { WithdrawAccessDialog } from './withdraw-access-dialog';
import { SettingsDialog } from './settings-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const DEFAULT_SERVICES = ['Netflix', 'Disney+', 'HBO Max', 'Prime Video', 'Spotify', 'Youtube', 'Crunchyroll'];

export function InventoryManager() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'used'>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  useEffect(() => {
    const savedItems = localStorage.getItem('streamstock_items');
    if (savedItems) setItems(JSON.parse(savedItems));

    const savedServices = localStorage.getItem('streamstock_services');
    if (savedServices) {
      setServices(JSON.parse(savedServices));
    } else {
      setServices(DEFAULT_SERVICES);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('streamstock_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('streamstock_services', JSON.stringify(services));
  }, [services]);

  const handleLogout = () => {
    localStorage.removeItem('streamstock_auth');
    window.location.reload();
  };

  const addItem = (item: Omit<InventoryItem, 'id' | 'createdAt'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: crypto.randomUUID(),
      profilesUsed: 0,
      createdAt: Date.now(),
    };
    setItems([newItem, ...items]);
  };

  const updateItem = (updatedItem: InventoryItem) => {
    setItems(items.map(item => item.id === updatedItem.id ? updatedItem : item));
    setEditingItem(null);
  };

  const deleteItem = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta conta?')) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const toggleStatus = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, status: item.status === 'available' ? 'used' : 'available' } : item
    ));
  };

  const handleWithdraw = (itemId: string) => {
    setItems(currentItems => currentItems.map(item => {
      if (item.id === itemId) {
        if (item.profiles) {
          const newUsed = (item.profilesUsed || 0) + 1;
          const isFinished = newUsed >= item.profiles;
          return {
            ...item,
            profilesUsed: newUsed,
            status: isFinished ? 'used' : 'available'
          } as InventoryItem;
        } else {
          return { ...item, status: 'used' } as InventoryItem;
        }
      }
      return item;
    }));
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.account.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const outOfStockServices = useMemo(() => {
    return services.filter(service => 
      !items.some(item => item.service === service && item.status === 'available')
    );
  }, [services, items]);

  const getServiceIcon = (service: ServiceType) => {
    const s = service.toLowerCase();
    if (s.includes('netflix')) return <MonitorPlay className="w-5 h-5" />;
    if (s.includes('disney')) return <Tv className="w-5 h-5" />;
    if (s.includes('hbo')) return <Tv className="w-5 h-5" />;
    if (s.includes('prime')) return <MonitorPlay className="w-5 h-5" />;
    if (s.includes('spotify')) return <Music className="w-5 h-5" />;
    if (s.includes('youtube')) return <Youtube className="w-5 h-5" />;
    if (s.includes('crunchyroll')) return <Gamepad className="w-5 h-5" />;
    return <LayoutGrid className="w-5 h-5" />;
  };

  return (
    <div className="space-y-6">
      {/* Search and Top Actions Bar */}
      <div className="flex flex-col gap-4 bg-white p-4 rounded-xl shadow-sm border">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar e-mail ou serviço..." 
            className="pl-10 h-11"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 w-full">
          <Button variant="outline" size="icon" onClick={handleLogout} title="Sair" className="h-11 w-full sm:w-11">
            <LogOut className="w-4 h-4 mr-2 sm:mr-0" />
            <span className="sm:hidden">Sair</span>
          </Button>
          <Button variant="outline" size="icon" onClick={() => setIsSettingsOpen(true)} title="Configurações" className="h-11 w-full sm:w-11">
            <Settings2 className="w-4 h-4 mr-2 sm:mr-0" />
            <span className="sm:hidden">Configurar</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setIsWithdrawOpen(true)} 
            className="col-span-2 sm:flex-1 border-primary text-primary hover:bg-primary/5 h-11"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Retirar Acesso
          </Button>
          <Button 
            onClick={() => setIsAddOpen(true)} 
            className="col-span-2 sm:flex-1 h-11"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Estoque
          </Button>
        </div>
      </div>

      {/* Stock Alerts Area */}
      {outOfStockServices.length > 0 && (
        <Alert variant="destructive" className="bg-destructive/5 border-destructive/20 text-destructive animate-in fade-in slide-in-from-top-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="font-bold">Atenção!</AlertTitle>
          <AlertDescription className="text-sm">
            Serviços <span className="font-bold underline">SEM ESTOQUE</span>:
            <div className="flex flex-wrap gap-1.5 mt-2">
              {outOfStockServices.map(s => (
                <Badge key={s} variant="destructive" className="font-normal px-2 py-0.5">
                  {s}
                </Badge>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Status Filters - Scrollable on mobile */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
        <Button 
          variant={filterStatus === 'all' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilterStatus('all')}
          className="whitespace-nowrap shrink-0"
        >
          Todos ({items.length})
        </Button>
        <Button 
          variant={filterStatus === 'available' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilterStatus('available')}
          className={`whitespace-nowrap shrink-0 ${filterStatus === 'available' ? 'bg-green-600 hover:bg-green-700 border-none' : ''}`}
        >
          Disponíveis ({items.filter(i => i.status === 'available').length})
        </Button>
        <Button 
          variant={filterStatus === 'used' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilterStatus('used')}
          className="whitespace-nowrap shrink-0"
        >
          Vendidos ({items.filter(i => i.status === 'used').length})
        </Button>
      </div>

      {/* Inventory Grid */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => (
          <Card key={item.id} className={`group hover:shadow-md transition-all border-l-4 ${item.status === 'available' ? 'border-l-green-500' : 'border-l-gray-400 opacity-80'}`}>
            <CardHeader className="p-4 pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary/10 rounded-lg text-primary">
                    {getServiceIcon(item.service)}
                  </div>
                  <div>
                    <CardTitle className="text-base font-headline">{item.service}</CardTitle>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-tight">ID: {item.id.slice(0, 8)}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <Badge variant={item.status === 'available' ? 'default' : 'secondary'} className={`text-[10px] px-2 py-0 ${item.status === 'available' ? 'bg-green-600' : ''}`}>
                    {item.status === 'available' ? 'Disponível' : 'Vendido'}
                  </Badge>
                  {item.profiles && (
                    <Badge variant="outline" className="flex gap-1 items-center border-secondary/30 text-secondary text-[10px] px-2 py-0">
                      <Users className="w-3 h-3" />
                      {item.profilesUsed || 0}/{item.profiles}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-4">
              <div className="bg-muted p-3 rounded-lg text-sm break-all font-mono space-y-3 border border-border/50">
                <div className="space-y-0.5">
                  <p className="text-[10px] text-muted-foreground uppercase font-sans font-bold">E-mail</p>
                  <p className="leading-tight">{item.account}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] text-muted-foreground uppercase font-sans font-bold">Senha</p>
                  <p className="leading-tight">{item.credentials}</p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-1">
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => toggleStatus(item.id)} 
                    className="h-9 w-9"
                    title={item.status === 'available' ? 'Marcar como Usado' : 'Marcar como Disponível'}
                  >
                    {item.status === 'available' ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-orange-400" />}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setEditingItem(item)} 
                    className="h-9 w-9"
                    title="Editar"
                  >
                    <Edit3 className="w-5 h-5" />
                  </Button>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => deleteItem(item.id)} 
                  className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10" 
                  title="Excluir"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed mx-auto max-w-lg px-4">
          <div className="mx-auto bg-muted w-14 h-14 rounded-full flex items-center justify-center mb-4 text-muted-foreground">
            <LayoutGrid className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-medium">Nenhum item encontrado</h3>
          <p className="text-sm text-muted-foreground mt-1">Refine sua busca ou adicione novos produtos ao estoque.</p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center mt-6">
            <Button onClick={() => setIsWithdrawOpen(true)} variant="outline" className="h-11">
              Retirar Acesso
            </Button>
            <Button onClick={() => setIsAddOpen(true)} className="h-11">
              Adicionar Item
            </Button>
          </div>
        </div>
      )}

      <AddItemDialog 
        open={isAddOpen} 
        onOpenChange={setIsAddOpen} 
        onSubmit={addItem}
        services={services}
      />

      <WithdrawAccessDialog
        open={isWithdrawOpen}
        onOpenChange={setIsWithdrawOpen}
        items={items}
        onWithdraw={handleWithdraw}
        services={services}
      />

      <EditItemDialog 
        item={editingItem} 
        onOpenChange={(open) => !open && setEditingItem(null)} 
        onSubmit={updateItem}
        services={services}
      />

      <SettingsDialog
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        services={services}
        onUpdateServices={setServices}
      />
    </div>
  );
}