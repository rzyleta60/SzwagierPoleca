'use client';

import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoteButtonsProps {
  dealId: string;
  initialTemperature: number;
  initialUpvotes: number;
  initialDownvotes: number;
}

export function VoteButtons({
  dealId,
  initialTemperature,
  initialUpvotes,
  initialDownvotes,
}: VoteButtonsProps) {
  const [temperature, setTemperature] = useState(initialTemperature);
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVote = async (type: 'up' | 'down', e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSubmitting) return;

    // Optimistic update
    if (userVote === type) {
      // Unvote
      setUserVote(null);
      if (type === 'up') {
        setUpvotes((prev) => prev - 1);
        setTemperature((prev) => prev - 5);
      } else {
        setDownvotes((prev) => prev - 1);
        setTemperature((prev) => prev + 5);
      }
    } else {
      // New vote or switch
      const prevVote = userVote;
      setUserVote(type);

      if (type === 'up') {
        setUpvotes((prev) => prev + 1);
        setTemperature((prev) => prev + (prevVote === 'down' ? 10 : 5));
        if (prevVote === 'down') setDownvotes((prev) => prev - 1);
      } else {
        setDownvotes((prev) => prev + 1);
        setTemperature((prev) => prev - (prevVote === 'up' ? 10 : 5));
        if (prevVote === 'up') setUpvotes((prev) => prev - 1);
      }
    }

    try {
      setIsSubmitting(true);
      await fetch('/api/deals/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealId, voteType: userVote === type ? null : type }),
      });
    } catch (err) {
      console.warn('Vote submission:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-sm p-1 rounded-xl border border-slate-700/60 shadow-inner">
      <button
        onClick={(e) => handleVote('up', e)}
        title="Warto! Polecam Szwagrowi"
        className={cn(
          'flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all',
          userVote === 'up'
            ? 'bg-emerald-600 text-white shadow'
            : 'text-slate-300 hover:text-emerald-400 hover:bg-slate-800'
        )}
      >
        <ThumbsUp className="w-3.5 h-3.5" />
        <span>{upvotes}</span>
      </button>

      {/* Temperatura */}
      <div className="flex items-center gap-1 px-2 text-xs font-extrabold tracking-tight text-amber-400">
        <Flame className={cn('w-4 h-4', temperature > 300 ? 'text-rose-500 animate-pulse' : 'text-amber-400')} />
        <span>{temperature}°C</span>
      </div>

      <button
        onClick={(e) => handleVote('down', e)}
        title="Słabe! Nie warto"
        className={cn(
          'flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all',
          userVote === 'down'
            ? 'bg-rose-600 text-white shadow'
            : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
        )}
      >
        <ThumbsDown className="w-3.5 h-3.5" />
        <span>{downvotes}</span>
      </button>
    </div>
  );
}
