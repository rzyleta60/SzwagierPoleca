import React from 'react';
import { HeroBanner } from '@/components/HeroBanner';
import { HomeDealsSection } from '@/components/HomeDealsSection';
import { VipPromoBanner } from '@/components/VipPromoBanner';
import { SzwagierRules } from '@/components/SzwagierRules';
import { MOCK_COMMENTS } from '@/data/mock-deals';
import { MessageSquare, Flame } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="space-y-6">
      {/* Hero with stats */}
      <HeroBanner />

      {/* Main deals section with live categories filter */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-orange-500/15 text-orange-400">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Gorące Rekomendacje Szwagra
              </h2>
              <p className="text-sm sm:text-base text-slate-300 font-medium">
                Wyselekcjonowane oferty, które warto kupić bez zastanowienia
              </p>
            </div>
          </div>

          <Link
            href="/okazje"
            className="text-sm font-black text-amber-400 hover:text-amber-300 flex items-center gap-1.5 group"
          >
            <span>Zobacz wszystkie</span>
            <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
          </Link>
        </div>

        <HomeDealsSection />
      </section>

      {/* VIP Stripe Banner */}
      <VipPromoBanner />

      {/* Trust & Principles */}
      <SzwagierRules />

      {/* Recent community comments */}
      <section className="my-16 p-8 sm:p-10 rounded-3xl bg-slate-900 border border-slate-700/80 shadow-xl">
        <div className="flex items-center gap-3 mb-8">
          <MessageSquare className="w-6 h-6 text-amber-400" />
          <h3 className="text-xl sm:text-2xl font-black text-white">Głosy z warsztatu i garażu</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MOCK_COMMENTS.map((comment) => (
            <div
              key={comment.id}
              className="p-6 rounded-2xl bg-slate-950 border border-slate-700 flex flex-col justify-between"
            >
              <p className="text-sm sm:text-base text-slate-200 italic mb-5 leading-relaxed font-normal">
                &ldquo;{comment.content}&rdquo;
              </p>
              <div className="flex items-center justify-between text-xs sm:text-sm text-slate-400 pt-3 border-t border-slate-800 font-medium">
                <span className="font-extrabold text-slate-200 flex items-center gap-1.5">
                  {comment.username}
                  {comment.is_vip && (
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-black">
                      VIP
                    </span>
                  )}
                </span>
                <span className="text-slate-400">Zweryfikowany</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
