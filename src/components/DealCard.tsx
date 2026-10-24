'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Deal } from '@/types';
import { DealBadge } from './Badge';
import { VoteButtons } from './VoteButtons';
import { formatPrice } from '@/lib/utils';
import { ExternalLink, Copy, Check, MessageSquare, Lock, Sparkles, Store } from 'lucide-react';

interface DealCardProps {
  deal: Deal;
}

export function DealCard({ deal }: DealCardProps) {
  const [copied, setCopied] = useState(false);

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
    <article className="group relative flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300">
      {/* Top Banner on image */}
      <div className="relative h-52 w-full bg-slate-950 overflow-hidden">
        <Image
          src={deal.image_url}
          alt={deal.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/60" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <DealBadge type={deal.badge} />
          {deal.is_vip_only ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-amber-400 text-slate-950 shadow-md">
              <Lock className="w-3 h-3" />
              TYLKO VIP
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-black/60 backdrop-blur-md text-slate-300 border border-white/10">
              <Store className="w-3 h-3 text-amber-400" />
              {deal.store_name}
            </span>
          )}
        </div>

        {/* Discount Tag */}
        {deal.discount_percent && deal.discount_percent > 0 ? (
          <div className="absolute bottom-3 left-3 bg-rose-600 text-white font-extrabold text-xs px-2.5 py-1 rounded-lg shadow-lg">
            -{deal.discount_percent}%
          </div>
        ) : null}

        {/* Comments count */}
        <Link
          href={`/okazje/${deal.slug}#komentarze`}
          className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-900/80 backdrop-blur-md text-slate-300 hover:text-white border border-slate-700/50"
        >
          <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
          <span>{deal.comments_count || 0}</span>
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-5">
        {/* Title */}
        <h3 className="text-base font-bold text-white line-clamp-2 group-hover:text-amber-400 transition-colors">
          <Link href={`/okazje/${deal.slug}`}>{deal.title}</Link>
        </h3>

        {/* Szwagier Verdict Callout */}
        <div className="mt-3 p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 relative">
          <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            Werdykt Szwagra:
          </div>
          <p className="text-xs text-slate-300 italic line-clamp-3 leading-relaxed">
            &ldquo;{deal.szwagier_verdict}&rdquo;
          </p>
        </div>

        {/* Coupon Code Section */}
        {deal.coupon_code && (
          <div className="mt-3 flex items-center justify-between gap-2 px-3 py-1.5 bg-amber-500/10 border border-dashed border-amber-500/40 rounded-xl">
            <span className="text-xs font-medium text-amber-300">
              Kod: <strong className="font-mono text-amber-400 font-bold">{deal.coupon_code}</strong>
            </span>
            <button
              onClick={copyCoupon}
              className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 px-2 py-0.5 rounded-lg transition"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Skopiowano</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Kopiuj</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Prices and Voting bar */}
        <div className="mt-auto pt-4 flex items-end justify-between gap-2 border-t border-slate-800">
          <div>
            {deal.original_price && deal.original_price > deal.deal_price && (
              <span className="block text-xs line-through text-slate-500">
                {formatPrice(deal.original_price)}
              </span>
            )}
            <div className="text-xl font-extrabold text-amber-400 tracking-tight">
              {formatPrice(deal.deal_price)}
            </div>
          </div>

          <VoteButtons
            dealId={deal.id}
            initialTemperature={deal.temperature}
            initialUpvotes={deal.upvotes}
            initialDownvotes={deal.downvotes}
          />
        </div>

        {/* Action Button */}
        <div className="mt-4 flex gap-2">
          <Link
            href={`/okazje/${deal.slug}`}
            className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold text-center transition-colors border border-slate-700"
          >
            Opinia i test
          </Link>
          <a
            href={deal.deal_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-colors shadow-lg shadow-amber-500/20"
          >
            <span>Do sklepu</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </article>
  );
}
