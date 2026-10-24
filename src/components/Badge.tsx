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
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-slate-950 shadow-sm', className)}>
          <Trophy className="w-3.5 h-3.5 text-slate-950" />
          Atest Szwagra 🏆
        </span>
      );
    case 'CEBULA_DEAL':
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-sm', className)}>
          <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
          Cebula Deal 🧅
        </span>
      );
    case 'WOL_ROBOCZY':
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-800 text-amber-400 border border-slate-700 shadow-sm', className)}>
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          Wół Roboczy 🔨
        </span>
      );
    case 'BLAD_CENOWY':
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-600 text-white animate-pulse shadow-sm', className)}>
          <AlertTriangle className="w-3.5 h-3.5 text-white" />
          Błąd Cenowy ⚡
        </span>
      );
    case 'HIT_DNIA':
      return (
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-600 text-white shadow-sm', className)}>
          <Flame className="w-3.5 h-3.5 text-yellow-300" />
          Hit Dnia 🔥
        </span>
      );
    default:
      return null;
  }
}
