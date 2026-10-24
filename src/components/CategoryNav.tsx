'use client';

import React from 'react';
import { CATEGORIES } from '@/data/mock-deals';
import { Flame, Wrench, Car, Home, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, any> = {
  Flame,
  Wrench,
  Car,
  Home,
  Zap,
};

interface CategoryNavProps {
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
}

export function CategoryNav({ selectedCategory, onSelectCategory }: CategoryNavProps) {
  return (
    <div className="flex items-center gap-2.5 overflow-x-auto pb-3 pt-1 scrollbar-none">
      {CATEGORIES.map((cat) => {
        const IconComponent = ICON_MAP[cat.icon] || Flame;
        const isSelected = selectedCategory === cat.id;

        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={cn(
              'flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-extrabold whitespace-nowrap transition-all duration-200 border',
              isSelected
                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-lg shadow-amber-500/25 scale-[1.02]'
                : 'bg-slate-900 text-slate-200 border-slate-700/80 hover:border-slate-500 hover:text-white hover:bg-slate-800'
            )}
          >
            <IconComponent className={cn('w-4 h-4 sm:w-5 sm:h-5', isSelected ? 'text-slate-950' : 'text-amber-400')} />
            <span>{cat.name}</span>
            {cat.count && (
              <span
                className={cn(
                  'px-2 py-0.5 rounded-lg text-xs font-black',
                  isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-300'
                )}
              >
                {cat.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
