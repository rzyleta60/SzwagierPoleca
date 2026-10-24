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
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      {CATEGORIES.map((cat) => {
        const IconComponent = ICON_MAP[cat.icon] || Flame;
        const isSelected = selectedCategory === cat.id;

        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 border',
              isSelected
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/25 scale-[1.02]'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
            )}
          >
            <IconComponent className={cn('w-4 h-4', isSelected ? 'text-slate-950' : 'text-amber-400')} />
            <span>{cat.name}</span>
            {cat.count && (
              <span
                className={cn(
                  'px-1.5 py-0.5 rounded-md text-[10px] font-black',
                  isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
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
