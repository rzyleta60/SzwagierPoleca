import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const { priceId, planName } = await req.json();

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // If Stripe secret key is not set or is dummy, return a mock redirect so development testing is effortless
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('mock') || process.env.STRIPE_SECRET_KEY.includes('placeholder')) {
      return NextResponse.json({
        url: `${siteUrl}/vip?success=true&mock=true`,
        message: 'Klucze Stripe nie są jeszcze skonfigurowane w .env. Użyto trybu demonstracyjnego.',
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'blik'],
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'pln',
            product_data: {
              name: planName || 'Klub Szwagra VIP',
              description: 'Dostęp do alertów o błędach cenowych i ekskluzywnych kodów rabatowych',
            },
            unit_amount: priceId?.includes('yearly') ? 14900 : 1999, // kwota w groszach (19.99 zł lub 149.00 zł)
            recurring: {
              interval: priceId?.includes('yearly') ? 'year' : 'month',
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/vip?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/vip?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Błąd Stripe Checkout:', error);
    return NextResponse.json(
      { error: error.message || 'Wystąpił błąd podczas generowania sesji Stripe Checkout.' },
      { status: 500 }
    );
  }
}
