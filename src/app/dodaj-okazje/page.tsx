'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PlusCircle, Sparkles, CheckCircle2, ArrowRight, Upload, AlertCircle } from 'lucide-react';
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

    // Simulate saving deal to Supabase
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">
          Dzięki za wrzutę! Szwagier już to sprawdza.
        </h2>
        <p className="text-sm text-slate-300 mb-6 leading-relaxed">
          Twoja okazja trafiła do poczekalni weryfikacji. Jeśli oferta jest dobra, pojawi się na stronie głównej z odznaką i trafi do alertów dla użytkowników.
        </p>
        <div className="flex justify-center gap-3">
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
            className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-700"
          >
            Dodaj kolejną okazję
          </button>
          <Link
            href="/okazje"
            className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-black hover:bg-amber-400"
          >
            Przeglądaj okazje
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-black uppercase">
          <PlusCircle className="w-4 h-4" />
          <span>Współtwórz szwagierpoleca.pl</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">
          Podrzuć Szwagrowi Okazję!
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
          Widziałeś tanią wkrętarkę, błąd cenowy w markecie lub świetny zestaw kluczy? Podziel się ze społecznością.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        {/* Deal Link & Title */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1">
              Link do oferty (sklep, Allegro, Amazon, Castorama itp.) *
            </label>
            <input
              type="url"
              required
              placeholder="https://allegro.pl/oferta/..."
              value={formData.deal_url}
              onChange={(e) => setFormData({ ...formData, deal_url: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1">
              Tytuł okazji (Nazwa sprzętu i model) *
            </label>
            <input
              type="text"
              required
              placeholder="np. Młotowiertarka Parkside Performance 20V + Walizka"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Category & Store */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1">Kategoria *</label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
            >
              {CATEGORIES.filter((c) => c.id !== 'wszystkie').map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1">Nazwa sklepu *</label>
            <input
              type="text"
              required
              placeholder="np. Castorama, Lidl, Allegro, Amazon"
              value={formData.store_name}
              onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Prices & Coupon */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1">Cena w promocji (zł) *</label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="299.00"
              value={formData.deal_price}
              onChange={(e) => setFormData({ ...formData, deal_price: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1">Cena regularna (zł)</label>
            <input
              type="number"
              step="0.01"
              placeholder="499.00"
              value={formData.original_price}
              onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1">Kod rabatowy (jeśli jest)</label>
            <input
              type="text"
              placeholder="np. RABAT10"
              value={formData.coupon_code}
              onChange={(e) => setFormData({ ...formData, coupon_code: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Image URL & Badge */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1">Link do zdjęcia produktu</label>
            <input
              type="url"
              placeholder="https://.../zdjecie.jpg"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1">Sugerowana odznaka</label>
            <select
              value={formData.badge}
              onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
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
          <label className="block text-xs font-bold text-slate-200 mb-1">
            Krótka opinia: Dlaczego warto to kupić? *
          </label>
          <textarea
            rows={4}
            required
            placeholder="Napisz konkretnie: jak się tym pracuje, co to za silnik, czy nie grzeje się w dłoniach i dlaczego to dobra cena..."
            value={formData.szwagier_verdict}
            onChange={(e) => setFormData({ ...formData, szwagier_verdict: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 resize-none"
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 transition-all"
        >
          {isSubmitting ? (
            <span>Wysyłanie do Szwagra...</span>
          ) : (
            <>
              <span>Prześlij okazję do weryfikacji</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
