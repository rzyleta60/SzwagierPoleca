import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { Order } from '@/types';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    const admin = createAdminClient();

    let dbOrders: any[] = [];
    if (userId) {
      const { data, error } = await admin
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        dbOrders = data;
      }
    }

    // Jeśli w bazie są zamówienia użytkownika, zwróć je
    if (dbOrders.length > 0) {
      return NextResponse.json({ orders: dbOrders });
    }

    // Przykładowe zamówienia demonstracyjne dla profilu
    const mockDemoOrders: Order[] = [
      {
        id: 'ord_demo_1',
        user_id: userId || 'demo_user',
        order_number: 'SZW/2026/10/4182',
        total_amount: 19.99,
        currency: 'PLN',
        status: 'paid',
        payment_method: 'BLIK (Stripe)',
        subscription_id: 'sub_demo_active',
        items: [
          {
            name: 'Klub Szwagra VIP – Dostęp miesięczny (Alerty Telegram + Błędy cenowe)',
            price: 19.99,
            quantity: 1,
          },
        ],
        created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'ord_demo_2',
        user_id: userId || 'demo_user',
        order_number: 'SZW/2026/09/2089',
        total_amount: 89.00,
        currency: 'PLN',
        status: 'paid',
        payment_method: 'Karta Visa (Stripe)',
        items: [
          {
            name: 'Zestaw magnetycznych organizerów warsztatowych SzwagierPro na klucze płasko-oczkowe',
            price: 89.00,
            quantity: 1,
          },
        ],
        created_at: new Date(Date.now() - 48 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 48 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    return NextResponse.json({ orders: mockDemoOrders });
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
