import React from 'react';
import Link from 'next/link';
import { Flame, ShieldCheck, Crown, Sparkles, TrendingUp, Award } from 'lucide-react';

export function HeroBanner() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/40 border border-slate-700/80 p-6 sm:p-10 lg:p-14 mb-12 shadow-2xl">
      {/* Background glowing gradients */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl">
        {/* Top pill */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs sm:text-sm font-black uppercase tracking-wider mb-6">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Weryfikowane w garażu • Bez sponsorowanych bzdur</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
          Nie przepłacaj za sprzęt. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-orange-400">
            Kupuj to, co poleca Szwagier!
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-slate-200 leading-relaxed font-normal max-w-2xl">
          Wyszukujemy najgorętsze okazje, promocje narzędziowe, klucze warsztatowe, sprzęt do garażu i błędy cenowe w polskich sklepach. Każda oferta ma werdykt Szwagra: plusy, minusy i twarde fakty bez owijania w bawełnę.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/okazje"
            className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-base shadow-xl shadow-amber-500/25 transition-all hover:scale-105"
          >
            <Flame className="w-5 h-5 fill-slate-950" />
            <span>Przeglądaj Okazje Dnia</span>
          </Link>

          <Link
            href="/vip"
            className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 font-extrabold text-base transition-all"
          >
            <Crown className="w-5 h-5 text-amber-400" />
            <span>Klub Szwagra VIP (Stripe)</span>
          </Link>
        </div>

        {/* Trust metrics */}
        <div className="mt-12 pt-8 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-amber-400 border border-slate-700">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-white">1 400+</div>
              <div className="text-xs sm:text-sm text-slate-300 font-medium">Narzędzi w testach</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-emerald-400 border border-slate-700">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-emerald-400">&gt; 1 200 000 zł</div>
              <div className="text-xs sm:text-sm text-slate-300 font-medium">Zaoszczędzili czytelnicy</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 col-span-2 sm:col-span-1">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-amber-400 border border-slate-700">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-white">100% Garaż</div>
              <div className="text-xs sm:text-sm text-slate-300 font-medium">Szczera ocena wad i zalet</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
