'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Wrench, 
  Flame, 
  Crown, 
  PlusCircle, 
  Search, 
  Menu, 
  X, 
  User, 
  Tag,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, profile, isVip, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const navLinks = [
    { href: '/', label: 'Główna', icon: Flame },
    { href: '/okazje', label: 'Wszystkie Okazje', icon: Tag },
    { href: '/dodaj-okazje', label: 'Podrzuć Okazję', icon: PlusCircle },
    { href: '/vip', label: 'Klub VIP', icon: Crown, highlight: true },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-slate-800">
      {/* Top announcement banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-slate-950 text-xs sm:text-sm font-black py-2 px-4 text-center tracking-wide shadow-sm">
        🔥 NOWY BŁĄD CENOWY WARSZTATOWY W SERWISIE! SPRAWDŹ ZANIM SKASUJĄ!
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-11 h-11 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/30 group-hover:scale-105 transition-transform">
              <Wrench className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black tracking-tight text-white">
                  szwagier<span className="text-amber-400">poleca</span>.pl
                </span>
              </div>
              <span className="text-xs text-slate-300 tracking-wider uppercase font-bold block">
                Prawdziwy sprzęt • Zero ściemy
              </span>
            </div>
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <form action="/okazje" method="GET" className="relative w-full">
              <input
                type="text"
                name="q"
                placeholder="Szukaj wkrętarki, kluczy, myjki, okazji..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 text-slate-100 text-sm font-medium rounded-xl pl-10 pr-4 py-2.5 border border-slate-700 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 placeholder:text-slate-400"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </form>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-extrabold transition-all',
                    link.highlight
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/40 hover:bg-amber-500/20'
                      : isActive
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-200 hover:text-white hover:bg-slate-900'
                  )}
                >
                  <Icon className={cn('w-4 h-4', link.highlight ? 'text-amber-400' : 'text-slate-400')} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right actions: Auth button */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/konto"
                  title="Moje konto i zamówienia"
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-400 text-sm font-bold text-slate-100 transition-all group"
                >
                  <User className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span>{profile?.username || user.user_metadata?.username || user.email?.split('@')[0]}</span>
                  {isVip && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black">
                      VIP 👑
                    </span>
                  )}
                </Link>
                <button
                  onClick={handleSignOut}
                  title="Wyloguj się"
                  className="p-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center gap-2 text-sm font-bold text-slate-200 hover:text-white px-3.5 py-2.5 rounded-xl hover:bg-slate-900 transition-colors"
              >
                <User className="w-4 h-4" />
                <span>Zaloguj</span>
              </Link>
            )}
            <Link
              href="/vip"
              className="flex items-center gap-2 text-sm font-black bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/25 transition-all hover:scale-105"
            >
              <Crown className="w-4 h-4" />
              <span>Dołącz do VIP</span>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="md:hidden pb-4">
          <form action="/okazje" method="GET" className="relative w-full">
            <input
              type="text"
              name="q"
              placeholder="Szukaj wkrętarki, narzędzi, okazji..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 text-slate-100 text-sm rounded-xl pl-10 pr-4 py-2.5 border border-slate-700 focus:border-amber-400 focus:outline-none placeholder:text-slate-400"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          </form>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950 border-b border-slate-800 px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold text-slate-100 hover:bg-slate-900"
              >
                <Icon className="w-5 h-5 text-amber-400" />
                <span>{link.label}</span>
              </Link>
            );
          })}
          <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
            {user ? (
              <div className="flex flex-col gap-2">
                <Link
                  href="/konto"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400 transition"
                >
                  <div className="flex items-center gap-2.5 text-sm font-bold text-slate-100">
                    <User className="w-4 h-4 text-amber-400" />
                    <span>Moje konto ({profile?.username || user.user_metadata?.username || user.email?.split('@')[0]})</span>
                    {isVip && <span className="text-[10px] px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-black">VIP 👑</span>}
                  </div>
                  <span className="text-xs text-amber-400 font-extrabold">Otwórz &rarr;</span>
                </Link>
                <div className="flex justify-end">
                  <button
                    onClick={handleSignOut}
                    className="text-xs font-bold text-rose-400 hover:text-rose-300 py-1 px-2"
                  >
                    Wyloguj się
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 rounded-xl bg-slate-900 text-slate-100 text-base font-bold border border-slate-700"
              >
                Zaloguj się
              </Link>
            )}
            <Link
              href="/vip"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3.5 rounded-xl bg-amber-500 text-slate-950 text-base font-black shadow-lg"
            >
              Dołącz do Klubu Szwagra VIP
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
