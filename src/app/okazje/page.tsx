'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { MOCK_DEALS, CATEGORIES } from '@/data/mock-deals';
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
      // Category match
      if (selectedCategory !== 'wszystkie' && deal.category_id !== selectedCategory) {
        return false;
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
    <div className="space-y-8">
      {/* Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold mb-2">
            <Tag className="w-3.5 h-3.5" />
            Baza Promocji Narzędziowych
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Wszystkie okazje Szwagra
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Znaleziono <strong className="text-amber-400">{filteredDeals.length}</strong> ofert sprawdzonych pod kątem opłacalności.
          </p>
        </div>

        {/* Search bar inside page */}
        <div className="w-full md:w-80 relative">
          <input
            type="text"
            placeholder="Filtruj po tytule, marce..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 text-slate-100 text-xs rounded-xl pl-9 pr-4 py-2.5 border border-slate-700 focus:border-amber-400 focus:outline-none placeholder:text-slate-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>
      </div>

      {/* Category selector */}
      <CategoryNav
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Secondary filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        {/* Toggle VIP only */}
        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300 hover:text-white select-none">
          <input
            type="checkbox"
            checked={vipOnlyFilter}
            onChange={(e) => setVipOnlyFilter(e.target.checked)}
            className="w-4 h-4 rounded text-amber-500 bg-slate-800 border-slate-700 focus:ring-amber-400 rounded-md"
          />
          <span>Tylko okazje VIP / Błędy cenowe 👑</span>
        </label>

        {/* Sort */}
        <div className="flex items-center gap-2 text-xs">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <span className="text-slate-400 hidden sm:inline">Sortuj według:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-amber-400"
          >
            <option value="hot">🔥 Najgorętsze (°C)</option>
            <option value="newest">⏱ Najnowsze</option>
            <option value="discount">💥 Największy rabat %</option>
            <option value="price-asc">💰 Cena: najniższa</option>
          </select>
        </div>
      </div>

      {/* Deals list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDeals.map((deal) => (
          <DealCard key={deal.id} deal={deal} />
        ))}
      </div>

      {filteredDeals.length === 0 && (
        <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800 p-8">
          <Sparkles className="w-10 h-10 text-amber-400 mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-bold text-white mb-1">
            Brak ofert spełniających podane kryteria
          </h3>
          <p className="text-xs text-slate-400 mb-6 max-w-sm mx-auto">
            Spróbuj zmienić kategorię, wyczyścić wyszukiwarkę lub odznaczyć filtr VIP.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('wszystkie');
              setSearchQuery('');
              setVipOnlyFilter(false);
            }}
            className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition"
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
    <Suspense fallback={<div className="text-center py-20 text-slate-400 text-sm">Ładowanie okazji Szwagra...</div>}>
      <DealsContent />
    </Suspense>
  );
}
