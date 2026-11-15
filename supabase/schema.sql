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
-- PRZYKŁADOWE DANE POCZĄTKOWE (SEED DATA)
-- ====================================================================
INSERT INTO public.categories (id, name, description, icon) VALUES
('narzedzia', 'Narzędzia i Warsztat', 'Wkrętarki, młotowiertarki, klucze i sprzęt do garażu', 'Wrench'),
('motoryzacja', 'Motoryzacja i Garaż', 'Klucze do kół, chemia samochodowa, prostowniki i myjki', 'Car'),
('dom-ogrod', 'Dom i Ogród', 'Kosiarki, sprzęt ogrodowy, naprawy domowe i hydraulika', 'Home'),
('elektronika', 'Elektronika i Gadżety', 'Multimetry, latarki taktyczne, akumulatory i gadżety', 'Zap')
ON CONFLICT (id) DO NOTHING;

-- Przykładowe okazje Szwagra
INSERT INTO public.deals (id, title, slug, description, szwagier_verdict, pros, cons, original_price, deal_price, lowest_price_30_days, coupon_code, deal_url, image_url, store_name, badge, temperature, upvotes, downvotes, is_vip_only, is_featured)
VALUES
(
    '11111111-1111-1111-1111-111111111111',
    'Wkrętarka udarowa DeWalt DCD796 18V XR + 2x Aku 5.0Ah + Ładowarka i Kufer TSTAK',
    'dewalt-dcd796-18v-xr-zestaw-2x5ah',
    'Legendarny bezszczotkowy potwór od DeWalta. 70 Nm momentu obrotowego, metalowa przekładnia i dwa akumulatory 5Ah.',
    'Panie, to nie jest zabawka z marketu za 120 zł co po trzech wkrętach w kantówkę dymi. Skręciłem nią całą altankę i więźbę u teścia. Bateria 5Ah trzyma tak, że zapomnisz gdzie masz ładowarkę.',
    ARRAY['Silnik bezszczotkowy 70 Nm – idzie w dąb jak w masło', 'W zestawie 2 potężne akumulatory 5.0 Ah', 'Walizka systemowa TSTAK w komplecie'],
    ARRAY['Ciężka z baterią 5Ah', 'Sąsiedzi będą chcieli ciągle pożyczać'],
    1199.00, 789.00, 789.00, 'SZWAGIER10', 'https://allegro.pl',
    'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80',
    'Allegro / Oficjalny Dystrybutor', 'POLECENIE_SZWAGRA', 342, 89, 2, false, true
),
(
    '22222222-2222-2222-2222-222222222222',
    'Akumulatorowy klucz udarowy Parkside Performance PASSP 20-Li A3 (1898 Nm luzowania!)',
    'parkside-performance-klucz-udarowy-1898nm',
    'Czarna seria Performance z Lidla. Bestia z momentem zrywającym prawie 1900 Nm. Odkręca zapieczone śruby w kołach busa i traktorze.',
    'Każdy się śmieje z Parkside dopóki nie zobaczy czarnej serii Performance. Wulkanizator chciał mi pourywać szpilki w Passacie, wziąłem tego potwora i śruba puściła w sekundę.',
    ARRAY['Potężny moment zrywający – nie ma śruby, która nie puści', 'Silnik bezszczotkowy', '5 lat gwarancji producenta'],
    ARRAY['Szybko znika z półek w sklepie online', 'Wymaga mocnego aku min. 4Ah'],
    499.00, 299.00, 299.00, 'LIDLPLUS', 'https://lidl.pl',
    'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80',
    'Lidl Sklep Online', 'CEBULA_DEAL', 489, 142, 6, false, true
)
ON CONFLICT (id) DO NOTHING;

-- Przypisanie do wielu kategorii (M:N)
INSERT INTO public.deal_categories (deal_id, category_id) VALUES
('11111111-1111-1111-1111-111111111111', 'narzedzia'),
('22222222-2222-2222-2222-222222222222', 'motoryzacja'),
('22222222-2222-2222-2222-222222222222', 'narzedzia')
ON CONFLICT (deal_id, category_id) DO NOTHING;

-- Historia cen (Omnibus)
INSERT INTO public.deal_price_history (deal_id, price, recorded_at) VALUES
('11111111-1111-1111-1111-111111111111', 1199.00, NOW() - INTERVAL '25 days'),
('11111111-1111-1111-1111-111111111111', 899.00, NOW() - INTERVAL '10 days'),
('11111111-1111-1111-1111-111111111111', 789.00, NOW() - INTERVAL '1 day'),
('22222222-2222-2222-2222-222222222222', 499.00, NOW() - INTERVAL '20 days'),
('22222222-2222-2222-2222-222222222222', 299.00, NOW() - INTERVAL '2 hours');
