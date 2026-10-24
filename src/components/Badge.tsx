import React from 'react';
import { BadgeType } from '@/types';
import { Flame, ShieldCheck, Sparkles, AlertTriangle, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  type: BadgeType;
  className?: string;
}

export function DealBadge({ type, className }: BadgeProps) {
  switch (type) {
    case 'POLECENIE_SZWAGRA':
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-extrabold bg-amber-400 text-slate-950 shadow-md', className)}>
          <Trophy className="w-4 h-4 text-slate-950 shrink-0" />
          Atest Szwagra 🏆
        </span>
      );
    case 'CEBULA_DEAL':
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-extrabold bg-emerald-500 text-slate-950 shadow-md', className)}>
          <Sparkles className="w-4 h-4 text-slate-950 shrink-0" />
          Cebula Deal 🧅
        </span>
      );
    case 'WOL_ROBOCZY':
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-extrabold bg-slate-800 text-amber-300 border border-slate-600 shadow-md', className)}>
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
          Wół Roboczy 🔨
        </span>
      );
    case 'BLAD_CENOWY':
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-extrabold bg-rose-600 text-white animate-pulse shadow-md', className)}>
          <AlertTriangle className="w-4 h-4 text-white shrink-0" />
          Błąd Cenowy ⚡
        </span>
      );
    case 'HIT_DNIA':
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-extrabold bg-orange-500 text-slate-950 shadow-md', className)}>
          <Flame className="w-4 h-4 text-slate-950 shrink-0" />
          Hit Dnia 🔥
        </span>
      );
    default:
      return null;
  }
}
