import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { MOCK_COMMENTS } from '@/data/mock-deals';
import {
  dealIdToUuid,
  encodeCommentContent,
  decodeCommentContent,
  ensureGuestProfile,
  ensureDealExists,
  GUEST_USER_ID,
} from '@/lib/comments-db';
import { Comment } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dealId = searchParams.get('dealId');

    if (!dealId) {
      return NextResponse.json({ error: 'Brak identyfikatora okazji (dealId)' }, { status: 400 });
    }

    const dealUuid = dealIdToUuid(dealId);
    const supabase = createAdminClient();

    // Pobierz komentarze z bazy Supabase powiązane z tą okazją
    const { data: dbComments, error } = await supabase
      .from('comments')
      .select(`
        id,
        deal_id,
        user_id,
        content,
        created_at,
        profiles (
          id,
          username,
          full_name,
          avatar_url,
          role,
          active_subscription_id
        )
      `)
      .eq('deal_id', dealUuid)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Błąd pobierania komentarzy z Supabase:', error);
    }

    // Formatuj komentarze pobrane z bazy
    const formattedDbComments: Comment[] = (dbComments || []).map((row: any) => {
      const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
      const defaultAuthor = profile?.username || profile?.full_name || 'Majster_Garażowy';
      const defaultVip = profile?.role === 'szwagier_admin' || !!profile?.active_subscription_id;

      const decoded = decodeCommentContent(row.content, defaultAuthor, defaultVip);

      return {
        id: row.id,
        deal_id: dealId,
        user_id: row.user_id,
        username: decoded.username,
        avatar_url: profile?.avatar_url,
        is_vip: decoded.isVip,
        content: decoded.content,
        created_at: row.created_at,
      };
    });

    // Dodaj domyślne komentarze z mocka dla danej okazji, jeśli jeszcze nie istnieją
    const mockForDeal = MOCK_COMMENTS.filter(
      (m) => m.deal_id === dealId || (dealId === '1' && m.deal_id === '1')
    );

    // Połącz: najnowsze komentarze z bazy na górze, mockowe dyskusje na dole
    const allComments = [...formattedDbComments, ...mockForDeal];

    return NextResponse.json({
      success: true,
      comments: allComments,
      count: allComments.length,
    });
  } catch (err: any) {
    console.error('Błąd w GET /api/comments:', err);
    return NextResponse.json({ error: err.message || 'Błąd serwera' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { dealId, content, username, isVip, userId } = await req.json();

    if (!dealId || !content?.trim()) {
      return NextResponse.json(
        { error: 'Identyfikator okazji oraz treść komentarza są wymagane.' },
        { status: 400 }
      );
    }

    const cleanContent = content.trim();
    const cleanAuthor = username?.trim() || 'Majster_Garażowy';
    const supabase = createAdminClient();

    // 1. Zapewnij istnienie rekordu okazji i profilu gościa
    await ensureGuestProfile(supabase);
    const dealUuid = await ensureDealExists(supabase, dealId);

    // 2. Zweryfikuj czy podany userId istnieje w profiles
    let validUserId = GUEST_USER_ID;
    if (userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
      const { data: p } = await supabase.from('profiles').select('id').eq('id', userId).maybeSingle();
      if (p) {
        validUserId = p.id;
      }
    }

    // 3. Zakoduj metadane autora i VIP w treści
    const encodedContent = encodeCommentContent(cleanAuthor, !!isVip, cleanContent);

    // 4. Zapisz komentarz w bazie Supabase
    const { data: inserted, error: insertError } = await supabase
      .from('comments')
      .insert([
        {
          deal_id: dealUuid,
          user_id: validUserId,
          content: encodedContent,
        },
      ])
      .select(`
        id,
        deal_id,
        user_id,
        content,
        created_at,
        profiles (
          id,
          username,
          full_name,
          avatar_url,
          role,
          active_subscription_id
        )
      `)
      .single();

    if (insertError) {
      console.error('Błąd zapisu komentarza do Supabase:', insertError);
      return NextResponse.json(
        { error: 'Nie udało się zapisać komentarza w bazie danych.' },
        { status: 500 }
      );
    }

    const decoded = decodeCommentContent(inserted.content, cleanAuthor, !!isVip);

    const insertedProfile: any = Array.isArray(inserted.profiles)
      ? inserted.profiles[0]
      : inserted.profiles;

    const createdComment: Comment = {
      id: inserted.id,
      deal_id: dealId,
      user_id: inserted.user_id,
      username: decoded.username,
      avatar_url: insertedProfile?.avatar_url,
      is_vip: decoded.isVip,
      content: decoded.content,
      created_at: inserted.created_at,
    };

    return NextResponse.json({
      success: true,
      comment: createdComment,
      message: 'Komentarz został pomyślnie dodany i jest widoczny dla wszystkich!',
    });
  } catch (err: any) {
    console.error('Błąd w POST /api/comments:', err);
    return NextResponse.json({ error: err.message || 'Wystąpił błąd serwera.' }, { status: 500 });
  }
}
