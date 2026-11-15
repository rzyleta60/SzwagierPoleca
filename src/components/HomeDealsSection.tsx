'use client';

import React, { useState, useMemo } from 'react';
import { DealCard } from '@/components/DealCard';
import { CategoryNav } from '@/components/CategoryNav';
import { MOCK_DEALS } from '@/data/mock-deals';
import { SlidersHorizontal } from 'lucide-react';

export function HomeDealsSection() {
  const [selectedCategory, setSelectedCategory] = useState('wszystkie');
  const [sortBy, setSortBy] = useState<'hot' | 'newest' | 'price-asc'>('hot');

  const filteredDeals = useMemo(() => {
    let deals = [...MOCK_DEALS];

    if (selectedCategory !== 'wszystkie') {
      deals = deals.filter((d) => 
        d.category_id === selectedCategory || 
        d.category_ids?.includes(selectedCategory)
      );
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
    <div className="space-y-8">
      {/* Category Nav & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <CategoryNav
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Sort selector */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
          <SlidersHorizontal className="w-5 h-5 text-slate-300" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-900 border border-slate-700 text-sm font-bold text-slate-100 rounded-xl px-4 py-2.5 focus:outline-none focus:border-amber-400"
          >
            <option value="hot">🔥 Najgorętsze (°C)</option>
            <option value="newest">⏱ Najnowsze</option>
            <option value="price-asc">💰 Cena: od najniższej</option>
          </select>
        </div>
      </div>

      {/* Deals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredDeals.map((deal) => (
          <DealCard key={deal.id} deal={deal} />
        ))}
      </div>

      {filteredDeals.length === 0 && (
        <div className="text-center py-20 bg-slate-900/60 rounded-3xl border border-slate-800">
          <p className="text-slate-300 text-base font-semibold">
            Szwagier chwilowo nie ma w tej kategorii nowych okazji.
          </p>
          <button
            onClick={() => setSelectedCategory('wszystkie')}
            className="mt-4 text-sm font-bold text-amber-400 hover:underline"
          >
            Wróć do wszystkich okazji
          </button>
        </div>
      )}
    </div>
  );
}
