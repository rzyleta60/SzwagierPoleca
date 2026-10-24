import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-11-20.acacia' as any,
  appInfo: {
    name: 'SzwagierPoleca',
    version: '1.0.0',
  },
});

export interface Plan {
  id: string;
  name: string;
  price: number;
  period: 'miesiąc' | 'rok';
  priceId: string;
  savings?: string;
  features: string[];
  popular?: boolean;
}

export const VIP_PLANS: Plan[] = [
  {
    id: 'monthly',
    name: 'Klub Szwagra Miesięczny',
    price: 19.99,
    period: 'miesiąc',
    priceId: process.env.STRIPE_PRICE_ID_VIP_MONTHLY || 'price_vip_monthly',
    features: [
      'Dostęp do ukrytych okazji VIP i błędów cenowych',
      'Powiadomienia Telegram / E-mail w czasie rzeczywistym',
      'Złota odznaka „Złoty Szwagier” na profilu i przy komentarzach',
      'Dostęp do zamkniętej grupy dyskusyjnej majsterkowiczów',
      'Możliwość anulowania w każdej chwili jednym kliknięciem'
    ],
  },
  {
    id: 'yearly',
    name: 'Klub Szwagra Roczny (Prawdziwy Szwagier)',
    price: 149.00,
    period: 'rok',
    priceId: process.env.STRIPE_PRICE_ID_VIP_YEARLY || 'price_vip_yearly',
    savings: 'Oszczędzasz 38% (mniej niż 12,50 zł / mies.)',
    popular: true,
    features: [
      'Wszystko co w planie miesięcznym',
      'Ponad 90 zł oszczędności w skali roku',
      'Priorytetowe recenzje zgłoszonego sprzętu przez Szwagra',
      'Kody rabatowe do sklepów partnerskich (Castorama, Allegro, Lidl)',
      'Darmowy poradnik PDF: „Jak kupować narzędzia na lata i nie dać się naciąć”'
    ],
  },
];
