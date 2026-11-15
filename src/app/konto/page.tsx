'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Order } from '@/types';
import { formatPrice } from '@/lib/utils';
import { 
  User, 
  Crown, 
  ShoppingBag, 
  Package, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Download, 
  ExternalLink, 
  LogOut, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  Bell, 
  ChevronRight,
  ArrowRight,
  BookmarkCheck,
  Receipt
} from 'lucide-react';
import { MOCK_DEALS } from '@/data/mock-deals';
import { DealCard } from '@/components/DealCard';

export default function AccountPage() {
  const { user, profile, isVip, isLoading: authLoading, signOut, toggleTestVip } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'vip' | 'saved' | 'settings'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [invoiceDownloaded, setInvoiceDownloaded] = useState<string | null>(null);
  const [testToggling, setTestToggling] = useState(false);
  const [savedUsername, setSavedUsername] = useState('');
  const [usernameUpdated, setUsernameUpdated] = useState(false);

  useEffect(() => {
    if (profile?.username) {
      setSavedUsername(profile.username);
    }
  }, [profile]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoadingOrders(true);
        const url = user?.id ? `/api/orders?userId=${user.id}` : '/api/orders';
        const res = await fetch(url);
        const data = await res.json();
        if (data.orders) {
          setOrders(data.orders);
        }
      } catch (err) {
        console.warn('Błąd ładowania zamówień:', err);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [user, isVip]);

  const handleDownloadInvoice = (orderNumber: string) => {
    setInvoiceDownloaded(orderNumber);
    setTimeout(() => {
      setInvoiceDownloaded(null);
    }, 3000);
  };

  const handleTestVipToggle = async (enable: boolean) => {
    try {
      setTestToggling(true);
      await toggleTestVip(enable);
      // Odśwież zamówienia po aktywacji testowej
      const url = user?.id ? `/api/orders?userId=${user.id}` : '/api/orders';
      const res = await fetch(url);
      const data = await res.json();
      if (data.orders) {
        setOrders(data.orders);
      }
    } finally {
      setTestToggling(false);
    }
  };

  if (authLoading) {
    return (
      <div className="py-24 text-center">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-300 font-bold text-base">Ładowanie Twojego profilu...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/15 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
          <User className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white">Zaloguj się na swoje konto</h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Aby sprawdzić historię swoich zamówień, aktywną subskrypcję VIP i zapisane okazje, musisz być zalogowany.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/auth/login"
            className="px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-base transition shadow-lg shadow-amber-500/25"
          >
            Zaloguj się
          </Link>
          <Link
            href="/auth/register"
            className="px-8 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-base border border-slate-700 transition"
          >
            Załóż darmowe konto
          </Link>
        </div>
      </div>
    );
  }

  const displayName = profile?.username || user.user_metadata?.username || user.email?.split('@')[0] || 'Użytkownik';
  const displayEmail = profile?.email || user.email || 'brak@email.pl';

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-12">
      {/* Top Profile Card */}
      <div className="p-6 sm:p-10 rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          {/* Avatar and user info */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-400 p-1 shadow-xl shadow-amber-500/20">
                <div className="w-full h-full rounded-[22px] bg-slate-950 flex items-center justify-center text-amber-400 font-black text-2xl sm:text-3xl">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              </div>
              {isVip && (
                <div className="absolute -bottom-2 -right-2 bg-amber-400 text-slate-950 p-1.5 rounded-xl shadow-md" title="Konto VIP Aktywne">
                  <Crown className="w-4 h-4 fill-slate-950" />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-white">{displayName}</h1>
                {isVip ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md">
                    <Crown className="w-3.5 h-3.5" />
                    ZŁOTY SZWAGIER VIP 👑
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    Konto Standardowe
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-sm font-medium">{displayEmail}</p>
              <p className="text-slate-300 text-xs font-semibold">
                Rola w portalu: <span className="text-amber-400 font-bold">{profile?.role === 'szwagier_admin' ? 'Administrator Główny' : 'Majster Warsztatowy'}</span>
              </p>
            </div>
          </div>

          {/* Quick status actions */}
          <div className="flex flex-wrap items-center gap-3">
            {isVip ? (
              <button
                onClick={() => handleTestVipToggle(false)}
                disabled={testToggling}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 hover:text-rose-300 border border-slate-700 text-xs sm:text-sm font-bold transition flex items-center gap-2"
              >
                <span>Wyłącz VIP (do testów)</span>
              </button>
            ) : (
              <button
                onClick={() => handleTestVipToggle(true)}
                disabled={testToggling}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs sm:text-sm font-black transition shadow-md shadow-amber-400/20 flex items-center gap-2"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>Aktywuj VIP testowo (bez Stripe) ⚡</span>
              </button>
            )}

            <button
              onClick={signOut}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 border border-slate-700 transition"
              title="Wyloguj się"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-black transition-all shrink-0 ${
            activeTab === 'orders'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'text-slate-300 hover:text-white hover:bg-slate-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Moje Zamówienia ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('vip')}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-black transition-all shrink-0 ${
            activeTab === 'vip'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'text-slate-300 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Crown className="w-4 h-4" />
          <span>Subskrypcja VIP {isVip && '👑'}</span>
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-black transition-all shrink-0 ${
            activeTab === 'saved'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'text-slate-300 hover:text-white hover:bg-slate-900'
          }`}
        >
          <BookmarkCheck className="w-4 h-4" />
          <span>Zapisane Okazje</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-black transition-all shrink-0 ${
            activeTab === 'settings'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'text-slate-300 hover:text-white hover:bg-slate-900'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Ustawienia Profilu</span>
        </button>
      </div>

      {/* TAB 1: HISTORIA ZAMÓWIEŃ */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">Historia Zamówień i Płatności</h2>
              <p className="text-slate-400 text-sm">
                Wszystkie zakupy, pakiety VIP i usługi zamówione na Twoim koncie.
              </p>
            </div>
            {!isVip && (
              <Link
                href="/vip"
                className="self-start sm:self-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm transition flex items-center gap-2"
              >
                <Crown className="w-4 h-4" />
                <span>Kup Pakiet VIP</span>
              </Link>
            )}
          </div>

          {loadingOrders ? (
            <div className="py-16 text-center text-slate-400">
              <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <span>Wczytywanie historii transakcji...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4">
              <Package className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-lg font-bold text-white">Brak zamówień na tym koncie</h3>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                Nie masz jeszcze zapisanych zamówień. Możesz aktywować Klub VIP lub wejść w dowolną okazję i po udanym zakupie w sklepie kliknąć <strong>„Kupiłem ten sprzęt”</strong>, aby zapisać go w historii.
              </p>
              <button
                onClick={() => handleTestVipToggle(true)}
                className="mt-2 px-6 py-3 rounded-xl bg-amber-500 text-slate-950 font-black text-sm hover:bg-amber-400 transition"
              >
                Aktywuj VIP (doda testowe zamówienie) ⚡
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const orderDate = new Date(order.created_at).toLocaleDateString('pl-PL', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={order.id}
                    className="p-6 rounded-3xl bg-slate-900 border border-slate-700/80 hover:border-amber-400/50 transition-all shadow-xl space-y-4"
                  >
                    {/* Order header row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                          <Receipt className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-base font-black text-white">{order.order_number}</span>
                            <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                              <CheckCircle2 className="w-3 h-3" />
                              Opłacone
                            </span>
                          </div>
                          <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                            <Clock className="w-3.5 h-3.5" />
                            {orderDate}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xl sm:text-2xl font-black text-amber-400">
                          {formatPrice(order.total_amount)}
                        </div>
                        <span className="text-xs text-slate-400 font-medium">
                          Płatność: <strong className="text-slate-300">{order.payment_method || 'Stripe'}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Order items */}
                    <div className="space-y-2 pt-1">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Pozycje zamówienia:</div>
                      {order.items?.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800"
                        >
                          <div className="flex items-center gap-3.5">
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-11 h-11 object-cover rounded-xl border border-slate-800 shrink-0"
                              />
                            ) : (
                              <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                                <Package className="w-5 h-5 text-amber-400" />
                              </div>
                            )}
                            <div>
                              <span className="text-sm font-extrabold text-slate-200 block">{item.name}</span>
                              <div className="flex flex-wrap items-center gap-2 mt-0.5">
                                {item.store && (
                                  <span className="text-[11px] font-bold text-amber-400">
                                    Sklep: {item.store}
                                  </span>
                                )}
                                <span className="text-[11px] text-slate-400 font-bold">x{item.quantity}</span>
                                {item.deal_url && (
                                  <a
                                    href={item.deal_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[11px] text-slate-400 hover:text-white underline ml-1"
                                  >
                                    Strona oferty ↗
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                          <span className="text-sm font-black text-slate-100 shrink-0">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Order actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Transakcja zweryfikowana przez system szwagierpoleca.pl</span>
                      </div>

                      <button
                        onClick={() => handleDownloadInvoice(order.order_number)}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-2 border border-slate-700"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>
                          {invoiceDownloaded === order.order_number ? 'Pobrano potwierdzenie!' : 'Pobierz potwierdzenie / Fakturę'}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SUBSKRYPCJA I KLUB VIP */}
      {activeTab === 'vip' && (
        <div className="space-y-8">
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-700 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-400/25">
                  <Crown className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">Status Twojego Członkostwa VIP</h3>
                  <p className="text-slate-300 text-sm mt-0.5">
                    {isVip
                      ? 'Posiadasz pełen nielimitowany dostęp do wszystkich zastrzeżonych okazji.'
                      : 'Aktualnie korzystasz z bezpłatnego konta podstawowego.'}
                  </p>
                </div>
              </div>

              <div>
                {isVip ? (
                  <span className="px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-black border border-emerald-500/40 inline-flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Subskrypcja Aktywna
                  </span>
                ) : (
                  <Link
                    href="/vip"
                    className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-black transition flex items-center gap-2"
                  >
                    <Crown className="w-4 h-4" />
                    <span>Aktywuj Klub VIP</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Perks included */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-amber-400 font-bold text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Błędy Cenowe
                </div>
                <p className="text-xs text-slate-300">
                  Dostęp do okazji ze zniżkami sięgającymi 60-80% zanim sklep zablokuje zamówienia.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-amber-400 font-bold text-sm flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Alerty Natychmiastowe
                </div>
                <p className="text-xs text-slate-300">
                  Powiadomienia w czasie rzeczywistym o zrzutach cenowych na elektronarzędzia.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-amber-400 font-bold text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Ukryte Kody Rabatowe
                </div>
                <p className="text-xs text-slate-300">
                  Specjalne kody negocjowane bezpośrednio z hurtowniami i dystrybutorami.
                </p>
              </div>
            </div>

            {/* Management options */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="font-extrabold text-white text-sm">Zarządzanie kontem i płatnościami</h4>
                <p className="text-xs text-slate-400">
                  Możesz w każdej chwili zrezygnować, zmienić kartę lub pobrać faktury VAT w portalu klienta Stripe.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {isVip && (
                  <button
                    onClick={() => handleTestVipToggle(false)}
                    disabled={testToggling}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 hover:text-rose-300 text-xs font-bold border border-slate-700 transition"
                  >
                    Wyłącz VIP (test)
                  </button>
                )}

                <Link
                  href="/vip"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition flex items-center gap-1.5"
                >
                  <span>Przejdź do oferty VIP</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ZAPISANE OKAZJE */}
      {activeTab === 'saved' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">Twój Schowek Okazji</h2>
            <p className="text-slate-400 text-sm">
              Szybki dostęp do polecanych sprzętów, które warto mieć na oku.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_DEALS.slice(0, 3).map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: USTAWIENIA PROFILU */}
      {activeTab === 'settings' && (
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-700 shadow-xl space-y-6 max-w-2xl">
          <div>
            <h3 className="text-xl font-black text-white">Ustawienia profilu i powiadomień</h3>
            <p className="text-slate-400 text-sm mt-1">
              Dostosuj sposób wyświetlania swojego konta i preferencje alertów.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setUsernameUpdated(true);
              setTimeout(() => setUsernameUpdated(false), 2500);
            }}
            className="space-y-5"
          >
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Nazwa użytkownika (Nick w komentarzach)
              </label>
              <input
                type="text"
                value={savedUsername}
                onChange={(e) => setSavedUsername(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white text-sm font-bold rounded-xl px-4 py-3 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Adres e-mail
              </label>
              <input
                type="email"
                disabled
                value={displayEmail}
                className="w-full bg-slate-950/60 border border-slate-800 text-slate-500 text-sm font-bold rounded-xl px-4 py-3 cursor-not-allowed"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Adres powiązany z kontem Supabase / Stripe.
              </span>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition"
              >
                {usernameUpdated ? 'Zapisano zmiany! ✓' : 'Zapisz zmiany profilu'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
