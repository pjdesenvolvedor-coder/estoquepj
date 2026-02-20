
'use client';

import { useState, useMemo } from 'react';
import { InventoryItem, ServiceType, HistoryEntry } from '@/lib/types';
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
  Settings2,
  AlertTriangle,
  History,
  BarChart3,
  Loader2
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
import { HistoryDialog } from './history-dialog';
import { StatsDialog } from './stats-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useFirestore, useUser, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, doc, query, orderBy, deleteDoc, updateDoc } from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

const DEFAULT_SERVICES = ['Netflix', 'Disney+', 'HBO Max', 'Prime Video', 'Spotify', 'Youtube', 'Crunchyroll'];

export function InventoryManager() {
  const { user } = useUser();
  const db = useFirestore();
  
  // Queries do Firestore
  const inventoryQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'inventory'), orderBy('createdAt', 'desc'));
  }, [db, user]);

  const historyQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'history'), orderBy('timestamp', 'desc'));
  }, [db, user]);

  const settingsRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid, 'settings', 'services');
  }, [db, user]);

  const { data: items = [], isLoading: itemsLoading } = useCollection<InventoryItem>(inventoryQuery);
  const { data: history = [], isLoading: historyLoading } = useCollection<HistoryEntry>(historyQuery);
  const { data: settingsDoc } = useDoc<any>(settingsRef);

  const services = settingsDoc?.names || DEFAULT_SERVICES;

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'used'>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const handleLogout = () => {
    window.location.reload();
  };

  const addItem = (item: Omit<InventoryItem, 'id' | 'createdAt'>) => {
    if (!user || !db) return;
    const colRef = collection(db, 'users', user.uid, 'inventory');
    addDocumentNonBlocking(colRef, {
      ...item,
      profilesUsed: 0,
      createdAt: Date.now(),
    });
  };

  const updateItem = (updatedItem: InventoryItem) => {
    if (!user || !db) return;
    const docRef = doc(db, 'users', user.uid, 'inventory', updatedItem.id);
    const { id, ...data } = updatedItem;
    updateDocumentNonBlocking(docRef, data);
    setEditingItem(null);
  };

  const deleteItem = (id: string) => {
    if (!user || !db) return;
    if (window.confirm('Tem certeza que deseja excluir esta conta?')) {
      const docRef = doc(db, 'users', user.uid, 'inventory', id);
      deleteDocumentNonBlocking(docRef);
    }
  };

  const toggleStatus = (id: string, currentStatus: string) => {
    if (!user || !db) return;
    const docRef = doc(db, 'users', user.uid, 'inventory', id);
    updateDocumentNonBlocking(docRef, {
      status: currentStatus === 'available' ? 'used' : 'available'
    });
  };

  const handleWithdraw = (itemId: string, historyEntry: HistoryEntry) => {
    if (!user || !db) return;
    const item = (items || []).find(i => i.id === itemId);
    if (!item) return;

    // Atualiza item
    const itemRef = doc(db, 'users', user.uid, 'inventory', itemId);
    if (item.profiles) {
      const newUsed = (item.profilesUsed || 0) + 1;
      const isFinished = newUsed >= item.profiles;
      updateDocumentNonBlocking(itemRef, {
        profilesUsed: newUsed,
        status: isFinished ? 'used' : 'available'
      });
    } else {
      updateDocumentNonBlocking(itemRef, { status: 'used' });
    }

    // Adiciona ao histórico
    const histRef = collection(db, 'users', user.uid, 'history');
    const { id: _, ...histData } = historyEntry;
    addDocumentNonBlocking(histRef, histData);
  };

  const updateServices = (newServices: string[]) => {
    if (!user || !db) return;
    const docRef = doc(db, 'users', user.uid, 'settings', 'services');
    setDocumentNonBlocking(docRef, { names: newServices }, { merge: true });
  };

  const clearHistory = () => {
    if (!user || !db) return;
    // No Firestore, deletar tudo requer deletar cada doc (simplificado aqui)
    history?.forEach(entry => {
      const docRef = doc(db, 'users', user.uid, 'history', entry.id);
      deleteDocumentNonBlocking(docRef);
    });
  };

  const filteredItems = (items || []).filter(item => {
    const matchesSearch = item.account.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const outOfStockServices = useMemo(() => {
    return services.filter(service => 
      !(items || []).some(item => item.service === service && item.status === 'available')
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

  if (itemsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Carregando estoque da nuvem...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Search and Top Actions Bar */}
      <div className="flex flex-col gap-4 bg-white p-4 rounded-xl shadow-sm border">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar e-mail ou serviço..." 
            className="pl-10 h-11 w-full"
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
            onClick={() => setIsStatsOpen(true)}
            className="h-11 w-full sm:w-auto border-secondary text-secondary hover:bg-secondary/5"
            title="Quantidade em Estoque"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Quantidade
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setIsWithdrawOpen(true)} 
            className="col-span-2 sm:flex-1 border-primary text-primary hover:bg-primary/5 h-11"
          >
            <Plus className="w-4 h-4 mr-2" />
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
        <Alert variant="destructive" className="bg-destructive/5 border-destructive/20 text-destructive">
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

      {/* Status Filters and History Button */}
      <div className="flex items-center justify-between gap-4 w-full">
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar w-full">
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
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsHistoryOpen(true)}
          className="shrink-0 h-9 border-primary/20 text-primary hover:bg-primary/5"
        >
          <History className="w-4 h-4 mr-2" />
          Histórico
        </Button>
      </div>

      {/* Inventory Grid */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full">
        {filteredItems.map((item) => (
          <Card key={item.id} className={`group hover:shadow-md transition-all border-l-4 ${item.status === 'available' ? 'border-l-green-500' : 'border-l-gray-400 opacity-80'}`}>
            <CardHeader className="p-4 pb-2">
              <div className="flex justify-between items-start gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary/10 rounded-lg text-primary shrink-0">
                    {getServiceIcon(item.service)}
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-base font-headline truncate">{item.service}</CardTitle>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-tight">ID: {item.id.slice(0, 8)}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <Badge variant={item.status === 'available' ? 'default' : 'secondary'} className={`text-[10px] px-2 py-0 ${item.status === 'available' ? 'bg-green-600' : ''}`}>
                    {item.status === 'available' ? 'Disponível' : 'Vendido'}
                  </Badge>
                  {item.profiles && (
                    <Badge variant="outline" className="flex gap-1 items-center border-secondary/30 text-secondary text-[10px] px-2 py-0">
                      <History className="w-3 h-3" />
                      {item.profilesUsed || 0}/{item.profiles}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-4">
              <div className="bg-muted p-3 rounded-lg text-sm break-all font-mono space-y-3 border border-border/50 overflow-hidden">
                <div className="space-y-0.5">
                  <p className="text-[10px] text-muted-foreground uppercase font-sans font-bold">E-mail / Senha</p>
                  <p className="leading-tight break-all font-bold">{item.account}</p>
                  <p className="leading-tight break-all">{item.credentials}</p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-1">
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => toggleStatus(item.id, item.status)} 
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
        onUpdateServices={updateServices}
      />

      <HistoryDialog
        open={isHistoryOpen}
        onOpenChange={setIsHistoryOpen}
        history={history}
        onClearHistory={clearHistory}
      />

      <StatsDialog
        open={isStatsOpen}
        onOpenChange={setIsStatsOpen}
        items={items}
        services={services}
      />
    </div>
  );
}
