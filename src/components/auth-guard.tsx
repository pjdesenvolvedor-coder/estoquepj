'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Lock, LogIn } from 'lucide-react';

const FIXED_PASSWORD = 'Ae@1234br';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedAuth = localStorage.getItem('streamstock_auth');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === FIXED_PASSWORD) {
      setIsAuthenticated(true);
      setError(false);
      localStorage.setItem('streamstock_auth', 'true');
    } else {
      setError(true);
    }
  };

  if (!isMounted) return null;

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold font-headline">Acesso Restrito</CardTitle>
            <CardDescription>Insira a senha mestra para acessar o sistema.</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Sua senha..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={error ? 'border-destructive focus-visible:ring-destructive' : ''}
                  autoFocus
                />
                {error && <p className="text-sm text-destructive font-medium">Senha incorreta. Tente novamente.</p>}
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full h-11 text-lg">
                <LogIn className="w-5 h-5 mr-2" />
                Entrar no Sistema
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}