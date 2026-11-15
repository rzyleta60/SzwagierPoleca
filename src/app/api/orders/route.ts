import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ orders: [] });
    }

    const admin = createAdminClient();

    const { data, error } = await admin
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Błąd podczas pobierania zamówień z bazy Supabase:', error);
      return NextResponse.json({ orders: [] });
    }

    // Zwracamy wyłącznie rzeczywiste zamówienia przypisane do danego użytkownika
    return NextResponse.json({ orders: data || [] });
  } catch (err: any) {
    console.error('Błąd w /api/orders:', err);
    return NextResponse.json({ orders: [] }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, items, totalAmount, paymentMethod, subscriptionId } = body;

    if (!userId || !items || !totalAmount) {
      return NextResponse.json({ error: 'Brak wymaganych danych zamówienia.' }, { status: 400 });
    }

    const admin = createAdminClient();
    const orderNumber = `SZW/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${Math.floor(1000 + Math.random() * 9000)}`;

    const { data, error } = await admin
      .from('orders')
      .insert({
        user_id: userId,
        order_number: orderNumber,
        total_amount: totalAmount,
        currency: 'PLN',
        status: 'paid',
        payment_method: paymentMethod || 'Karta Stripe',
        subscription_id: subscriptionId || null,
        items,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, order: data });
  } catch (err: any) {
    console.error('Błąd zapisu zamówienia:', err);
    return NextResponse.json({ error: err.message || 'Nie udało się złożyć zamówienia.' }, { status: 500 });
  }
}
