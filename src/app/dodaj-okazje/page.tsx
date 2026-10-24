'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PlusCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { CATEGORIES } from '@/data/mock-deals';

export default function AddDealPage() {
  const [formData, setFormData] = useState({
    title: '',
    category_id: 'narzedzia',
    deal_url: '',
    store_name: '',
    original_price: '',
    deal_price: '',
    coupon_code: '',
    image_url: '',
    szwagier_verdict: '',
    pros: '',
    cons: '',
    badge: 'POLECENIE_SZWAGRA',
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center bg-slate-900 border border-slate-700 rounded-3xl p-8 sm:p-12 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/40">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
          Dzięki za wrzutę! Szwagier już to sprawdza.
        </h2>
        <p className="text-sm sm:text-base text-slate-200 mb-8 leading-relaxed font-medium">
          Twoja okazja trafiła do poczekalni weryfikacji. Jeśli oferta jest dobra, pojawi się na stronie głównej z odznaką i trafi do alertów dla użytkowników.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => {
              setSubmitted(false);
              setFormData({
                title: '',
                category_id: 'narzedzia',
                deal_url: '',
                store_name: '',
                original_price: '',
                deal_price: '',
                coupon_code: '',
                image_url: '',
                szwagier_verdict: '',
                pros: '',
                cons: '',
                badge: 'POLECENIE_SZWAGRA',
              });
            }}
            className="px-6 py-3 rounded-xl bg-slate-800 text-slate-100 text-sm font-bold hover:bg-slate-700 border border-slate-600"
          >
            Dodaj kolejną okazję
          </button>
          <Link
            href="/okazje"
            className="px-6 py-3 rounded-xl bg-amber-500 text-slate-950 text-sm font-black hover:bg-amber-400"
          >
            Przeglądaj okazje
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/15 text-amber-300 text-xs sm:text-sm font-black uppercase">
          <PlusCircle className="w-4 h-4" />
          <span>Współtwórz szwagierpoleca.pl</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Podrzuć Szwagrowi Okazję!
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-lg mx-auto font-medium">
          Widziałeś tanią wkrętarkę, błąd cenowy w markecie lub świetny zestaw kluczy? Podziel się ze społecznością.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-10 space-y-7 shadow-2xl">
        {/* Deal Link & Title */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-200 mb-2">
              Link do oferty (sklep, Allegro, Amazon, Castorama itp.) *
            </label>
            <input
              type="url"
              required
              placeholder="https://allegro.pl/oferta/..."
              value={formData.deal_url}
              onChange={(e) => setFormData({ ...formData, deal_url: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-200 mb-2">
              Tytuł okazji (Nazwa sprzętu i model) *
            </label>
            <input
              type="text"
              required
              placeholder="np. Młotowiertarka Parkside Performance 20V + Walizka"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Category & Store */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-bold text-slate-200 mb-2">Kategoria *</label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm font-semibold text-white focus:outline-none focus:border-amber-400"
            >
              {CATEGORIES.filter((c) => c.id !== 'wszystkie').map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-200 mb-2">Nazwa sklepu *</label>
            <input
              type="text"
              required
              placeholder="np. Castorama, Lidl, Allegro, Amazon"
              value={formData.store_name}
              onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Prices & Coupon */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="block text-sm font-bold text-slate-200 mb-2">Cena w promocji (zł) *</label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="299.00"
              value={formData.deal_price}
              onChange={(e) => setFormData({ ...formData, deal_price: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm font-semibold text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-200 mb-2">Cena regularna (zł)</label>
            <input
              type="number"
              step="0.01"
              placeholder="499.00"
              value={formData.original_price}
              onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm font-semibold text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-200 mb-2">Kod rabatowy (jeśli jest)</label>
            <input
              type="text"
              placeholder="np. RABAT10"
              value={formData.coupon_code}
              onChange={(e) => setFormData({ ...formData, coupon_code: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm font-semibold text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Image URL & Badge */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-bold text-slate-200 mb-2">Link do zdjęcia produktu</label>
            <input
              type="url"
              placeholder="https://.../zdjecie.jpg"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-200 mb-2">Sugerowana odznaka</label>
            <select
              value={formData.badge}
              onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm font-semibold text-white focus:outline-none focus:border-amber-400"
            >
              <option value="POLECENIE_SZWAGRA">Atest Szwagra 🏆</option>
              <option value="CEBULA_DEAL">Cebula Deal 🧅</option>
              <option value="WOL_ROBOCZY">Wół Roboczy 🔨</option>
              <option value="BLAD_CENOWY">Błąd Cenowy ⚡</option>
            </select>
          </div>
        </div>

        {/* Szwagier's comment / review */}
        <div>
          <label className="block text-sm font-bold text-slate-200 mb-2">
            Krótka opinia: Dlaczego warto to kupić? *
          </label>
          <textarea
            rows={4}
            required
            placeholder="Napisz konkretnie: jak się tym pracuje, co to za silnik, czy nie grzeje się w dłoniach i dlaczego to dobra cena..."
            value={formData.szwagier_verdict}
            onChange={(e) => setFormData({ ...formData, szwagier_verdict: e.target.value })}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 resize-none leading-relaxed"
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-base flex items-center justify-center gap-2.5 shadow-xl shadow-amber-500/25 transition-all hover:scale-[1.01]"
        >
          {isSubmitting ? (
            <span>Wysyłanie do Szwagra...</span>
          ) : (
            <>
              <span>Prześlij okazję do weryfikacji</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
