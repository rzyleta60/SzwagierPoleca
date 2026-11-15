'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Wrench, Mail, Lock, User, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Rejestracja przez endpoint serwerowy (omija limit wysyłki e-maili Supabase SMTP)
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          username,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Wystąpił błąd podczas rejestracji.');
      }

      // Automatyczne natychmiastowe logowanie
      const { error: loginErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!loginErr) {
        window.location.href = '/konto';
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'Wystąpił błąd podczas rejestracji.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto py-16 text-center bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Konto zostało pomyślnie utworzone!</h2>
        <p className="text-sm text-slate-300 mb-6 leading-relaxed">
          Możesz się teraz zalogować za pomocą swojego adresu e-mail: <strong>{email}</strong>.
        </p>
        <Link
          href="/auth/login"
          className="inline-block px-6 py-3 rounded-xl bg-amber-500 text-slate-950 font-black text-sm hover:bg-amber-400 transition"
        >
          Przejdź do logowania
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-slate-950 font-black mx-auto shadow-lg shadow-amber-500/20">
            <Wrench className="w-6 h-6 text-slate-950" />
          </div>
          <h1 className="text-2xl font-black text-white">Dołącz do Ekipy Szwagra</h1>
          <p className="text-xs text-slate-400">
            Zarejestruj się za darmo i korzystaj z najlepszych okazji
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-bold leading-relaxed">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Pseudonim / Imię</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="np. Majster_Tomek"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
              />
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Adres e-mail</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="twoj@email.pl"
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
                minLength={6}
                placeholder="Minimum 6 znaków"
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
            className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span className="animate-pulse">Tworzenie konta...</span>
            ) : (
              <>
                <span>Zarejestruj się za darmo</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Bezpieczna autoryzacja w bazie Supabase</span>
        </div>

        {/* Footer */}
        <div className="text-center pt-2 border-t border-slate-800">
          <p className="text-xs text-slate-400">
            Masz już konto?{' '}
            <Link href="/auth/login" className="text-amber-400 font-bold hover:underline">
              Zaloguj się
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
