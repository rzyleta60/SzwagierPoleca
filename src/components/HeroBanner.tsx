import React from 'react';
import Link from 'next/link';
import { Flame, ShieldCheck, Crown, Sparkles, TrendingUp, Award } from 'lucide-react';

export function HeroBanner() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/30 border border-slate-800 p-6 sm:p-10 lg:p-12 mb-10 shadow-2xl">
      {/* Background glowing gradients */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-20 w-72 h-72 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl">
        {/* Top pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Weryfikowane w garażu • Bez sponsorowanych bzdur</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
          Nie przepłacaj za sprzęt. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200">
            Kupuj to, co poleca Szwagier!
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl font-normal">
          Wyszukujemy najgorętsze okazje, promocje narzędziowe, klucze warsztatowe, sprzęt do garażu i błędy cenowe w polskich sklepach. Każda oferta ma werdykt Szwagra: plusy, minusy i twarde fakty bez owijania w bawełnę.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/okazje"
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 transition-all hover:scale-[1.02]"
          >
            <Flame className="w-4 h-4 fill-slate-950" />
            <span>Przeglądaj Okazje Dnia</span>
          </Link>

          <Link
            href="/vip"
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/30 font-bold text-sm transition-all"
          >
            <Crown className="w-4 h-4 text-amber-400" />
            <span>Klub Szwagra VIP (Stripe)</span>
          </Link>
        </div>

        {/* Trust metrics */}
        <div className="mt-10 pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center text-amber-400 border border-slate-700/50">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-black text-white">1,400+</div>
              <div className="text-xs text-slate-400">Przetestowanych narzędzi</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center text-emerald-400 border border-slate-700/50">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-black text-white">&gt; 1 200 000 zł</div>
              <div className="text-xs text-slate-400">Zaoszczędzone przez społeczność</div>
            </div>
          </div>

          <div className="flex items-center gap-3 col-span-2 sm:col-span-1">
            <div className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center text-amber-400 border border-slate-700/50">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-black text-white">100% Garaż</div>
              <div className="text-xs text-slate-400">Rzetelne plusy i minusy</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
