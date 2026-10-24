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
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          Kodeks Szwagra: Dlaczego nam ufasz?
        </h2>
        <p className="mt-3 text-sm sm:text-base text-slate-300">
          W internecie pełno jest sponsorowanych rankingów. U nas liczy się tylko jedno: czy narzędzie nie rozpadnie się przy pierwszym trudniejszym zadaniu.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {rules.map((rule, idx) => {
          const Icon = rule.icon;
          return (
            <div
              key={idx}
              className="p-7 rounded-2xl bg-slate-900 border border-slate-700 hover:border-amber-400 transition-all group shadow-md"
            >
              <div className="w-13 h-13 p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5 group-hover:scale-110 transition-transform">
                <Icon className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-white mb-2.5">{rule.title}</h3>
              <p className="text-sm text-slate-200 leading-relaxed font-normal">{rule.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
