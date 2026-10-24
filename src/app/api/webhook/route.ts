import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import Stripe from 'stripe';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch (err: any) {
    console.error(`Błąd weryfikacji webhooka: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;
      const clientReferenceId = session.client_reference_id;

      // Aktywacja konta VIP użytkownika w Supabase
      if (clientReferenceId) {
        await supabase
          .from('profiles')
          .update({
            is_vip: true,
            stripe_customer_id: customerId,
          })
          .eq('id', clientReferenceId);
      }

      if (subscriptionId) {
        await supabase.from('subscriptions').upsert({
          id: subscriptionId,
          user_id: clientReferenceId || customerId,
          status: 'active',
          price_id: session.id,
        });
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      // Dezaktywacja VIP
      await supabase
        .from('subscriptions')
        .update({ status: 'canceled' })
        .eq('id', subscription.id);

      break;
    }

    default:
      console.log(`Nieobsługiwany typ zdarzenia Stripe: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
