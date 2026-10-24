'use client';

import React, { useState, useMemo } from 'react';
import { DealCard } from '@/components/DealCard';
import { CategoryNav } from '@/components/CategoryNav';
import { MOCK_DEALS } from '@/data/mock-deals';
import { Flame, Sparkles, Filter, SlidersHorizontal } from 'lucide-react';

export function HomeDealsSection() {
  const [selectedCategory, setSelectedCategory] = useState('wszystkie');
  const [sortBy, setSortBy] = useState<'hot' | 'newest' | 'price-asc'>('hot');

  const filteredDeals = useMemo(() => {
    let deals = [...MOCK_DEALS];

    if (selectedCategory !== 'wszystkie') {
      deals = deals.filter((d) => d.category_id === selectedCategory);
    }

    if (sortBy === 'hot') {
      deals.sort((a, b) => b.temperature - a.temperature);
    } else if (sortBy === 'newest') {
      deals.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === 'price-asc') {
      deals.sort((a, b) => a.deal_price - b.deal_price);
    }

    return deals;
  }, [selectedCategory, sortBy]);

  return (
    <div className="space-y-6">
      {/* Category Nav & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <CategoryNav
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Sort selector */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400"
          >
            <option value="hot">🔥 Najgorętsze (°C)</option>
            <option value="newest">⏱ Najnowsze</option>
            <option value="price-asc">💰 Cena: od najniższej</option>
          </select>
        </div>
      </div>

      {/* Deals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDeals.map((deal) => (
          <DealCard key={deal.id} deal={deal} />
        ))}
      </div>

      {filteredDeals.length === 0 && (
        <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800">
          <p className="text-slate-400 text-sm font-medium">
            Szwagier chwilowo nie ma w tej kategorii nowych okazji.
          </p>
          <button
            onClick={() => setSelectedCategory('wszystkie')}
            className="mt-3 text-xs font-bold text-amber-400 hover:underline"
          >
            Wróć do wszystkich okazji
          </button>
        </div>
      )}
    </div>
  );
}
