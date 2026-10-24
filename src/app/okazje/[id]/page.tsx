'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
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
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Store, 
  Clock, 
  MessageSquare,
  Send,
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
      <div className="text-center py-24">
        <h2 className="text-3xl font-black text-white mb-3">Okazja nie została znaleziona</h2>
        <p className="text-slate-300 text-base mb-8">Prawdopodobnie wygasła lub została usunięta.</p>
        <Link href="/okazje" className="px-6 py-3 rounded-xl bg-amber-500 text-slate-950 font-black text-sm">
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
    const addedComment: Comment = {
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
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-300 font-medium">
        <Link href="/" className="hover:text-amber-400 transition-colors">Główna</Link>
        <span>/</span>
        <Link href="/okazje" className="hover:text-amber-400 transition-colors">Okazje</Link>
        <span>/</span>
        <span className="text-slate-100 font-semibold truncate">{deal.title}</span>
      </nav>

      {/* Main product box */}
      <div className="bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-10">
          {/* Left Column: Image */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-700">
              <Image
                src={deal.image_url}
                alt={deal.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 500px"
                className="object-cover"
              />
              <div className="absolute top-4 left-4">
                <DealBadge type={deal.badge} />
              </div>
              {deal.discount_percent && deal.discount_percent > 0 ? (
                <div className="absolute bottom-4 left-4 bg-rose-600 text-white font-black text-base px-3.5 py-1.5 rounded-xl shadow-lg">
                  -{deal.discount_percent}%
                </div>
              ) : null}
            </div>

            {/* Voting Bar in detail */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-700">
              <span className="text-sm text-slate-200 font-bold">Temperatura okazji:</span>
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
              <div className="flex items-center justify-between text-sm text-slate-300 mb-3 font-medium">
                <span className="inline-flex items-center gap-2 text-slate-200 font-bold">
                  <Store className="w-4 h-4 text-amber-400" />
                  Sklep: <strong className="text-white">{deal.store_name}</strong>
                </span>
                <span className="inline-flex items-center gap-1.5 text-slate-400">
                  <Clock className="w-4 h-4" />
                  Wrzuta Szwagra: {new Date(deal.created_at).toLocaleDateString('pl-PL')}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-snug">
                {deal.title}
              </h1>

              {/* Price card */}
              <div className="mt-5 p-5 rounded-2xl bg-slate-950 border border-slate-700 flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-300 font-bold">Cena w tej okazji:</div>
                  <div className="text-3xl sm:text-4xl font-black text-amber-400 tracking-tight">
                    {formatPrice(deal.deal_price)}
                  </div>
                  {deal.original_price && deal.original_price > deal.deal_price && (
                    <div className="text-sm text-slate-400 line-through font-medium">
                      Cena regularna: {formatPrice(deal.original_price)}
                    </div>
                  )}
                </div>

                {deal.original_price && deal.original_price > deal.deal_price && (
                  <div className="text-right">
                    <span className="text-sm sm:text-base text-emerald-400 font-black block">
                      Zaoszczędzisz: {formatPrice(deal.original_price - deal.deal_price)}
                    </span>
                    <span className="text-xs sm:text-sm text-slate-300 font-medium">zostaje w Twojej kieszeni</span>
                  </div>
                )}
              </div>

              {/* Coupon block */}
              {deal.coupon_code && (
                <div className="mt-5 p-4 rounded-2xl bg-amber-500/10 border border-dashed border-amber-500/50 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-sm text-slate-200 font-medium block">Wpisz kod w koszyku:</span>
                    <span className="font-mono text-lg font-black text-amber-400">
                      {deal.coupon_code}
                    </span>
                  </div>
                  <button
                    onClick={handleCopyCoupon}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm transition"
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
            <div className="space-y-3 pt-2">
              <a
                href={deal.deal_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-base flex items-center justify-center gap-2.5 shadow-xl shadow-amber-500/25 transition-all hover:scale-[1.01]"
              >
                <span>Przejdź do oferty w sklepie ({deal.store_name})</span>
                <ExternalLink className="w-5 h-5" />
              </a>

              <p className="text-xs sm:text-sm text-slate-400 text-center font-medium">
                Link przekierowuje bezpośrednio do sprawdzonego sprzedawcy.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Szwagier In-Depth Review Section */}
      <section className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-10 space-y-8 shadow-xl">
        <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
          <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Opinia i test z warsztatu Szwagra
            </h2>
            <p className="text-sm text-slate-300 font-medium">
              Szczera ocena bez marketingu – co ten sprzęt potrafi, a czego nie dotykać
            </p>
          </div>
        </div>

        {/* Verdict callout */}
        <div className="p-6 rounded-2xl bg-slate-950 border border-amber-500/40 relative">
          <div className="text-sm font-black uppercase tracking-wider text-amber-400 mb-3">
            Werdykt Szwagra:
          </div>
          <p className="text-base sm:text-lg text-slate-100 italic leading-relaxed font-medium">
            &ldquo;{deal.szwagier_verdict}&rdquo;
          </p>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-base sm:text-lg font-extrabold text-white mb-3">Opis i specyfika sprzętu</h3>
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
            {deal.description}
          </p>
        </div>

        {/* Pros & Cons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
          {/* Pros */}
          <div className="p-6 rounded-2xl bg-emerald-950/30 border border-emerald-700/50">
            <h4 className="text-base font-black text-emerald-400 flex items-center gap-2.5 mb-4">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Co Szwagier chwali (Zalety):
            </h4>
            <ul className="space-y-3">
              {deal.pros.map((pro, index) => (
                <li key={index} className="text-sm sm:text-base text-slate-200 flex items-start gap-2.5 font-medium">
                  <span className="text-emerald-400 font-black">•</span>
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Cons */}
          <div className="p-6 rounded-2xl bg-rose-950/30 border border-rose-700/50">
            <h4 className="text-base font-black text-rose-400 flex items-center gap-2.5 mb-4">
              <XCircle className="w-5 h-5 text-rose-400" />
              Do czego Szwagier się przyczepi (Minusy):
            </h4>
            <ul className="space-y-3">
              {deal.cons.map((con, index) => (
                <li key={index} className="text-sm sm:text-base text-slate-200 flex items-start gap-2.5 font-medium">
                  <span className="text-rose-400 font-black">•</span>
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Community Comments Section */}
      <section id="komentarze" className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-10 space-y-8 shadow-xl">
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-amber-400" />
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Komentarze i opinie użytkowników ({comments.length})
            </h3>
          </div>
        </div>

        {/* Comment form */}
        <form onSubmit={handleAddComment} className="p-6 rounded-2xl bg-slate-950 border border-slate-700 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Twój pseudonim (np. Zdzichu_Warsztat)"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-100 text-sm font-medium rounded-xl px-4 py-2.5 focus:outline-none focus:border-amber-400 placeholder:text-slate-500"
            />
          </div>

          <textarea
            rows={3}
            placeholder="Napisz, co sądzisz o tym sprzęcie... Masz go w garażu? Sprawdza się?"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-sm font-medium rounded-xl p-4 focus:outline-none focus:border-amber-400 resize-none placeholder:text-slate-500"
            required
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs sm:text-sm text-slate-400 font-medium">
              Komentarze są moderowane pod kątem kultury i spamu.
            </span>
            <button
              type="submit"
              disabled={isSubmittingComment}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition"
            >
              <Send className="w-4 h-4" />
              <span>Dodaj komentarz</span>
            </button>
          </div>
        </form>

        {/* List of comments */}
        <div className="space-y-4 pt-2">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5"
            >
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2.5">
                  <span className="font-extrabold text-white">{comment.username}</span>
                  {comment.is_vip && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-black border border-amber-500/40">
                      Złoty Szwagier VIP 👑
                    </span>
                  )}
                </div>
                <span className="text-slate-400 text-xs sm:text-sm font-medium">
                  {new Date(comment.created_at).toLocaleDateString('pl-PL')}
                </span>
              </div>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">{comment.content}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
