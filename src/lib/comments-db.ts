import crypto from 'crypto';
import { SupabaseClient } from '@supabase/supabase-js';
import { MOCK_DEALS } from '@/data/mock-deals';

export const GUEST_USER_ID = '00000000-0000-0000-0000-000000000000';

/**
 * Konwertuje dowolny identyfikator okazji (np. "1", "19", slug lub UUID) na unikalny, powtarzalny UUID
 */
export function dealIdToUuid(dealId: string): string {
  if (!dealId) return '00000000-0000-0000-0000-000000000001';

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(dealId)) {
    return dealId.toLowerCase();
  }

  // Identyfikatory numeryczne z mock-deals (np. "1", "2", "19")
  if (/^\d+$/.test(dealId)) {
    return `00000000-0000-0000-0000-${dealId.padStart(12, '0')}`;
  }

  // Identyfikatory tekstowe (np. slug okazji)
  const hash = crypto.createHash('md5').update(`szwagier:deal:${dealId}`).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
}

/**
 * Zapisuje nazwę autora i status VIP w treści komentarza dla pełnej kompatybilności wstecznej
 */
export function encodeCommentContent(author: string, isVip: boolean, content: string): string {
  const cleanAuthor = author.replace(/[|\]]/g, '').trim() || 'Majster_Garażowy';
  return `[SZWAGIER:${cleanAuthor}|VIP:${isVip ? '1' : '0'}] ${content.trim()}`;
}

/**
 * Odczytuje metadane autora i status VIP z treści komentarza
 */
export function decodeCommentContent(
  rawContent: string,
  defaultAuthor: string,
  defaultVip: boolean
): { username: string; isVip: boolean; content: string } {
  const match = rawContent.match(/^\[SZWAGIER:(.*?)\|VIP:([01])\]\s*([\s\S]*)$/);
  if (match) {
    return {
      username: match[1] || defaultAuthor,
      isVip: match[2] === '1',
      content: match[3],
    };
  }
  return {
    username: defaultAuthor,
    isVip: defaultVip,
    content: rawContent,
  };
}

/**
 * Upewnia się, że konto gościa istnieje w tabeli profiles
 */
export async function ensureGuestProfile(supabase: SupabaseClient) {
  try {
    await supabase.from('profiles').upsert(
      {
        id: GUEST_USER_ID,
        email: 'gosc@szwagierpoleca.pl',
        username: 'Gość Garażowy',
        full_name: 'Gość Garażowy',
        role: 'user',
      },
      { onConflict: 'id' }
    );
  } catch (err) {
    console.warn('Ostrzeżenie przy ensureGuestProfile:', err);
  }
}

/**
 * Upewnia się, że okazja istnieje w tabeli deals w Supabase (aby nie złamać klucza obcego comments_deal_id_fkey)
 */
export async function ensureDealExists(supabase: SupabaseClient, dealId: string) {
  const uuid = dealIdToUuid(dealId);

  try {
    const { data: existing } = await supabase
      .from('deals')
      .select('id')
      .eq('id', uuid)
      .maybeSingle();

    if (existing) return uuid;

    // Znajdź w mock deals po id lub slugu
    const mock = MOCK_DEALS.find((d) => d.id === dealId || d.slug === dealId) || MOCK_DEALS.find((d) => dealIdToUuid(d.id) === uuid);

    await supabase.from('deals').upsert(
      {
        id: uuid,
        title: mock ? mock.title : `Okazja #${dealId}`,
        slug: mock ? mock.slug : `okazja-${dealId}`,
        description: mock ? mock.description : 'Okazja polecana przez Szwagra.',
        szwagier_verdict: mock ? mock.szwagier_verdict : 'Panie, sprawdzony sprzęt w warsztacie!',
        pros: mock?.pros || [],
        cons: mock?.cons || [],
        original_price: mock?.original_price || null,
        deal_price: mock?.deal_price || 99.99,
        lowest_price_30_days: mock?.lowest_price_30_days || null,
        coupon_code: mock?.coupon_code || null,
        deal_url: mock?.deal_url || 'https://allegro.pl',
        image_url: mock?.image_url || 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80',
        store_name: mock?.store_name || 'Allegro',
        badge: mock?.badge || 'POLECENIE_SZWAGRA',
        temperature: mock?.temperature || 100,
        upvotes: mock?.upvotes || 0,
        downvotes: mock?.downvotes || 0,
        is_vip_only: !!mock?.is_vip_only,
        is_featured: !!mock?.is_featured,
      },
      { onConflict: 'id' }
    );

    return uuid;
  } catch (err) {
    console.error('Błąd w ensureDealExists:', err);
    return uuid;
  }
}
