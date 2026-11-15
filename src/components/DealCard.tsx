'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Deal } from '@/types';
import { DealBadge } from './Badge';
import { VoteButtons } from './VoteButtons';
import { formatPrice } from '@/lib/utils';
import { ExternalLink, Copy, Check, MessageSquare, Lock, Sparkles, Store, Crown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface DealCardProps {
  deal: Deal;
}

export function DealCard({ deal }: DealCardProps) {
  const { isVip } = useAuth();
  const [copied, setCopied] = useState(false);
  const isLockedForUser = deal.is_vip_only && !isVip;

  const copyCoupon = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (deal.coupon_code) {
      navigator.clipboard.writeText(deal.coupon_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <article className="group relative flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl overflow-hidden hover:border-amber-400 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300">
      {/* Top Banner on image */}
      <div className="relative h-56 w-full bg-slate-950 overflow-hidden">
        <Image
          src={deal.image_url}
          alt={deal.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-95 group-hover:opacity-100"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-black/70" />

        {/* VIP Lock watermark overlay if user is not VIP */}
        {isLockedForUser && (
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1.5px] flex items-center justify-center p-4">
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-950/90 border border-amber-400/60 shadow-xl flex items-center gap-2 text-amber-300 font-extrabold text-xs uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Dostępne w Klubie VIP 👑</span>
            </div>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
          <DealBadge type={deal.badge} />
          {deal.is_vip_only ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md">
              <Lock className="w-3.5 h-3.5" />
              TYLKO VIP 👑
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold bg-slate-950/80 backdrop-blur-md text-slate-200 border border-slate-700">
              <Store className="w-3.5 h-3.5 text-amber-400" />
              {deal.store_name}
            </span>
          )}
        </div>

        {/* Discount Tag */}
        {deal.discount_percent && deal.discount_percent > 0 ? (
          <div className="absolute bottom-3 left-3 bg-rose-600 text-white font-black text-sm px-3 py-1 rounded-xl shadow-lg z-10">
            -{deal.discount_percent}%
          </div>
        ) : null}

        {/* Comments count */}
        <Link
          href={`/okazje/${deal.slug}#komentarze`}
          className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs sm:text-sm font-bold bg-slate-950/90 backdrop-blur-md text-slate-200 hover:text-white border border-slate-700 hover:border-amber-400 transition-colors z-10"
        >
          <MessageSquare className="w-4 h-4 text-amber-400" />
          <span>{deal.comments_count || 0}</span>
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-6 space-y-4">
        {/* Title */}
        <h3 className="text-lg sm:text-xl font-extrabold text-white line-clamp-2 group-hover:text-amber-400 transition-colors leading-snug">
          <Link href={`/okazje/${deal.slug}`}>{deal.title}</Link>
        </h3>

        {/* Szwagier Verdict Callout */}
        <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-700 relative">
          <div className="flex items-center gap-2 text-amber-400 text-xs sm:text-sm font-black uppercase tracking-wider mb-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Werdykt Szwagra:
          </div>
          <p className="text-sm text-slate-200 italic line-clamp-3 leading-relaxed">
            &ldquo;{deal.szwagier_verdict}&rdquo;
          </p>
        </div>

        {/* Coupon Code Section */}
        {deal.coupon_code && (
          isLockedForUser ? (
            <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-amber-500/10 border border-dashed border-amber-500/40 rounded-xl">
              <span className="text-xs sm:text-sm font-semibold text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Kod rabatowy:</span>
                <span className="font-mono text-amber-400/60 blur-[3px] select-none tracking-widest">••••••••</span>
              </span>
              <Link
                href="/vip"
                className="flex items-center gap-1 text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-300 px-3 py-1.5 rounded-lg transition shadow-sm"
              >
                <span>Odblokuj</span>
                <Crown className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 px-4 py-2 bg-amber-500/10 border border-dashed border-amber-500/50 rounded-xl">
              <span className="text-sm font-semibold text-slate-200">
                Kod rabatowy: <strong className="font-mono text-amber-400 text-base font-black">{deal.coupon_code}</strong>
              </span>
              <button
                onClick={copyCoupon}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 px-3 py-1 rounded-lg transition"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-800" />
                    <span>Skopiowano</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Kopiuj</span>
                  </>
                )}
              </button>
            </div>
          )
        )}

        {/* Prices and Voting bar */}
        <div className="mt-auto pt-4 flex items-end justify-between gap-3 border-t border-slate-800">
          <div>
            {deal.original_price && deal.original_price > deal.deal_price && (
              <span className="block text-sm line-through text-slate-400 font-medium">
                {formatPrice(deal.original_price)}
              </span>
            )}
            <div className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight">
              {formatPrice(deal.deal_price)}
            </div>
            {deal.lowest_price_30_days && (
              <span className="block text-[11px] text-slate-400 font-medium mt-0.5">
                Najniższa z 30 dni: <strong className="text-slate-200 font-bold">{formatPrice(deal.lowest_price_30_days)}</strong>
              </span>
            )}
          </div>

          <VoteButtons
            dealId={deal.id}
            initialTemperature={deal.temperature}
            initialUpvotes={deal.upvotes}
            initialDownvotes={deal.downvotes}
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex gap-3">
          <Link
            href={`/okazje/${deal.slug}`}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 hover:text-white text-sm font-bold text-center transition-colors border border-slate-700"
          >
            Opinia i test
          </Link>
          {isLockedForUser ? (
            <Link
              href="/vip"
              className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 text-sm font-black transition-all shadow-lg shadow-amber-500/20 hover:scale-[1.02]"
            >
              <Crown className="w-4 h-4 text-slate-950" />
              <span>Odblokuj w VIP</span>
            </Link>
          ) : (
            <a
              href={deal.deal_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-black transition-colors shadow-lg shadow-amber-500/20"
            >
              <span>Do sklepu</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
