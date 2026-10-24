import React from 'react';
import Link from 'next/link';
import { Crown, CheckCircle2, ArrowRight } from 'lucide-react';

export function VipPromoBanner() {
  return (
    <div className="my-16 rounded-3xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 p-1 shadow-2xl">
      <div className="bg-slate-950 rounded-[22px] p-6 sm:p-10 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs sm:text-sm font-black uppercase tracking-wider">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>Strefa VIP zintegrowana ze Stripe</span>
          </div>

          <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Chcesz wiedzieć o błędach cenowych zanim znikną?
          </h3>

          <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
            Najlepsze okazje i błędy cenowe w sklepach (Castorama, Allegro, Lidl, Amazon) żyją średnio kilkanaście minut. Członkowie <strong>Klubu Szwagra VIP</strong> otrzymują natychmiastowe alerty bezpośrednio na telefon oraz dostęp do zamkniętych kodów rabatowych.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
            <div className="flex items-center gap-2.5 text-sm sm:text-base text-slate-200 font-medium">
              <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
              <span>Błyskawiczne alerty o błędach cenowych</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm sm:text-base text-slate-200 font-medium">
              <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
              <span>Odznaka Złotego Szwagra w profilu</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm sm:text-base text-slate-200 font-medium">
              <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
              <span>Bezpieczne płatności przez Stripe</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm sm:text-base text-slate-200 font-medium">
              <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
              <span>Możliwość rezygnacji w dowolnej chwili</span>
            </div>
          </div>
        </div>

        <div className="shrink-0 flex flex-col items-center gap-3 w-full lg:w-auto">
          <Link
            href="/vip"
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-9 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-base tracking-wide shadow-xl shadow-amber-500/25 transition-all hover:scale-105"
          >
            <span>Dołącz do Klubu od 19,99 zł</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <span className="text-xs sm:text-sm text-slate-300 font-medium">
            Płatność kartą, BLIK lub Apple Pay przez Stripe
          </span>
        </div>
      </div>
    </div>
  );
}
