'use client';

import React, { useState } from 'react';
import { VIP_PLANS, Plan } from '@/lib/stripe';
import { formatPrice } from '@/lib/utils';
import { 
  Crown, 
  CheckCircle2, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  HelpCircle, 
  ArrowRight,
  Lock,
  CreditCard
} from 'lucide-react';

export default function VipPage() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async (plan: Plan) => {
    try {
      setLoadingPlan(plan.id);
      setError(null);

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: plan.priceId,
          planName: plan.name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Wystąpił błąd podczas inicjalizacji płatności Stripe.');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError(err.message || 'Nie udało się połączyć z bramką Stripe.');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="space-y-12 max-w-5xl mx-auto py-4">
      {/* Header section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider">
          <Crown className="w-4 h-4 text-amber-400" />
          <span>Klub Szwagra VIP • Obsługiwany przez Stripe</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Odbieraj błędy cenowe i okazje <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200">
            zanim znikną z półek sklepów
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
          Średni czas życia błędu cenowego na elektronarzędzia to 22 minuty. Jako członek Klubu Szwagra VIP dostajesz powiadomienie natychmiast na swój telefon i zgarniasz sprzęt zanim sklep zorientuje się o pomyłce.
        </p>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
        {VIP_PLANS.map((plan) => {
          const isPopular = plan.popular;

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col justify-between rounded-3xl p-8 border transition-all duration-300 ${
                isPopular
                  ? 'bg-slate-900 border-amber-500 shadow-2xl shadow-amber-500/10 ring-1 ring-amber-500'
                  : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-[11px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-lg">
                  Najczęściej wybierany 🏆
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-black text-white">{plan.name}</h3>
                  {plan.savings && (
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                      {plan.savings}
                    </span>
                  )}
                </div>

                {/* Price display */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-amber-400 tracking-tight">
                      {formatPrice(plan.price)}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">
                      / {plan.period}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Rozliczane automatycznie przez Stripe • rezygnujesz kiedy chcesz
                  </span>
                </div>

                {/* Features list */}
                <div className="space-y-3 pt-4 border-t border-slate-800">
                  <span className="text-xs font-bold text-slate-300 block mb-2">
                    Co zyskujesz w tym planie:
                  </span>
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span className="leading-snug">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-8 mt-6 border-t border-slate-800/80">
                <button
                  onClick={() => handleSubscribe(plan)}
                  disabled={loadingPlan !== null}
                  className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    isPopular
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xl shadow-amber-500/25 hover:scale-[1.02]'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                  }`}
                >
                  {loadingPlan === plan.id ? (
                    <span>Przekierowanie do Stripe...</span>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>Wybierz ten plan</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <div className="flex items-center justify-center gap-1.5 mt-3 text-[11px] text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>256-bitowe szyfrowanie Stripe Checkout</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FAQ Section */}
      <div className="mt-16 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-10 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="w-5 h-5 text-amber-400" />
          <h3 className="text-xl font-black text-white">Najczęstsze pytania o Klub Szwagra</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
          <div className="space-y-1 p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
            <h4 className="font-bold text-white">Czy mogę zrezygnować w dowolnym momencie?</h4>
            <p className="text-slate-400">
              Oczywiście. Wystarczy jedno kliknięcie w panelu klienta Stripe. Nie ma żadnych umów długoterminowych ani ukrytych opłat.
            </p>
          </div>

          <div className="space-y-1 p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
            <h4 className="font-bold text-white">Jak szybko otrzymam powiadomienie o błędzie?</h4>
            <p className="text-slate-400">
              Alerty VIP wysyłane są w ułamku sekundy od momentu wykrycia zjazdu cenowego w sklepie, dzięki czemu masz szansę złożyć zamówienie jako pierwszy.
            </p>
          </div>

          <div className="space-y-1 p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
            <h4 className="font-bold text-white">Jakie metody płatności są obsługiwane?</h4>
            <p className="text-slate-400">
              Przez bramkę Stripe zapłacisz BLIKIEM, kartą debetową/kredytową, Apple Pay oraz Google Pay.
            </p>
          </div>

          <div className="space-y-1 p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
            <h4 className="font-bold text-white">Czy dostanę fakturę VAT?</h4>
            <p className="text-slate-400">
              Tak! System Stripe automatycznie generuje i wysyła fakturę na podany adres e-mail przy każdej płatności.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
