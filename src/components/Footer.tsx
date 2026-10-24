import React from 'react';
import Link from 'next/link';
import { Wrench, ShieldCheck, Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Column 1: Brand & Philosophy */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black">
                <Wrench className="w-5 h-5 text-slate-950" />
              </div>
              <span className="text-xl font-black text-white">
                szwagier<span className="text-amber-400">poleca</span>.pl
              </span>
            </Link>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              Portal tworzony przez majsterkowiczów dla majsterkowiczów. Prześwietlamy promocje, testujemy sprzęt w garażu i wyłapujemy błędy cenowe.
            </p>
            <div className="flex items-center gap-2.5 text-sm text-amber-300 font-semibold bg-amber-500/10 p-3 rounded-xl border border-amber-500/30">
              <ShieldCheck className="w-5 h-5 shrink-0 text-amber-400" />
              <span>Gwarancja Szwagra: Tylko solidny sprzęt wart swojej ceny.</span>
            </div>
          </div>

          {/* Column 2: Kategorie */}
          <div>
            <h4 className="text-sm sm:text-base font-black uppercase tracking-wider text-white mb-4">
              Kategorie Narzędzi
            </h4>
            <ul className="space-y-2.5 text-sm font-medium">
              <li>
                <Link href="/okazje?kategoria=narzedzia" className="text-slate-300 hover:text-amber-400 transition-colors">
                  Wkrętarki i Młotowiertarki
                </Link>
              </li>
              <li>
                <Link href="/okazje?kategoria=narzedzia" className="text-slate-300 hover:text-amber-400 transition-colors">
                  Zestawy Kluczy i Grzechotki
                </Link>
              </li>
              <li>
                <Link href="/okazje?kategoria=motoryzacja" className="text-slate-300 hover:text-amber-400 transition-colors">
                  Klucze Udarowe do Kół
                </Link>
              </li>
              <li>
                <Link href="/okazje?kategoria=dom-ogrod" className="text-slate-300 hover:text-amber-400 transition-colors">
                  Myjki Ciśnieniowe i Kosiarki
                </Link>
              </li>
              <li>
                <Link href="/okazje?kategoria=elektronika" className="text-slate-300 hover:text-amber-400 transition-colors">
                  Kamery Endoskopowe i Mierniki
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Klub VIP i Płatności */}
          <div>
            <h4 className="text-sm sm:text-base font-black uppercase tracking-wider text-white mb-4">
              Klub Szwagra VIP
            </h4>
            <ul className="space-y-2.5 text-sm font-medium">
              <li>
                <Link href="/vip" className="text-amber-400 font-bold hover:underline flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  Dołącz do strefy VIP (Stripe)
                </Link>
              </li>
              <li>
                <Link href="/vip#korzysci" className="text-slate-300 hover:text-amber-400 transition-colors">
                  Alerty o błędach cenowych
                </Link>
              </li>
              <li>
                <Link href="/vip#korzysci" className="text-slate-300 hover:text-amber-400 transition-colors">
                  Zamknięta społeczność Telegram
                </Link>
              </li>
              <li>
                <Link href="/dodaj-okazje" className="text-slate-300 hover:text-amber-400 transition-colors">
                  Zgłoś okazję i odbierz bonus
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Transparentność i Płatności */}
          <div className="space-y-3.5">
            <h4 className="text-sm sm:text-base font-black uppercase tracking-wider text-white mb-4">
              Bezpieczeństwo & Stripe
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Subskrypcje i płatności są bezpiecznie przetwarzane przez <strong>Stripe</strong> z 256-bitowym szyfrowaniem SSL. Baza danych oraz autoryzacja oparte o <strong>Supabase</strong>.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-xs font-semibold text-slate-300">
              <span className="px-2.5 py-1 bg-slate-900 rounded-lg border border-slate-700">Stripe Verified</span>
              <span className="px-2.5 py-1 bg-slate-900 rounded-lg border border-slate-700">Supabase Auth</span>
              <span className="px-2.5 py-1 bg-slate-900 rounded-lg border border-slate-700">Next.js 14 App</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-slate-400 font-medium">
          <div>
            &copy; {new Date().getFullYear()} szwagierpoleca.pl. Wszystkie prawa zastrzeżone.
          </div>
          <div className="flex items-center gap-1">
            <span>Tworzone z pasją do dobrych narzędzi i taniego tankowania</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
