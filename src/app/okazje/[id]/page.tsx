'use client';

import React, { useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { MOCK_DEALS, MOCK_COMMENTS } from '@/data/mock-deals';
import { Comment } from '@/types';
import { DealBadge } from '@/components/Badge';
import { VoteButtons } from '@/components/VoteButtons';
import { formatPrice } from '@/lib/utils';
import { 
  ExternalLink, 
  Copy, 
  Check, 
  ThumbsUp, 
  ThumbsDown, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Store, 
  Clock, 
  Share2, 
  ArrowLeft, 
  MessageSquare,
  ShieldCheck,
  Send,
  Lock
} from 'lucide-react';

export default function DealDetailPage() {
  const params = useParams();
  const slugOrId = params.id as string;

  const deal = MOCK_DEALS.find((d) => d.slug === slugOrId || d.id === slugOrId);

  const [copied, setCopied] = useState(false);
  const [comments, setComments] = useState<Comment[]>(
    MOCK_COMMENTS.filter((c) => c.deal_id === deal?.id || c.deal_id === '1')
  );
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  if (!deal) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-black text-white mb-2">Okazja nie została znaleziona</h2>
        <p className="text-slate-400 text-sm mb-6">Prawdopodobnie wygasła lub została usunięta.</p>
        <Link href="/okazje" className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs">
          Wróć do listy okazji
        </Link>
      </div>
    );
  }

  const handleCopyCoupon = () => {
    if (deal.coupon_code) {
      navigator.clipboard.writeText(deal.coupon_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    const addedComment = {
      id: `c_${Date.now()}`,
      deal_id: deal.id,
      user_id: 'local_user',
      username: authorName.trim() || 'Majster_Anonim',
      is_vip: false,
      content: newComment.trim(),
      created_at: new Date().toISOString(),
    };

    setTimeout(() => {
      setComments([addedComment, ...comments]);
      setNewComment('');
      setIsSubmittingComment(false);
    }, 400);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-amber-400 transition-colors">Główna</Link>
        <span>/</span>
        <Link href="/okazje" className="hover:text-amber-400 transition-colors">Okazje</Link>
        <span>/</span>
        <span className="text-slate-200 truncate">{deal.title}</span>
      </nav>

      {/* Main product box */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8">
          {/* Left Column: Image */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
              <Image
                src={deal.image_url}
                alt={deal.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 500px"
                className="object-cover"
              />
              <div className="absolute top-3 left-3">
                <DealBadge type={deal.badge} />
              </div>
              {deal.discount_percent && deal.discount_percent > 0 ? (
                <div className="absolute bottom-3 left-3 bg-rose-600 text-white font-black text-sm px-3 py-1 rounded-xl shadow-lg">
                  -{deal.discount_percent}%
                </div>
              ) : null}
            </div>

            {/* Voting Bar in detail */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400 font-semibold">Temperatura okazji:</span>
              <VoteButtons
                dealId={deal.id}
                initialTemperature={deal.temperature}
                initialUpvotes={deal.upvotes}
                initialDownvotes={deal.downvotes}
              />
            </div>
          </div>

          {/* Right Column: Pricing & Action */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div>
              {/* Store & Date */}
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="inline-flex items-center gap-1 font-semibold text-slate-300">
                  <Store className="w-3.5 h-3.5 text-amber-400" />
                  Sklep: <strong>{deal.store_name}</strong>
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Wrzuta Szwagra: {new Date(deal.created_at).toLocaleDateString('pl-PL')}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl font-black text-white leading-snug">
                {deal.title}
              </h1>

              {/* Price card */}
              <div className="mt-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400 font-semibold">Cena w tej okazji:</div>
                  <div className="text-3xl font-black text-amber-400 tracking-tight">
                    {formatPrice(deal.deal_price)}
                  </div>
                  {deal.original_price && deal.original_price > deal.deal_price && (
                    <div className="text-xs text-slate-500 line-through">
                      Cena regularna: {formatPrice(deal.original_price)}
                    </div>
                  )}
                </div>

                {deal.original_price && deal.original_price > deal.deal_price && (
                  <div className="text-right">
                    <span className="text-xs text-emerald-400 font-bold block">
                      Zaoszczędzisz: {formatPrice(deal.original_price - deal.deal_price)}
                    </span>
                    <span className="text-[11px] text-slate-400">w Twojej kieszeni</span>
                  </div>
                )}
              </div>

              {/* Coupon block */}
              {deal.coupon_code && (
                <div className="mt-4 p-3 rounded-2xl bg-amber-500/10 border border-dashed border-amber-500/40 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-xs text-slate-300 block">Wpisz kod w koszyku:</span>
                    <span className="font-mono text-base font-black text-amber-400">
                      {deal.coupon_code}
                    </span>
                  </div>
                  <button
                    onClick={handleCopyCoupon}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-slate-950" />
                        <span>Skopiowano!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Kopiuj kod</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Direct CTA button to store */}
            <div className="space-y-3">
              <a
                href={deal.deal_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-base flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 transition-all hover:scale-[1.01]"
              >
                <span>Przejdź do oferty w sklepie ({deal.store_name})</span>
                <ExternalLink className="w-5 h-5" />
              </a>

              <p className="text-[11px] text-slate-500 text-center">
                Link przekierowuje bezpośrednio do sprawdzonego sprzedawcy.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Szwagier In-Depth Review Section */}
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white">
              Opinia i test z warsztatu Szwagra
            </h2>
            <p className="text-xs text-slate-400">
              Szczera ocena bez marketingu – co ten sprzęt potrafi, a czego nie dotykać
            </p>
          </div>
        </div>

        {/* Verdict callout */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-amber-500/30 relative">
          <div className="text-xs font-black uppercase tracking-wider text-amber-400 mb-2">
            Werdykt Szwagra:
          </div>
          <p className="text-sm sm:text-base text-slate-200 italic leading-relaxed">
            &ldquo;{deal.szwagier_verdict}&rdquo;
          </p>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-sm font-bold text-slate-200 mb-2">Opis i specyfika sprzętu</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            {deal.description}
          </p>
        </div>

        {/* Pros & Cons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {/* Pros */}
          <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-800/40">
            <h4 className="text-sm font-black text-emerald-400 flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Co Szwagier chwali (Zalety):
            </h4>
            <ul className="space-y-2">
              {deal.pros.map((pro, index) => (
                <li key={index} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Cons */}
          <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-800/40">
            <h4 className="text-sm font-black text-rose-400 flex items-center gap-2 mb-3">
              <XCircle className="w-4 h-4 text-rose-400" />
              Do czego Szwagier się przyczepi (Minusy):
            </h4>
            <ul className="space-y-2">
              {deal.cons.map((con, index) => (
                <li key={index} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Community Comments & Discussion Section */}
      <section id="komentarze" className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-black text-white">
              Komentarze i opinie użytkowników ({comments.length})
            </h3>
          </div>
        </div>

        {/* Comment form */}
        <form onSubmit={handleAddComment} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Twój pseudonim (np. Zdzichu_Warsztat)"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400"
            />
          </div>

          <textarea
            rows={3}
            placeholder="Napisz, co sądzisz o tym sprzęcie... Masz go w garażu? Sprawdza się?"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:outline-none focus:border-amber-400 resize-none"
            required
          />

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              Komentarze są moderowane pod kątem kultury i spamu.
            </span>
            <button
              type="submit"
              disabled={isSubmittingComment}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Dodaj komentarz</span>
            </button>
          </div>
        </form>

        {/* List of comments */}
        <div className="space-y-4 pt-2">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-200">{comment.username}</span>
                  {comment.is_vip && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-black border border-amber-500/30">
                      Złoty Szwagier VIP 👑
                    </span>
                  )}
                </div>
                <span className="text-slate-500 text-[11px]">
                  {new Date(comment.created_at).toLocaleDateString('pl-PL')}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{comment.content}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
