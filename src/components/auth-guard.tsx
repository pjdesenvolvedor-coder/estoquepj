
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Lock, LogIn, Loader2 } from 'lucide-react';
import { useAuth, useUser } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

const FIXED_PASSWORD = 'Ae@1234Br';
const MASTER_EMAIL = 'admin@streamstock.com'; // E-mail interno para sincronização universal

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password === FIXED_PASSWORD) {
      setIsAuthenticating(true);
      setError(false);
      
      try {
        // Tenta entrar com a conta mestre
        await signInWithEmailAndPassword(auth, MASTER_EMAIL, FIXED_PASSWORD);
      } catch (err: any) {
        // Se a conta não existir (primeiro acesso do sistema), cria ela
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
          try {
            await createUserWithEmailAndPassword(auth, MASTER_EMAIL, FIXED_PASSWORD);
          } catch (createErr) {
            console.error("Erro ao criar conta mestre:", createErr);
            setError(true);
          }
        } else {
          console.error("Erro de autenticação:", err);
          setError(true);
        }
      } finally {
        setIsAuthenticating(false);
      }
    } else {
      setError(true);
      setPassword('');
    }
  };

  if (isUserLoading || isAuthenticating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-[400px] shadow-2xl border-t-4 border-t-primary">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold font-headline">Acesso Restrito</CardTitle>
          <CardDescription className="text-xs">Sistema StreamStock - Nuvem</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Senha mestra..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`h-12 text-center text-lg ${error ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                autoFocus
              />
              {error && (
                <p className="text-xs text-destructive font-medium text-center bg-destructive/5 py-1 rounded">
                  Erro de acesso. Tente novamente.
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="pb-8">
            <Button type="submit" className="w-full h-12 text-lg font-semibold shadow-lg">
              <LogIn className="w-5 h-5 mr-2" />
              Entrar no Sistema
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
