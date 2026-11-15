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
    console.error(`Błąd weryfikacji webhooka Stripe: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;
      const userId = session.client_reference_id || session.metadata?.userId;
      const orderId = session.metadata?.orderId;
      const priceId = session.metadata?.priceId || 'price_vip';

      // 1. Zapis / aktualizacja subskrypcji w tabeli 'subscriptions' powiązanej po ID z profiles
      if (subscriptionId && userId) {
        await supabase.from('subscriptions').upsert({
          id: subscriptionId,
          user_id: userId,
          status: 'active',
          price_id: priceId,
          updated_at: new Date().toISOString(),
        });

        // 2. Powiązanie w profilu po ID: active_subscription_id = subscriptionId
        await supabase
          .from('profiles')
          .update({
            active_subscription_id: subscriptionId,
            stripe_customer_id: customerId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);
      }

      // 3. Aktualizacja statusu zamówienia w tabeli 'orders' na 'paid'
      if (orderId) {
        await supabase
          .from('orders')
          .update({
            status: 'paid',
            subscription_id: subscriptionId || null,
            stripe_payment_intent_id: (session.payment_intent as string) || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', orderId);
      }
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      await supabase
        .from('subscriptions')
        .update({
          status: subscription.status,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscription.id);
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;

      // 1. Oznaczenie subskrypcji jako anulowanej
      await supabase
        .from('subscriptions')
        .update({
          status: 'canceled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscription.id);

      // 2. Usunięcie powiązania active_subscription_id z profilu użytkownika
      await supabase
        .from('profiles')
        .update({
          active_subscription_id: null,
          updated_at: new Date().toISOString(),
        })
        .eq('active_subscription_id', subscription.id);

      break;
    }

    default:
      console.log(`Zdarzenie Stripe nieobsługiwane: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
