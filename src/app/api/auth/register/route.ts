import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const { email, password, username } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Adres e-mail i hasło są wymagane.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Hasło musi mieć co najmniej 6 znaków.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username?.trim() || cleanEmail.split('@')[0];
    const admin = createAdminClient();

    // Tworzenie użytkownika z poziomu Admin API z email_confirm: true
    // Bypasuje to domyślny serwer SMTP Supabase i eliminuje błąd "Email rate limit exceeded"
    const { data, error } = await admin.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: true,
      user_metadata: {
        username: cleanUsername,
        full_name: cleanUsername,
      },
    });

    if (error) {
      if (
        error.message?.includes('already been registered') || 
        error.message?.includes('User already registered') ||
        error.message?.includes('already exists')
      ) {
        return NextResponse.json(
          { error: 'Użytkownik o tym adresie e-mail już istnieje. Zaloguj się.' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: error.message || 'Wystąpił błąd podczas rejestracji w Supabase.' },
        { status: 400 }
      );
    }

    if (data?.user) {
      // Bezpośredni zapis do profiles
      try {
        await admin.from('profiles').upsert(
          {
            id: data.user.id,
            email: data.user.email,
            username: cleanUsername,
            full_name: cleanUsername,
            role: 'user',
          },
          { onConflict: 'id' }
        );
      } catch (profileErr) {
        console.warn('Ostrzeżenie przy zapisie profilu w /api/auth/register:', profileErr);
      }
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      message: 'Konto zostało pomyślnie utworzone i potwierdzone!',
    });
  } catch (err: any) {
    console.error('Błąd w /api/auth/register:', err);
    return NextResponse.json(
      { error: err.message || 'Wystąpił nieoczekiwany błąd serwera.' },
      { status: 500 }
    );
  }
}
