'use client';

import React, { useState } from 'react';
import { VIP_PLANS, Plan } from '@/lib/stripe';
import { formatPrice } from '@/lib/utils';
import { 
  Crown, 
  CheckCircle2, 
  ShieldCheck, 
  HelpCircle, 
  ArrowRight,
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
    <div className="space-y-14 max-w-5xl mx-auto py-6">
      {/* Header section */}
      <div className="text-center space-y-5 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs sm:text-sm font-black uppercase tracking-wider">
          <Crown className="w-4 h-4 text-amber-400" />
          <span>Klub Szwagra VIP • Obsługiwany przez Stripe</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Odbieraj błędy cenowe i okazje <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-orange-400">
            zanim znikną z półek sklepów
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-normal">
          Średni czas życia błędu cenowego na elektronarzędzia to 22 minuty. Jako członek Klubu Szwagra VIP dostajesz powiadomienie natychmiast na swój telefon i zgarniasz sprzęt zanim sklep zorientuje się o pomyłce.
        </p>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-sm font-bold">
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
              className={`relative flex flex-col justify-between rounded-3xl p-8 sm:p-10 border transition-all duration-300 shadow-xl ${
                isPopular
                  ? 'bg-slate-900 border-amber-400 shadow-2xl shadow-amber-500/15 ring-2 ring-amber-400'
                  : 'bg-slate-900 border-slate-700'
              }`}
            >
              {isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 text-xs sm:text-sm font-black uppercase tracking-wider px-4 py-1.5 rounded-full shadow-lg">
                  Najczęściej wybierany 🏆
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl sm:text-2xl font-black text-white">{plan.name}</h3>
                </div>

                {plan.savings && (
                  <div className="mb-4">
                    <span className="text-xs sm:text-sm font-extrabold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-lg">
                      {plan.savings}
                    </span>
                  </div>
                )}

                {/* Price display */}
                <div className="mb-8">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl sm:text-5xl font-black text-amber-400 tracking-tight">
                      {formatPrice(plan.price)}
                    </span>
                    <span className="text-sm sm:text-base text-slate-300 font-bold">
                      / {plan.period}
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm text-slate-400 font-medium block mt-1">
                    Rozliczane automatycznie przez Stripe • rezygnujesz kiedy chcesz
                  </span>
                </div>

                {/* Features list */}
                <div className="space-y-4 pt-6 border-t border-slate-800">
                  <span className="text-sm font-extrabold text-white block mb-2">
                    Co zyskujesz w tym planie:
                  </span>
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-sm sm:text-base text-slate-200 font-medium">
                      <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <span className="leading-snug">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-8 mt-8 border-t border-slate-800">
                <button
                  onClick={() => handleSubscribe(plan)}
                  disabled={loadingPlan !== null}
                  className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all ${
                    isPopular
                      ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-xl shadow-amber-500/25 hover:scale-105'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-600'
                  }`}
                >
                  {loadingPlan === plan.id ? (
                    <span>Przekierowanie do Stripe...</span>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      <span>Wybierz ten plan</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
                <div className="flex items-center justify-center gap-2 mt-3.5 text-xs sm:text-sm text-slate-400 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>256-bitowe szyfrowanie Stripe Checkout</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FAQ Section */}
      <div className="mt-16 bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-10 max-w-4xl mx-auto space-y-8 shadow-xl">
        <div className="flex items-center gap-3">
          <HelpCircle className="w-6 h-6 text-amber-400" />
          <h3 className="text-xl sm:text-2xl font-black text-white">Najczęstsze pytania o Klub Szwagra</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm leading-relaxed">
          <div className="space-y-2 p-5 rounded-2xl bg-slate-950 border border-slate-700">
            <h4 className="font-extrabold text-base text-white">Czy mogę zrezygnować w dowolnym momencie?</h4>
            <p className="text-slate-300 font-medium">
              Oczywiście. Wystarczy jedno kliknięcie w panelu klienta Stripe. Nie ma żadnych umów długoterminowych ani ukrytych opłat.
            </p>
          </div>

          <div className="space-y-2 p-5 rounded-2xl bg-slate-950 border border-slate-700">
            <h4 className="font-extrabold text-base text-white">Jak szybko otrzymam powiadomienie o błędzie?</h4>
            <p className="text-slate-300 font-medium">
              Alerty VIP wysyłane są w ułamku sekundy od momentu wykrycia zjazdu cenowego w sklepie, dzięki czemu masz szansę złożyć zamówienie jako pierwszy.
            </p>
          </div>

          <div className="space-y-2 p-5 rounded-2xl bg-slate-950 border border-slate-700">
            <h4 className="font-extrabold text-base text-white">Jakie metody płatności są obsługiwane?</h4>
            <p className="text-slate-300 font-medium">
              Przez bramkę Stripe zapłacisz BLIKIEM, kartą debetową/kredytową, Apple Pay oraz Google Pay.
            </p>
          </div>

          <div className="space-y-2 p-5 rounded-2xl bg-slate-950 border border-slate-700">
            <h4 className="font-extrabold text-base text-white">Czy dostanę fakturę VAT?</h4>
            <p className="text-slate-300 font-medium">
              Tak! System Stripe automatycznie generuje i wysyła fakturę na podany adres e-mail przy każdej płatności.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
