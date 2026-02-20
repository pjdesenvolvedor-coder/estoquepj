import { AuthGuard } from '@/components/auth-guard';
import { InventoryManager } from '@/components/inventory-manager';
import { Toaster } from '@/components/ui/toaster';

export default function Home() {
  return (
    <AuthGuard>
      <main className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center sm:text-left">
          <h1 className="text-4xl font-bold text-primary font-headline tracking-tight">StreamStock</h1>
          <p className="text-muted-foreground mt-2">Gerencie seu estoque de acessos digitais com segurança.</p>
        </header>
        
        <InventoryManager />
        
        <Toaster />
      </main>
    </AuthGuard>
  );
}