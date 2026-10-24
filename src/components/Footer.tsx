import React from 'react';
import Link from 'next/link';
import { Wrench, ShieldCheck, Heart, Zap, Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Brand & Philosophy */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black">
                <Wrench className="w-4 h-4 text-slate-950" />
              </div>
              <span className="text-lg font-black text-white">
                szwagier<span className="text-amber-400">poleca</span>.pl
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Portal tworzony przez majsterkowiczów dla majsterkowiczów. Prześwietlamy promocje, testujemy sprzęt w garażu i wyłapujemy błędy cenowe.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-400/90 font-semibold bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
              <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Gwarancja Szwagra: Tylko solidny sprzęt wart swojej ceny.</span>
            </div>
          </div>

          {/* Column 2: Kategorie */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 mb-4">
              Kategorie Narzędzi
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/okazje?kategoria=narzedzia" className="hover:text-amber-400 transition-colors">
                  Wkrętarki i Młotowiertarki
                </Link>
              </li>
              <li>
                <Link href="/okazje?kategoria=narzedzia" className="hover:text-amber-400 transition-colors">
                  Zestawy Kluczy i Grzechotki
                </Link>
              </li>
              <li>
                <Link href="/okazje?kategoria=motoryzacja" className="hover:text-amber-400 transition-colors">
                  Klucze Udarowe do Kół
                </Link>
              </li>
              <li>
                <Link href="/okazje?kategoria=dom-ogrod" className="hover:text-amber-400 transition-colors">
                  Myjki Ciśnieniowe i Kosiarki
                </Link>
              </li>
              <li>
                <Link href="/okazje?kategoria=elektronika" className="hover:text-amber-400 transition-colors">
                  Kamery Endoskopowe i Mierniki
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Klub VIP i Płatności */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 mb-4">
              Klub Szwagra VIP
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/vip" className="text-amber-400 font-semibold hover:underline flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Dołącz do strefy VIP (Stripe)
                </Link>
              </li>
              <li>
                <Link href="/vip#korzysci" className="hover:text-amber-400 transition-colors">
                  Alerty o błędach cenowych
                </Link>
              </li>
              <li>
                <Link href="/vip#korzysci" className="hover:text-amber-400 transition-colors">
                  Zamknięta społeczność Telegram
                </Link>
              </li>
              <li>
                <Link href="/dodaj-okazje" className="hover:text-amber-400 transition-colors">
                  Zgłoś okazję i odbierz bonus
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Transparentność i Płatności */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 mb-4">
              Bezpieczeństwo & Stripe
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Subskrypcje i płatności są bezpiecznie przetwarzane przez <strong>Stripe</strong> z 256-bitowym szyfrowaniem SSL. Baza danych oraz autoryzacja oparte o <strong>Supabase</strong>.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-[10px] text-slate-500">
              <span className="px-2 py-1 bg-slate-900 rounded border border-slate-800">Stripe Verified</span>
              <span className="px-2 py-1 bg-slate-900 rounded border border-slate-800">Supabase Auth</span>
              <span className="px-2 py-1 bg-slate-900 rounded border border-slate-800">Next.js 14 App</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} szwagierpoleca.pl. Wszystkie prawa zastrzeżone.
          </div>
          <div className="flex items-center gap-1 text-[11px]">
            <span>Tworzone z pasją do dobrych narzędzi i taniego tankowania</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
