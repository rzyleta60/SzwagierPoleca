-- ====================================================================
-- SCHEMA BAZY DANYCH: szwagierpoleca.pl (PostgreSQL / Supabase)
-- ZWERYFIKOWANA I ZOPTYMALIZOWANA ARCHITEKTURA BAZY DANYCH
-- ====================================================================

-- 1. TABELA KATEGORII
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY, -- slug, np. 'narzedzia', 'motoryzacja'
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABELA SUBSKRYPCJI STRIPE (Tworzymy najpierw, aby powiązać z profiles)
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id TEXT PRIMARY KEY, -- identyfikator Stripe: sub_...
    user_id UUID NOT NULL, -- powiązanie po ID z profiles.id (FK dodany niżej)
    status TEXT NOT NULL CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'unpaid', 'incomplete')),
    price_id TEXT NOT NULL, -- identyfikator planu: price_...
    cancel_at_period_end BOOLEAN DEFAULT false,
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABELA PROFILI / UŻYTKOWNIKÓW
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT, -- opcjonalny hash dla logowania hasłem lub OAuth / Magic Link
    username TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    stripe_customer_id TEXT,
    active_subscription_id TEXT REFERENCES public.subscriptions(id) ON DELETE SET NULL, -- powiązanie po ID
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'szwagier_admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Dodanie klucza obcego dla subscriptions.user_id wskazującego na profiles.id
ALTER TABLE public.subscriptions 
    DROP CONSTRAINT IF EXISTS fk_subscriptions_user;

ALTER TABLE public.subscriptions
    ADD CONSTRAINT fk_subscriptions_user
    FOREIGN KEY (user_id) 
    REFERENCES public.profiles(id) 
    ON DELETE CASCADE;

-- 4. TABELA ZAMÓWIEŃ (Zakupy, plany VIP i produkty)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    order_number TEXT UNIQUE NOT NULL, -- np. SZW/2026/11/001
    total_amount NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'PLN',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded', 'cancelled')),
    payment_method TEXT DEFAULT 'stripe', -- stripe_card, blik, apple_pay itp.
    stripe_checkout_session_id TEXT,
    stripe_payment_intent_id TEXT,
    subscription_id TEXT REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb, -- lista pozycji
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABELA OKAZJI I REKOMENDACJI SPRZĘTU (DEALS)
CREATE TABLE IF NOT EXISTS public.deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    szwagier_verdict TEXT NOT NULL, -- Prawdziwa opinia Szwagra z garażu
    pros TEXT[] DEFAULT '{}',        -- Plusy sprzętu
    cons TEXT[] DEFAULT '{}',        -- Minusy sprzętu
    original_price NUMERIC(10, 2),
    deal_price NUMERIC(10, 2) NOT NULL,
    discount_percent INTEGER GENERATED ALWAYS AS (
        CASE 
            WHEN original_price > deal_price AND original_price > 0 
            THEN ROUND(((original_price - deal_price) / original_price) * 100) 
            ELSE 0 
        END
    ) STORED,
    lowest_price_30_days NUMERIC(10, 2), -- Dyrektywa Omnibus: najniższa cena z 30 dni
    coupon_code TEXT,
    deal_url TEXT NOT NULL,
    image_url TEXT NOT NULL,
    store_name TEXT NOT NULL,
    badge TEXT DEFAULT 'POLECENIE_SZWAGRA',
    temperature INTEGER DEFAULT 100,       -- Stopnie gorącości oferty (°C)
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    is_vip_only BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TABELA ŁĄCZĄCA: DEALS <-> CATEGORIES (Relacja Wiele-do-Wielu / M:N)
CREATE TABLE IF NOT EXISTS public.deal_categories (
    deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
    category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (deal_id, category_id)
);

-- 7. SUB-TABELA: HISTORIA CEN Z OSTATNICH 30 DNI
CREATE TABLE IF NOT EXISTS public.deal_price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
    price NUMERIC(10, 2) NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_deal_price_history_30d 
    ON public.deal_price_history (deal_id, recorded_at DESC);

-- Trigger aktualizujący najniższą cenę z ostatnich 30 dni w tabeli deals (Omnibus)
CREATE OR REPLACE FUNCTION public.update_deal_lowest_price_30d()
RETURNS trigger AS $$
BEGIN
    UPDATE public.deals
    SET lowest_price_30_days = (
        SELECT MIN(price)
        FROM public.deal_price_history
        WHERE deal_id = NEW.deal_id
          AND recorded_at >= NOW() - INTERVAL '30 days'
    )
    WHERE id = NEW.deal_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER on_deal_price_history_inserted
    AFTER INSERT ON public.deal_price_history
    FOR EACH ROW EXECUTE FUNCTION public.update_deal_lowest_price_30d();

-- 8. TABELA GŁOSÓW (Warto / Nie warto)
CREATE TABLE IF NOT EXISTS public.votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(deal_id, user_id)
);

-- 9. TABELA KOMENTARZY
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================================
-- PROCEDURY SKŁADOWANE RPC (Wymagane przez backend Next.js)
-- ====================================================================

-- 1. Zwiększenie głosu "Warto" + temperatura
CREATE OR REPLACE FUNCTION public.increment_upvotes(deal_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.deals
    SET upvotes = upvotes + 1,
        temperature = temperature + 5
    WHERE id = deal_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Zwiększenie głosu "Nie warto" - temperatura
CREATE OR REPLACE FUNCTION public.increment_downvotes(deal_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.deals
    SET downvotes = downvotes + 1,
        temperature = GREATEST(0, temperature - 5)
    WHERE id = deal_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Automatyczne tworzenie profilu przy rejestracji w Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'full_name', 'Szwagier'),
    new.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Podpięcie triggera do auth.users w Supabase (jeśli istnieje)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'auth' AND tablename = 'users') THEN
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    END IF;
END $$;

-- ====================================================================
-- BEZPIECZEŃSTWO: ROW LEVEL SECURITY (RLS)
-- ====================================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- POLITYKI RLS:
CREATE POLICY "Kategorie są publiczne" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Powiązania kategorii są publiczne" ON public.deal_categories FOR SELECT USING (true);
CREATE POLICY "Profile są widoczne publicznie" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Użytkownik edytuje swój profil" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Użytkownik widzi swoje subskrypcje" ON public.subscriptions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Użytkownik widzi swoje zamówienia" ON public.orders FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Historia cen jest publiczna" ON public.deal_price_history FOR SELECT USING (true);

-- Dostęp do okazji: publiczny dla ogólnych, dla VIP sprawdzany po powiązaniu ID w subscriptions
CREATE POLICY "Okazje widoczne dla uprawnionych" ON public.deals FOR SELECT USING (
    is_vip_only = false OR 
    EXISTS (
        SELECT 1 FROM public.subscriptions 
        WHERE subscriptions.user_id = auth.uid() 
          AND subscriptions.status = 'active'
    )
);

CREATE POLICY "Głosy są widoczne" ON public.votes FOR SELECT USING (true);
CREATE POLICY "Zalogowani mogą głosować" ON public.votes FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Komentarze są widoczne" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Zalogowani mogą komentować" ON public.comments FOR INSERT WITH CHECK (user_id = auth.uid());

-- ====================================================================
-- PRZYKŁADOWE KATEGORIE POCZĄTKOWE
-- ====================================================================
INSERT INTO public.categories (id, name, description, icon) VALUES
('narzedzia', 'Narzędzia i Warsztat', 'Wkrętarki, młotowiertarki, klucze i sprzęt do garażu', 'Wrench'),
('motoryzacja', 'Motoryzacja i Garaż', 'Klucze do kół, chemia samochodowa, prostowniki i myjki', 'Car'),
('dom-ogrod', 'Dom i Ogród', 'Kosiarki, sprzęt ogrodowy, naprawy domowe i hydraulika', 'Home'),
('elektronika', 'Elektronika i Gadżety', 'Multimetry, latarki taktyczne, akumulatory i gadżety', 'Zap')
ON CONFLICT (id) DO NOTHING;
