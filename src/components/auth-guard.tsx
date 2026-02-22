'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Lock, LogIn, Loader2, AlertCircle } from 'lucide-react';
import { useAuth, useUser } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

const FIXED_PASSWORD = 'Ae@1234Br';
const MASTER_EMAIL = 'admin@streamstock.com';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Força a saída se o usuário logado não for a conta mestre (limpa lixo de sessões anônimas antigas)
  useEffect(() => {
    if (user && user.email !== MASTER_EMAIL && !isUserLoading) {
      signOut(auth);
    }
  }, [user, auth, isUserLoading]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password === FIXED_PASSWORD) {
      setIsAuthenticating(true);
      setError(false);
      
      try {
        // Tenta entrar com a conta mestre única
        await signInWithEmailAndPassword(auth, MASTER_EMAIL, FIXED_PASSWORD);
      } catch (err: any) {
        // Se a conta mestre ainda não existir no Firebase, cria ela pela primeira vez
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
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground animate-pulse font-medium">Sincronizando com a Nuvem...</p>
        </div>
      </div>
    );
  }

  // Só permite entrar se o e-mail logado for exatamente o MASTER_EMAIL
  if (user && user.email === MASTER_EMAIL) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-[400px] shadow-2xl border-t-4 border-t-primary">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold font-headline">Acesso Universal</CardTitle>
          <CardDescription className="text-xs uppercase tracking-widest font-bold text-primary/60">StreamStock Cloud</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Senha mestra de sincronização..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`h-12 text-center text-lg shadow-inner ${error ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                autoFocus
                autoComplete="current-password"
              />
              {error && (
                <div className="flex items-center justify-center gap-2 text-xs text-destructive font-medium bg-destructive/5 py-2 rounded border border-destructive/10">
                  <AlertCircle className="w-4 h-4" />
                  Senha incorreta. Tente novamente.
                </div>
              )}
            </div>
            <p className="text-[10px] text-center text-muted-foreground px-4 leading-tight">
              A senha correta vincula este dispositivo à sua conta global. Todos os dados serão sincronizados automaticamente.
            </p>
          </CardContent>
          <CardFooter className="pb-8">
            <Button type="submit" className="w-full h-12 text-lg font-semibold shadow-lg group">
              <LogIn className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
              Entrar e Sincronizar
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
