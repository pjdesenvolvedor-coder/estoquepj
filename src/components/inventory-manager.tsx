'use client';

import { useState, useEffect } from 'react';
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
  ExternalLink
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { AddItemDialog } from './add-item-dialog';
import { EditItemDialog } from './edit-item-dialog';
import { WithdrawAccessDialog } from './withdraw-access-dialog';

export function InventoryManager() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'used'>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('streamstock_items');
    if (saved) setItems(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('streamstock_items', JSON.stringify(items));
  }, [items]);

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
    setItems(items.filter(item => item.id !== id));
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

  const getServiceIcon = (service: ServiceType) => {
    switch (service) {
      case 'Netflix': return <MonitorPlay className="w-5 h-5" />;
      case 'Disney+': return <Tv className="w-5 h-5" />;
      case 'HBO Max': return <Tv className="w-5 h-5" />;
      case 'Prime Video': return <MonitorPlay className="w-5 h-5" />;
      case 'Spotify': return <Music className="w-5 h-5" />;
      case 'Youtube': return <Youtube className="w-5 h-5" />;
      case 'Crunchyroll': return <Gamepad className="w-5 h-5" />;
      default: return <LayoutGrid className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-sm border">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por e-mail ou serviço..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="icon" onClick={handleLogout} title="Sair" className="shrink-0">
            <LogOut className="w-4 h-4" />
          </Button>
          <Button variant="outline" onClick={() => setIsWithdrawOpen(true)} className="flex-1 sm:flex-none border-primary text-primary hover:bg-primary/5">
            <ExternalLink className="w-4 h-4 mr-2" />
            Retirar Acesso
          </Button>
          <Button onClick={() => setIsAddOpen(true)} className="flex-1 sm:flex-none">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Estoque
          </Button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button 
          variant={filterStatus === 'all' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilterStatus('all')}
        >
          Todos ({items.length})
        </Button>
        <Button 
          variant={filterStatus === 'available' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilterStatus('available')}
          className={filterStatus === 'available' ? 'bg-green-600 hover:bg-green-700 border-none' : ''}
        >
          Disponíveis ({items.filter(i => i.status === 'available').length})
        </Button>
        <Button 
          variant={filterStatus === 'used' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilterStatus('used')}
        >
          Vendidos/Usados ({items.filter(i => i.status === 'used').length})
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => (
          <Card key={item.id} className={`group hover:shadow-md transition-all border-l-4 ${item.status === 'available' ? 'border-l-green-500' : 'border-l-gray-400 opacity-75'}`}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    {getServiceIcon(item.service)}
                  </div>
                  <div>
                    <CardTitle className="text-lg font-headline">{item.service}</CardTitle>
                    <CardDescription className="font-mono text-xs">{item.account}</CardDescription>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant={item.status === 'available' ? 'default' : 'secondary'} className={item.status === 'available' ? 'bg-green-600' : ''}>
                    {item.status === 'available' ? 'Disponível' : 'Vendido'}
                  </Badge>
                  {item.profiles && (
                    <Badge variant="outline" className="flex flex-col gap-0.5 items-end border-secondary text-secondary">
                      <div className="flex gap-1 items-center">
                        <Users className="w-3 h-3" />
                        {item.profiles} perfis
                      </div>
                      <div className="text-[10px] opacity-70">
                        {item.profilesUsed || 0} vendidos
                      </div>
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-3 rounded-md text-sm break-all font-mono">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Senha</p>
                {item.credentials}
              </div>

              <div className="flex justify-between pt-2">
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => toggleStatus(item.id)} title={item.status === 'available' ? 'Marcar como Usado' : 'Marcar como Disponível'}>
                    {item.status === 'available' ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-orange-400" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setEditingItem(item)} title="Editar">
                    <Edit3 className="w-4 h-4" />
                  </Button>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteItem(item.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10" title="Excluir">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed">
          <div className="mx-auto bg-muted w-16 h-16 rounded-full flex items-center justify-center mb-4 text-muted-foreground">
            <LayoutGrid className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-medium">Nenhum item encontrado</h3>
          <p className="text-muted-foreground">Tente mudar o filtro ou adicionar um novo produto.</p>
          <div className="flex gap-2 justify-center mt-4">
            <Button onClick={() => setIsWithdrawOpen(true)} variant="outline">
              Retirar Acesso
            </Button>
            <Button onClick={() => setIsAddOpen(true)} variant="outline">
              Adicionar Primeiro Item
            </Button>
          </div>
        </div>
      )}

      <AddItemDialog 
        open={isAddOpen} 
        onOpenChange={setIsAddOpen} 
        onSubmit={addItem} 
      />

      <WithdrawAccessDialog
        open={isWithdrawOpen}
        onOpenChange={setIsWithdrawOpen}
        items={items}
        onWithdraw={handleWithdraw}
      />

      <EditItemDialog 
        item={editingItem} 
        onOpenChange={(open) => !open && setEditingItem(null)} 
        onSubmit={updateItem} 
      />
    </div>
  );
}
