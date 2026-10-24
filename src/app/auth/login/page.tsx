'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Wrench, Mail, Lock, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Nieprawidłowy e-mail lub hasło.');
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      setError('Wpisz najpierw adres e-mail, aby otrzymać link logujący.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      setMessage('Wysłaliśmy link logujący na Twój adres e-mail!');
    } catch (err: any) {
      setError(err.message || 'Nie udało się wysłać linku.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-slate-950 font-black mx-auto shadow-lg shadow-amber-500/20">
            <Wrench className="w-6 h-6 text-slate-950" />
          </div>
          <h1 className="text-2xl font-black text-white">Witaj w szwagierpoleca.pl</h1>
          <p className="text-xs text-slate-400">
            Zaloguj się, aby głosować na okazje i komentować sprzęt
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        {message && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            {message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Adres e-mail</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="twoj.email@poczta.pl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Hasło</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition"
          >
            <span>{loading ? 'Logowanie...' : 'Zaloguj się'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Magic Link */}
        <div className="pt-2 text-center">
          <button
            onClick={handleMagicLink}
            disabled={loading}
            className="text-xs text-slate-400 hover:text-amber-400 underline font-medium"
          >
            Zaloguj jednorazowym linkiem na e-mail (Magic Link)
          </button>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
          Nie masz jeszcze konta?{' '}
          <Link href="/auth/register" className="text-amber-400 font-bold hover:underline">
            Zarejestruj się za darmo
          </Link>
        </div>
      </div>
    </div>
  );
}
