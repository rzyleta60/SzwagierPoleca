import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const { priceId, planName, userId, userEmail } = await req.json();

    const reqOrigin = req.headers.get('origin');
    const reqHost = req.headers.get('host');
    const proto = req.headers.get('x-forwarded-proto') || 'https';
    const siteUrl = reqOrigin || (reqHost ? `${proto}://${reqHost}` : process.env.NEXT_PUBLIC_SITE_URL || 'https://szwagierpoleca.vercel.app');
    const amount = priceId?.includes('yearly') ? 149.00 : 19.99;
    const amountCents = priceId?.includes('yearly') ? 14900 : 1999;
    const orderNumber = `SZW/${new Date().getFullYear()}/${Date.now().toString().slice(-6)}`;

    // Rejestracja zamówienia 'pending' w bazie Supabase jeśli przekazano userId
    let orderId: string | null = null;
    try {
      if (userId) {
        const supabase = createAdminClient();
        const { data: order } = await supabase
          .from('orders')
          .insert({
            user_id: userId,
            order_number: orderNumber,
            total_amount: amount,
            currency: 'PLN',
            status: 'pending',
            payment_method: 'stripe',
            items: [
              {
                name: planName || 'Klub Szwagra VIP',
                price: amount,
                quantity: 1,
              },
            ],
          })
          .select('id')
          .single();

        if (order) orderId = order.id;
      }
    } catch (dbErr) {
      console.warn('Nie udało się utworzyć rekordu zamówienia przed płatnością:', dbErr);
    }

    // Tryb demonstracyjny, jeśli brak klucza Stripe
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('mock') || process.env.STRIPE_SECRET_KEY.includes('placeholder')) {
      return NextResponse.json({
        url: `${siteUrl}/vip?success=true&mock=true`,
        message: 'Klucze Stripe nie są jeszcze skonfigurowane w .env. Użyto trybu demonstracyjnego.',
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'blik'],
      mode: 'subscription',
      customer_email: userEmail || undefined,
      client_reference_id: userId || undefined,
      metadata: {
        userId: userId || '',
        orderId: orderId || '',
        orderNumber,
        priceId: priceId || '',
        planName: planName || 'Klub Szwagra VIP',
      },
      line_items: [
        {
          price_data: {
            currency: 'pln',
            product_data: {
              name: planName || 'Klub Szwagra VIP',
              description: 'Dostęp do alertów o błędach cenowych i ekskluzywnych kodów rabatowych',
            },
            unit_amount: amountCents,
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

    // Aktualizacja identyfikatora sesji w zamówieniu
    if (orderId) {
      try {
        const supabase = createAdminClient();
        await supabase
          .from('orders')
          .update({ stripe_checkout_session_id: session.id })
          .eq('id', orderId);
      } catch (e) {
        // Ignoruj opcjonalny błąd aktualizacji
      }
    }

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Błąd Stripe Checkout:', error);
    return NextResponse.json(
      { error: error.message || 'Wystąpił błąd podczas generowania sesji Stripe Checkout.' },
      { status: 500 }
    );
  }
}
