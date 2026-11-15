import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const { userId, action, planId } = await req.json();

    const isDeactivate = action === 'deactivate';
    const admin = createAdminClient();

    if (userId) {
      if (isDeactivate) {
        // Wyczyszczenie aktywnej subskrypcji
        const { error } = await admin
          .from('profiles')
          .update({ active_subscription_id: null })
          .eq('id', userId);

        if (error) {
          console.warn('Błąd podczas deaktywacji subskrypcji w Supabase:', error);
        }

        return NextResponse.json({
          success: true,
          isVip: false,
          message: 'Status VIP został pomyślnie wyłączony (tryb testowy).',
        });
      } else {
        // Aktywacja subskrypcji testowej
        const testSubId = `sub_test_${Date.now()}`;
        const targetPriceId = planId || 'price_vip_monthly_test';

        // 1. Zapis do tabeli subscriptions
        const { error: subErr } = await admin.from('subscriptions').upsert({
          id: testSubId,
          user_id: userId,
          status: 'active',
          price_id: targetPriceId,
          cancel_at_period_end: false,
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        });

        if (subErr) {
          console.warn('Ostrzeżenie przy zapisie do subscriptions:', subErr);
        }

        // 2. Aktualizacja profilu użytkownika
        const { error: profileErr } = await admin
          .from('profiles')
          .update({
            active_subscription_id: testSubId,
          })
          .eq('id', userId);

        if (profileErr) {
          console.warn('Ostrzeżenie przy aktualizacji profiles:', profileErr);
        }

        return NextResponse.json({
          success: true,
          isVip: true,
          subscriptionId: testSubId,
          message: 'Status VIP został pomyślnie aktywowany bez konieczności przechodzenia przez Stripe!',
        });
      }
    }

    // Jeśli brak zalogowanego usera, zwracamy status sukcesu dla trybu lokalnego
    return NextResponse.json({
      success: true,
      isVip: !isDeactivate,
      message: isDeactivate
        ? 'VIP wyłączony lokalnie.'
        : 'VIP włączony lokalnie bez Stripe.',
    });
  } catch (err: any) {
    console.error('Błąd w /api/vip/test-activate:', err);
    return NextResponse.json(
      { error: err.message || 'Wystąpił błąd podczas aktywacji testowej.' },
      { status: 500 }
    );
  }
}
