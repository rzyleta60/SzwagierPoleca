import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const { customerId } = await req.json();

    const reqOrigin = req.headers.get('origin');
    const reqHost = req.headers.get('host');
    const proto = req.headers.get('x-forwarded-proto') || 'https';
    const siteUrl = reqOrigin || (reqHost ? `${proto}://${reqHost}` : process.env.NEXT_PUBLIC_SITE_URL || 'https://szwagierpoleca.vercel.app');

    if (!customerId || !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('mock')) {
      return NextResponse.json({
        url: `${siteUrl}/vip`,
        message: 'Portal rozliczeń Stripe w trybie demonstracyjnym.',
      });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${siteUrl}/vip`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Błąd Stripe Customer Portal:', error);
    return NextResponse.json(
      { error: error.message || 'Nie udało się otworzyć portalu Stripe.' },
      { status: 500 }
    );
  }
}
