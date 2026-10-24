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
  ShieldCheck 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navLinks = [
    { href: '/', label: 'Główna', icon: Flame },
    { href: '/okazje', label: 'Wszystkie Okazje', icon: Tag },
    { href: '/dodaj-okazje', label: 'Podrzuć Okazję', icon: PlusCircle },
    { href: '/vip', label: 'Klub VIP', icon: Crown, highlight: true },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      {/* Top micro banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-500 to-amber-500 text-slate-950 text-xs font-black py-1 px-4 text-center tracking-wide">
        🔥 NAJNOWSZY BŁĄD CENOWY WARSZTATOWY JUŻ W SERWISIE! SPRAWDŹ ZANIM SKASUJĄ!
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/30 group-hover:scale-105 transition-transform">
              <Wrench className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-white">
                  szwagier<span className="text-amber-400">poleca</span>.pl
                </span>
              </div>
              <span className="text-[10px] text-slate-400 tracking-wider uppercase font-semibold block -mt-1">
                Prawdziwy sprzęt • Zero ściemy
              </span>
            </div>
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <form action="/okazje" method="GET" className="relative w-full">
              <input
                type="text"
                name="q"
                placeholder="Szukaj wkrętarki, kluczy, myjki, okazji..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 text-slate-100 text-xs rounded-xl pl-9 pr-4 py-2.5 border border-slate-700/80 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 placeholder:text-slate-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </form>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors',
                    link.highlight
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20'
                      : isActive
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  )}
                >
                  <Icon className={cn('w-4 h-4', link.highlight ? 'text-amber-400' : '')} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right actions: Auth button */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/auth/login"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-xl hover:bg-slate-900 transition-colors"
            >
              <User className="w-4 h-4" />
              <span>Zaloguj</span>
            </Link>
            <Link
              href="/vip"
              className="flex items-center gap-1.5 text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-xl shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02]"
            >
              <Crown className="w-4 h-4" />
              <span>Dołącz do VIP</span>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="md:hidden pb-3">
          <form action="/okazje" method="GET" className="relative w-full">
            <input
              type="text"
              name="q"
              placeholder="Szukaj wkrętarki, narzędzi, okazji..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 text-slate-100 text-xs rounded-xl pl-9 pr-4 py-2 border border-slate-800 focus:border-amber-400 focus:outline-none placeholder:text-slate-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
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
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-200 hover:bg-slate-900"
              >
                <Icon className="w-4 h-4 text-amber-400" />
                <span>{link.label}</span>
              </Link>
            );
          })}
          <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
            <Link
              href="/auth/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl bg-slate-900 text-slate-200 text-sm font-bold"
            >
              Zaloguj się
            </Link>
            <Link
              href="/vip"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl bg-amber-500 text-slate-950 text-sm font-black"
            >
              Dołącz do Klubu Szwagra VIP
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
