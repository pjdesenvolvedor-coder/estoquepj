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
  Loader2,
  Eraser
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
} from '@/components/ui/card';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AddItemDialog } from './add-item-dialog';
import { EditItemDialog } from './edit-item-dialog';
import { WithdrawAccessDialog } from './withdraw-access-dialog';
import { SettingsDialog } from './settings-dialog';
import { HistoryDialog } from './history-dialog';
import { StatsDialog } from './stats-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useFirestore, useUser, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, doc, query, orderBy } from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';

const DEFAULT_SERVICES = ['Netflix', 'Disney+', 'HBO Max', 'Prime Video', 'Spotify', 'Youtube', 'Crunchyroll'];

export function InventoryManager() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const inventoryQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'inventory'), orderBy('createdAt', 'desc'));
  }, [db, user?.uid]);

  const historyQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'users', user.uid, 'history'), orderBy('timestamp', 'desc'));
  }, [db, user?.uid]);

  const settingsRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid, 'settings', 'services');
  }, [db, user?.uid]);

  const { data: rawItems, isLoading: itemsLoading } = useCollection<InventoryItem>(inventoryQuery);
  const { data: rawHistory, isLoading: historyLoading } = useCollection<HistoryEntry>(historyQuery);
  const { data: settingsDoc } = useDoc<any>(settingsRef);

  const items = useMemo(() => rawItems || [], [rawItems]);
  const history = useMemo(() => rawHistory || [], [rawHistory]);
  const services = useMemo(() => settingsDoc?.names || DEFAULT_SERVICES, [settingsDoc]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'used'>('all');
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showClearHistoryConfirm, setShowClearHistoryConfirm] = useState(false);

  const handleLogout = () => {
    window.location.reload();
  };

  const addItem = (item: Omit<InventoryItem, 'id' | 'createdAt'>) => {
    if (!user || !db) return;
    const colRef = collection(db, 'users', user.uid, 'inventory');
    
    const data: any = {
      ...item,
      profilesUsed: 0,
      createdAt: Date.now(),
    };
    
    Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);

    addDocumentNonBlocking(colRef, data);
    toast({ title: "Sucesso", description: "Item adicionado ao estoque." });
  };

  const updateItem = (updatedItem: InventoryItem) => {
    if (!user || !db) return;
    const docRef = doc(db, 'users', user.uid, 'inventory', updatedItem.id);
    const { id, ...data } = updatedItem as any;
    
    Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);

    updateDocumentNonBlocking(docRef, data);
    setEditingItem(null);
    toast({ title: "Atualizado", description: "Item atualizado com sucesso." });
  };

  const confirmDeleteItem = () => {
    if (!user || !db || !itemToDelete) return;
    const docRef = doc(db, 'users', user.uid, 'inventory', itemToDelete);
    deleteDocumentNonBlocking(docRef);
    setItemToDelete(null);
    toast({ variant: "destructive", title: "Excluído", description: "O item foi removido do estoque." });
  };

  const confirmClearInventory = () => {
    if (!user || !db || items.length === 0) return;
    items.forEach(item => {
      const docRef = doc(db, 'users', user.uid, 'inventory', item.id);
      deleteDocumentNonBlocking(docRef);
    });
    setShowClearConfirm(false);
    toast({ variant: "destructive", title: "Estoque Limpo", description: "Todas as contas foram removidas." });
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
    const item = items.find(i => i.id === itemId);
    if (!item) return;

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

    const histRef = collection(db, 'users', user.uid, 'history');
    const { id: _, ...histData } = historyEntry;
    addDocumentNonBlocking(histRef, histData);
  };

  const updateServices = (newServices: string[]) => {
    if (!user || !db) return;
    const docRef = doc(db, 'users', user.uid, 'settings', 'services');
    setDocumentNonBlocking(docRef, { names: newServices }, { merge: true });
  };

  const confirmClearHistory = () => {
    if (!user || !db) return;
    
    history.forEach(entry => {
      const docRef = doc(db, 'users', user.uid, 'history', entry.id);
      deleteDocumentNonBlocking(docRef);
    });
    
    setShowClearHistoryConfirm(false);
    
    setTimeout(() => {
      setIsHistoryOpen(false);
      toast({ title: "Histórico Limpo", description: "Todo o histórico foi apagado." });
    }, 100);
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = (item.account?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                          (item.service?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const outOfStockServices = services.filter(service => 
    !items.some(item => item.service === service && item.status === 'available')
  );

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

  if (itemsLoading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Carregando estoque da nuvem...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden pb-10">
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
            <LogOut className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setIsSettingsOpen(true)} title="Configurações" className="h-11 w-full sm:w-11">
            <Settings2 className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setIsStatsOpen(true)}
            className="h-11 w-full sm:w-auto border-secondary text-secondary hover:bg-secondary/5"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Quantidade
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowClearHistoryConfirm(true)}
            className="h-11 w-full sm:w-auto border-orange-500 text-orange-600 hover:bg-orange-50"
            title="Limpar Histórico"
          >
            <Eraser className="w-4 h-4 mr-2" />
            Limpar Histórico
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowClearConfirm(true)}
            className="h-11 w-full sm:w-auto border-destructive text-destructive hover:bg-destructive/5"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Limpar Tudo
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

      {outOfStockServices.length > 0 && searchTerm === '' && (
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
                  <p className="text-[10px] text-muted-foreground uppercase font-sans font-bold">E-mail ou CPF / Senha</p>
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
                  onClick={() => setItemToDelete(item.id)} 
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

      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente a conta do seu estoque.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteItem} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Limpar TODO o estoque?</AlertDialogTitle>
            <AlertDialogDescription>
              ATENÇÃO: Todas as contas cadastradas serão apagadas permanentemente. Esta ação é irreversível.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Manter estoque</AlertDialogCancel>
            <AlertDialogAction onClick={confirmClearInventory} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Sim, apagar tudo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showClearHistoryConfirm} onOpenChange={setShowClearHistoryConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apagar Histórico?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso removerá permanentemente todos os registros de vendas do seu histórico na nuvem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmClearHistory} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Sim, apagar tudo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
