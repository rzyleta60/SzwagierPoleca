'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { MOCK_DEALS, MOCK_COMMENTS } from '@/data/mock-deals';
import { Comment, Deal } from '@/types';
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
  Lock,
  Crown,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';

export default function DealDetailPage() {
  const params = useParams();
  const slugOrId = params.id as string;
  const { user, profile, isVip } = useAuth();

  const [deal, setDeal] = useState<Deal | null>(() => {
    return MOCK_DEALS.find((d) => d.slug === slugOrId || d.id === slugOrId) || null;
  });
  const [copied, setCopied] = useState(false);
  const [comments, setComments] = useState<Comment[]>(() => {
    return MOCK_COMMENTS.filter((c) => c.deal_id === deal?.id || c.deal_id === '1');
  });
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState(profile?.username || user?.user_metadata?.username || '');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    // Sprawdź czy okazja istnieje w Supabase (dla nowo dodanych okazji)
    const fetchDeal = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('deals')
          .select('*')
          .or(`slug.eq.${slugOrId},id.eq.${slugOrId}`)
          .single();

        if (data) {
          setDeal((prev) => ({
            ...(prev || {}),
            ...data,
            pros: Array.isArray(data.pros) ? data.pros : (prev?.pros || []),
            cons: Array.isArray(data.cons) ? data.cons : (prev?.cons || []),
          } as Deal));
        }
      } catch (e) {
        // Ignoruj błąd i użyj mock data
      }
    };

    fetchDeal();
  }, [slugOrId]);

  useEffect(() => {
    if (profile?.username) {
      setAuthorName(profile.username);
    }
  }, [profile]);

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

  const isLockedForUser = deal.is_vip_only && !isVip;

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
      user_id: user?.id || 'local_user',
      username: authorName.trim() || profile?.username || 'Majster_Garażowy',
      is_vip: isVip,
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

      {/* VIP Locked Alert Banner for Non-VIP */}
      {isLockedForUser && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/20 via-slate-900 to-amber-500/10 border-2 border-amber-400 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-400 flex items-center justify-center text-slate-950 shrink-0 shadow-lg shadow-amber-400/25">
              <Crown className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded bg-amber-400 text-slate-950 tracking-wider">
                  Oferta Zastrzeżona
                </span>
                <span className="text-xs font-bold text-amber-300">Tylko dla Klubowiczów Szwagra VIP 👑</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                Dostęp do linku i kodu rabatowego wymaga statusu VIP
              </h3>
              <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Ta okazja to wyselekcjonowana perełka lub błąd cenowy. Jako użytkownik darmowego konta widzisz podgląd oferty. Aktywuj abonament VIP, aby natychmiast odblokować link do sklepu, kod zniżkowy oraz dostęp do grupy alertów.
              </p>
            </div>
          </div>
          <Link
            href="/vip"
            className="shrink-0 w-full md:w-auto px-7 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-base text-center shadow-xl shadow-amber-500/30 transition-all hover:scale-105 flex items-center justify-center gap-2"
          >
            <Crown className="w-5 h-5 text-slate-950" />
            <span>Dołącz do VIP (od 19 zł)</span>
          </Link>
        </div>
      )}

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
              <div className="absolute top-4 left-4 z-10">
                <DealBadge type={deal.badge} />
              </div>
              {deal.discount_percent && deal.discount_percent > 0 ? (
                <div className="absolute bottom-4 left-4 bg-rose-600 text-white font-black text-base px-3.5 py-1.5 rounded-xl shadow-lg z-10">
                  -{deal.discount_percent}%
                </div>
              ) : null}

              {isLockedForUser && (
                <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] flex items-center justify-center p-4">
                  <div className="px-4 py-2 rounded-2xl bg-slate-950/90 border border-amber-400/70 shadow-2xl flex items-center gap-2 text-amber-300 font-extrabold text-sm uppercase tracking-wider">
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>Zablokowane w wersji darmowej</span>
                  </div>
                </div>
              )}
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
                  {deal.lowest_price_30_days && (
                    <div className="text-xs text-slate-400 font-medium mt-1">
                      Najniższa z 30 dni (Omnibus): <strong className="text-slate-200">{formatPrice(deal.lowest_price_30_days)}</strong>
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
                isLockedForUser ? (
                  <div className="mt-5 p-5 rounded-2xl bg-amber-500/10 border-2 border-dashed border-amber-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-400/20 flex items-center justify-center text-amber-400 shrink-0">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs text-slate-300 font-bold uppercase tracking-wider block">
                          Kod rabatowy (Zablokowany dla darmowych kont)
                        </span>
                        <span className="font-mono text-xl font-black text-amber-400/60 blur-[5px] select-none tracking-widest">
                          SZWAGIER_VIP_CODE
                        </span>
                      </div>
                    </div>
                    <Link
                      href="/vip"
                      className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm text-center flex items-center justify-center gap-2 shadow-md transition"
                    >
                      <Crown className="w-4 h-4 text-slate-950" />
                      <span>Odblokuj kod w VIP</span>
                    </Link>
                  </div>
                ) : (
                  <div className="mt-5 p-4 rounded-2xl bg-amber-500/10 border border-dashed border-amber-500/50 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-200 font-medium block">Wpisz kod w koszyku:</span>
                        {deal.is_vip_only && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black">
                            ODBLOKOWANO DLA VIP 👑
                          </span>
                        )}
                      </div>
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
                )
              )}
            </div>

            {/* Direct CTA button to store */}
            <div className="space-y-3 pt-2">
              {isLockedForUser ? (
                <div className="space-y-3">
                  <Link
                    href="/vip"
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-base flex items-center justify-center gap-2.5 shadow-xl shadow-amber-500/25 transition-all hover:scale-[1.01]"
                  >
                    <Lock className="w-5 h-5 text-slate-950" />
                    <span>Odblokuj bezpośredni link do oferty w Klubie VIP</span>
                    <Crown className="w-5 h-5 text-slate-950" />
                  </Link>

                  <p className="text-xs sm:text-sm text-slate-400 text-center font-medium">
                    Bezpośrednie linki i kody do okazji VIP są zastrzeżone dla aktywnych członków Klubu Szwagra.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
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
              )}
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

        {/* VIP workshop tip teaser for non-VIP */}
        {isLockedForUser && (
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-amber-400 shrink-0" />
              <p className="text-sm text-slate-200 font-medium">
                🔒 Tajne wskazówki warsztatowe, bezpośredni namiar na hurtownika oraz alerty błędów cenowych na Telegramie są dostępne wyłącznie dla Klubowiczów VIP.
              </p>
            </div>
            <Link
              href="/vip"
              className="text-xs font-black text-amber-400 hover:text-amber-300 uppercase tracking-wider shrink-0 underline"
            >
              Dowiedz się więcej &rarr;
            </Link>
          </div>
        )}

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
