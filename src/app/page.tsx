import React from 'react';
import { HeroBanner } from '@/components/HeroBanner';
import { HomeDealsSection } from '@/components/HomeDealsSection';
import { VipPromoBanner } from '@/components/VipPromoBanner';
import { SzwagierRules } from '@/components/SzwagierRules';
import { MOCK_COMMENTS } from '@/data/mock-deals';
import { MessageSquare, Flame, Sparkles, Trophy } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="space-y-4">
      {/* Hero with stats */}
      <HeroBanner />

      {/* Main deals section with live categories filter */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Gorące Rekomendacje Szwagra
              </h2>
              <p className="text-xs text-slate-400">
                Wyselekcjonowane oferty, które warto kupić bez zastanowienia
              </p>
            </div>
          </div>

          <Link
            href="/okazje"
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 group"
          >
            <span>Zobacz wszystkie</span>
            <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
          </Link>
        </div>

        <HomeDealsSection />
      </section>

      {/* VIP Stripe Banner */}
      <VipPromoBanner />

      {/* Trust & Principles */}
      <SzwagierRules />

      {/* Recent community comments */}
      <section className="my-14 p-6 sm:p-8 rounded-3xl bg-slate-900/40 border border-slate-800">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-black text-white">Głosy z warsztatu i garażu</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MOCK_COMMENTS.map((comment) => (
            <div
              key={comment.id}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800/80 flex flex-col justify-between"
            >
              <p className="text-xs text-slate-300 italic mb-4 leading-relaxed">
                &ldquo;{comment.content}&rdquo;
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800">
                <span className="font-bold text-slate-400 flex items-center gap-1">
                  {comment.username}
                  {comment.is_vip && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-extrabold">
                      VIP
                    </span>
                  )}
                </span>
                <span>Zweryfikowany użytkownik</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
