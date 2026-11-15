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
  CreditCard,
  ExternalLink,
  Zap
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function VipPage() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isTogglingTest, setIsTogglingTest] = useState(false);
  const { user, profile, isVip, toggleTestVip } = useAuth();

  const handleSubscribe = async (plan: Plan) => {
    try {
      setLoadingPlan(plan.id);
      setError(null);
      setSuccessMsg(null);

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: plan.priceId,
          planName: plan.name,
          userId: user?.id,
          userEmail: user?.email,
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

  const handleToggleVip = async (enable: boolean, planId?: string) => {
    try {
      setIsTogglingTest(true);
      setError(null);
      setSuccessMsg(null);
      await toggleTestVip(enable, planId);
      if (enable) {
        setSuccessMsg('⚡ Sukces! Status VIP został aktywowany bez konieczności przechodzenia przez Stripe. Wszystkie okazje i ukryte kody są już odblokowane!');
      } else {
        setSuccessMsg('Status VIP został wyłączony. Teraz widzisz portal jako użytkownik darmowy z zablokowanymi ofertami.');
      }
    } catch (err: any) {
      setError('Nie udało się przełączyć statusu testowego.');
    } finally {
      setIsTogglingTest(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setError(null);
      const response = await fetch('/api/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: profile?.stripe_customer_id,
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError('Nie udało się otworzyć portalu rozliczeniowego Stripe.');
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

        {/* Panel testowy bez Stripe */}
        <div className="p-6 rounded-3xl bg-slate-900 border-2 border-dashed border-amber-400/80 shadow-2xl text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-lg shadow-amber-400/20">
                <Zap className="w-6 h-6 fill-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded tracking-wide">
                    Tryb Testowy (Bez Stripe)
                  </span>
                  <span className="text-xs font-bold text-slate-300">
                    Status: {isVip ? <strong className="text-emerald-400 font-black">VIP AKTYWNY 👑</strong> : <span className="text-slate-400">Darmowy (brak VIP)</span>}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white mt-1">
                  Kup lub włącz VIP jednym kliknięciem do testów
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-0.5 leading-relaxed">
                  Nie musisz podawać karty ani przechodzić przez Stripe Checkout. Kliknij przycisk obok, aby natychmiast nadać sobie uprawnienia VIP i sprawdzić odblokowane okazje.
                </p>
              </div>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {isVip ? (
                <button
                  onClick={() => handleToggleVip(false)}
                  disabled={isTogglingTest}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 hover:text-rose-300 border border-slate-700 text-sm font-black transition flex items-center justify-center gap-2"
                >
                  <span>Wyłącz VIP (test blokad)</span>
                </button>
              ) : (
                <button
                  onClick={() => handleToggleVip(true)}
                  disabled={isTogglingTest}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-sm font-black transition shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 hover:scale-[1.02]"
                >
                  <Zap className="w-4 h-4 fill-slate-950" />
                  <span>Aktywuj VIP bez Stripe ⚡</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Informacja o aktywnym VIP */}
        {isVip && (
          <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-500/20 via-slate-900 to-amber-500/15 border-2 border-emerald-400 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 text-left">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-400 flex items-center justify-center text-slate-950 font-black shrink-0">
                <Crown className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Twój dostęp VIP jest w pełni aktywny! 👑</h3>
                <p className="text-sm text-slate-300">
                  Wszystkie okazje, ukryte kody rabatowe i linki do sklepów są dla Ciebie odblokowane.
                </p>
              </div>
            </div>
            <button
              onClick={handleManageSubscription}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-600 transition flex items-center gap-2 shrink-0"
            >
              <span>Zarządzaj subskrypcją Stripe</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-sm font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

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
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm sm:text-base text-slate-200 font-medium">
                      <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                {/* Standard Stripe checkout button */}
                <button
                  onClick={() => handleSubscribe(plan)}
                  disabled={loadingPlan !== null || isTogglingTest}
                  className={`w-full py-4 px-6 rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-all shadow-xl hover:scale-[1.01] ${
                    isPopular
                      ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-500/25'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                  }`}
                >
                  {loadingPlan === plan.id ? (
                    <span className="animate-pulse">Przekierowywanie do Stripe...</span>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      <span>Kup przez Stripe</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                {/* Direct test activation button without Stripe */}
                <button
                  type="button"
                  onClick={() => handleToggleVip(true, plan.id)}
                  disabled={isTogglingTest}
                  className="w-full py-3 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:text-amber-200 text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition"
                >
                  <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>Kup testowo bez Stripe (1 kliknięcie) ⚡</span>
                </button>

                <div className="flex items-center justify-center gap-2 pt-1 text-xs text-slate-400 font-medium">
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
