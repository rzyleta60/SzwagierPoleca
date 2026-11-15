'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { MOCK_DEALS } from '@/data/mock-deals';
import { DealCard } from '@/components/DealCard';
import { CategoryNav } from '@/components/CategoryNav';
import { SlidersHorizontal, Search, Sparkles, Tag } from 'lucide-react';

function DealsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('kategoria') || 'wszystkie';
  const initialQuery = searchParams.get('q') || '';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState<'hot' | 'newest' | 'discount' | 'price-asc'>('hot');
  const [vipOnlyFilter, setVipOnlyFilter] = useState(false);

  const filteredDeals = useMemo(() => {
    return MOCK_DEALS.filter((deal) => {
      // Category match (wspiera relację M:N - jeden produkt w wielu kategoriach)
      if (selectedCategory !== 'wszystkie') {
        const inCategories = deal.category_ids?.includes(selectedCategory) || deal.category_id === selectedCategory;
        if (!inCategories) return false;
      }
      // Search query match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = deal.title.toLowerCase().includes(query);
        const matchesDesc = deal.description.toLowerCase().includes(query);
        const matchesStore = deal.store_name.toLowerCase().includes(query);
        const matchesVerdict = deal.szwagier_verdict.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesStore && !matchesVerdict) {
          return false;
        }
      }
      // VIP only filter
      if (vipOnlyFilter && !deal.is_vip_only) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'hot') return b.temperature - a.temperature;
      if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'discount') return (b.discount_percent || 0) - (a.discount_percent || 0);
      if (sortBy === 'price-asc') return a.deal_price - b.deal_price;
      return 0;
    });
  }, [selectedCategory, searchQuery, sortBy, vipOnlyFilter]);

  return (
    <div className="space-y-10">
      {/* Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 text-amber-300 text-xs sm:text-sm font-bold mb-3">
            <Tag className="w-4 h-4" />
            Baza Promocji Narzędziowych
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Wszystkie okazje Szwagra
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mt-2 font-medium">
            Znaleziono <strong className="text-amber-400 font-extrabold">{filteredDeals.length}</strong> ofert sprawdzonych pod kątem opłacalności.
          </p>
        </div>

        {/* Search bar inside page */}
        <div className="w-full md:w-96 relative">
          <input
            type="text"
            placeholder="Filtruj po tytule, marce..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 text-slate-100 text-sm font-medium rounded-xl pl-10 pr-4 py-3 border border-slate-700 focus:border-amber-400 focus:outline-none placeholder:text-slate-400"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
        </div>
      </div>

      {/* Category selector */}
      <CategoryNav
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Secondary filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-700">
        {/* Toggle VIP only */}
        <label className="flex items-center gap-3 cursor-pointer text-sm font-bold text-slate-200 hover:text-white select-none">
          <input
            type="checkbox"
            checked={vipOnlyFilter}
            onChange={(e) => setVipOnlyFilter(e.target.checked)}
            className="w-5 h-5 rounded text-amber-500 bg-slate-800 border-slate-600 focus:ring-amber-400"
          />
          <span>Tylko okazje VIP / Błędy cenowe 👑</span>
        </label>

        {/* Sort */}
        <div className="flex items-center gap-3 text-sm">
          <SlidersHorizontal className="w-4 h-4 text-slate-300" />
          <span className="text-slate-300 font-semibold hidden sm:inline">Sortuj według:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-950 border border-slate-700 text-sm font-bold text-slate-100 rounded-xl px-4 py-2.5 focus:outline-none focus:border-amber-400"
          >
            <option value="hot">🔥 Najgorętsze (°C)</option>
            <option value="newest">⏱ Najnowsze</option>
            <option value="discount">💥 Największy rabat %</option>
            <option value="price-asc">💰 Cena: najniższa</option>
          </select>
        </div>
      </div>

      {/* Deals list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredDeals.map((deal) => (
          <DealCard key={deal.id} deal={deal} />
        ))}
      </div>

      {filteredDeals.length === 0 && (
        <div className="text-center py-20 bg-slate-900/60 rounded-3xl border border-slate-800 p-8">
          <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-4 opacity-70" />
          <h3 className="text-lg font-bold text-white mb-2">
            Brak ofert spełniających podane kryteria
          </h3>
          <p className="text-sm text-slate-300 mb-6 max-w-sm mx-auto">
            Spróbuj zmienić kategorię, wyczyścić wyszukiwarkę lub odznaczyć filtr VIP.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('wszystkie');
              setSearchQuery('');
              setVipOnlyFilter(false);
            }}
            className="px-6 py-3 rounded-xl bg-amber-500 text-slate-950 font-black text-sm hover:bg-amber-400 transition"
          >
            Resetuj filtry
          </button>
        </div>
      )}
    </div>
  );
}

export default function DealsPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-slate-300 text-base font-semibold">Ładowanie okazji Szwagra...</div>}>
      <DealsContent />
    </Suspense>
  );
}
