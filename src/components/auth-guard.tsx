'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Lock, LogIn, Loader2, AlertCircle, UserPlus, ShieldCheck } from 'lucide-react';
import { useAuth, useUser } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { toast } = useToast();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setError('');
    
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        toast({
          title: "Conta criada!",
          description: "Seu estoque privado está pronto.",
        });
      }
    } catch (err: any) {
      console.error("Erro de autenticação:", err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('E-mail ou senha incorretos.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está em uso.');
      } else if (err.code === 'auth/weak-password') {
        setError('A senha deve ter pelo menos 6 caracteres.');
      } else {
        setError('Erro ao autenticar. Tente novamente.');
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  if (isUserLoading || isAuthenticating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground animate-pulse font-medium">Conectando ao seu Estoque...</p>
        </div>
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
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold font-headline">
            {isLogin ? 'Acessar Painel' : 'Criar Nova Conta'}
          </CardTitle>
          <CardDescription className="text-xs uppercase tracking-widest font-bold text-primary/60">
            Sistema de Estoque Privado
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleAuth}>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Seu e-mail..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12"
                required
              />
              <Input
                type="password"
                placeholder="Sua senha..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`h-12 ${error ? 'border-destructive' : ''}`}
                required
              />
              {error && (
                <div className="flex items-center justify-center gap-2 text-xs text-destructive font-medium bg-destructive/5 py-2 rounded border border-destructive/10">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pb-8">
            <Button type="submit" className="w-full h-12 text-lg font-semibold shadow-lg group">
              {isLogin ? (
                <>
                  <LogIn className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                  Entrar no Sistema
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5 mr-2" />
                  Começar Agora
                </>
              )}
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              className="text-xs text-muted-foreground"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
            >
              {isLogin ? 'Não tem conta? Cadastre-se agora' : 'Já possui uma conta? Faça login'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
