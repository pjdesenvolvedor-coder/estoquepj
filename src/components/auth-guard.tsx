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
        // Tenta fazer login
        await signInWithEmailAndPassword(auth, email, password);
        toast({
          title: "Bem-vindo!",
          description: "Seu estoque privado foi carregado.",
        });
      } else {
        // Cria nova conta
        await createUserWithEmailAndPassword(auth, email, password);
        toast({
          title: "Conta criada com sucesso!",
          description: "Seu novo estoque privado está pronto para uso.",
        });
      }
    } catch (err: any) {
      console.error("Erro de autenticação:", err);
      if (err.code === 'auth/user-not-found') {
        setError('Conta não encontrada. Você já se cadastrou?');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('E-mail ou senha incorretos.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está em uso. Tente fazer login.');
      } else if (err.code === 'auth/weak-password') {
        setError('A senha deve ter pelo menos 6 caracteres.');
      } else if (err.code === 'auth/invalid-email') {
        setError('O formato do e-mail é inválido.');
      } else {
        setError('Falha na autenticação: ' + (err.message || 'Tente novamente.'));
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
            {isLogin ? 'PJ & GS Contas' : 'Criar Novo Estoque'}
          </CardTitle>
          <CardDescription className="text-xs uppercase tracking-widest font-bold text-primary/60">
            {isLogin ? 'Acessar seu Painel Privado' : 'Cadastre seu e-mail de acesso'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleAuth}>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Seu e-mail (ex: pj@contas.com)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12"
                required
              />
              <Input
                type="password"
                placeholder="Sua senha de acesso"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`h-12 ${error ? 'border-destructive' : ''}`}
                required
              />
              {error && (
                <div className="flex items-center justify-center gap-2 text-xs text-destructive font-medium bg-destructive/5 py-3 px-2 rounded border border-destructive/10 animate-in fade-in slide-in-from-top-1">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="text-center">{error}</span>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pb-8">
            <Button type="submit" className="w-full h-12 text-lg font-semibold shadow-lg group bg-primary hover:bg-primary/90 transition-all">
              {isLogin ? (
                <>
                  <LogIn className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                  Entrar no Sistema
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Criar minha Conta
                </>
              )}
            </Button>
            <div className="flex flex-col items-center gap-1">
              <Button 
                type="button" 
                variant="ghost" 
                className="text-sm font-medium text-primary hover:text-primary hover:bg-primary/5"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
              >
                {isLogin ? 'Não tem conta? Cadastre-se agora' : 'Já possui uma conta? Faça login'}
              </Button>
              {isLogin && (
                <p className="text-[10px] text-muted-foreground text-center max-w-[80%]">
                  Se for seu primeiro acesso com este e-mail, clique em "Cadastre-se agora".
                </p>
              )}
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
