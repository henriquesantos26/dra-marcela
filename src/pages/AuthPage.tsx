import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Rocket, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().trim().email('Email inválido').max(255),
  password: z.string().min(6, 'Mínimo 6 caracteres').max(128),
});

const signupSchema = loginSchema.extend({
  fullName: z.string().trim().min(2, 'Nome muito curto').max(100),
});

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) navigate('/admin');
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      if (isLogin) {
        const parsed = loginSchema.parse({ email, password });
        const { error } = await signIn(parsed.email, parsed.password);
        if (error) {
          if (error.message.includes('Invalid login')) {
            setError('Email ou senha incorretos.');
          } else {
            setError(error.message);
          }
        }
      } else {
        const parsed = signupSchema.parse({ email, password, fullName });
        const { error } = await signUp(parsed.email, parsed.password, parsed.fullName);
        if (error) {
          if (error.message.includes('already registered')) {
            setError('Este email já está cadastrado.');
          } else {
            setError(error.message);
          }
        } else {
          setSuccess('Cadastro realizado! Verifique seu email para confirmar a conta.');
        }
      }
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else {
        setError('Ocorreu um erro. Tente novamente.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-rocket-dark flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-rocket-indigo/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,hsl(var(--rocket-dark))_70%)]" />

        {/* Grid lines */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--primary-foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary-foreground)) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <div className="p-2.5 bg-primary rounded-2xl shadow-lg shadow-primary/30">
            <Rocket className="w-8 h-8 fill-primary-foreground" />
          </div>
          <span className="text-3xl font-black text-primary-foreground tracking-tighter">7 Zion</span>
        </div>

        {/* Card */}
        <div className="bg-rocket-navy/60 backdrop-blur-2xl rounded-[32px] p-8 border border-foreground/10 shadow-2xl">
          {/* Tabs */}
          <div className="flex gap-2 mb-8 bg-rocket-dark/50 p-1.5 rounded-2xl">
            <button
              onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
              className={`flex-1 py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all ${
                isLogin
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'text-muted-foreground hover:text-primary-foreground'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
              className={`flex-1 py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all ${
                !isLogin
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'text-muted-foreground hover:text-primary-foreground'
              }`}
            >
              Cadastrar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {!isLogin && (
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Nome completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-rocket-dark/80 border border-foreground/10 text-primary-foreground placeholder-muted-foreground/50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                />
              </div>
            )}

            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-rocket-dark/80 border border-foreground/10 text-primary-foreground placeholder-muted-foreground/50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-4 rounded-2xl bg-rocket-dark/80 border border-foreground/10 text-primary-foreground placeholder-muted-foreground/50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl px-4 py-3 text-sm font-medium animate-fade-in">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-rocket-emerald/10 border border-rocket-emerald/20 text-rocket-emerald rounded-xl px-4 py-3 text-sm font-medium animate-fade-in">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Entrar' : 'Cadastrar'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-muted-foreground text-xs font-bold mt-8 uppercase tracking-widest">
          7 Zion · Performance. Branding. Tecnologia.
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
