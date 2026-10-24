import React from 'react';
import { Hammer, CheckCircle, ShieldAlert, Sparkles, Scale, HeartHandshake } from 'lucide-react';

export function SzwagierRules() {
  const rules = [
    {
      icon: Hammer,
      title: 'Przetestowane w warsztacie',
      description: 'Nie wrzucamy byle plastiku z marketu. Każdy sprzęt jest oceniany pod kątem wytrzymałości i realnych parametrów pracy pod obciążeniem.',
    },
    {
      icon: Scale,
      title: 'Twardy stosunek ceny do jakości',
      description: 'Zamiast przepłacać za sam znaczek na obudowie, wyłapujemy narzędzia, które oferują 90% możliwości sprzętu pro za ułamek jego ceny.',
    },
    {
      icon: ShieldAlert,
      title: 'Zero ściemnianych „promocji”',
      description: 'Prześwietlamy ceny przed i po. Jeśli sklep podniósł cenę o 30% tydzień wcześniej, by dać rabat 20%, od razu dostaje czerwoną kartkę.',
    },
    {
      icon: HeartHandshake,
      title: 'Prawdziwy głos społeczności',
      description: 'Głosuj na gorące okazje, komentuj swoje doświadczenia z danym modelem i pomagaj innym majsterkowiczom w wyborze.',
    },
  ];

  return (
    <section className="my-16">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Kodeks Szwagra: Dlaczego nam ufasz?
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-400">
          W internecie pełno jest sponsorowanych rankingów. U nas liczy się tylko jedno: czy narzędzie nie rozpadnie się przy pierwszym trudniejszym zadaniu.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {rules.map((rule, idx) => {
          const Icon = rule.icon;
          return (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">{rule.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{rule.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
