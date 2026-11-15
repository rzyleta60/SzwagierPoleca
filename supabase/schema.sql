-- ====================================================================
-- SCHEMA BAZY DANYCH: szwagierpoleca.pl (PostgreSQL / Supabase)
-- ZAKTUALIZOWANA ARCHITEKTURA BAZY DANYCH
-- ====================================================================

-- 1. TABELA KATEGORII
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY, -- slug, np. 'narzedzia', 'motoryzacja'
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABELA PROFILI / UŻYTKOWNIKÓW (Główna samodzielna tabela użytkowników)
-- Zawiera email, hasło (hash) oraz ID aktywnej subskrypcji
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL, -- bezpieczny hash hasła użytkownika
    username TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    stripe_customer_id TEXT,
    active_subscription_id TEXT, -- powiązanie po ID ze subskrypcją Stripe
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'szwagier_admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABELA SUBSKRYPCJI STRIPE (Klub Szwagra VIP)
-- Bezpośrednie powiązanie po ID użytkownika (user_id -> profiles.id)
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id TEXT PRIMARY KEY, -- identyfikator Stripe: sub_...
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'unpaid', 'incomplete')),
    price_id TEXT NOT NULL, -- identyfikator planu: price_...
    cancel_at_period_end BOOLEAN DEFAULT false,
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Dodanie klucza obcego w tabeli profiles wskazującego na aktualną subskrypcję
ALTER TABLE public.profiles 
    DROP CONSTRAINT IF EXISTS fk_profiles_active_subscription;

ALTER TABLE public.profiles
    ADD CONSTRAINT fk_profiles_active_subscription
    FOREIGN KEY (active_subscription_id) 
    REFERENCES public.subscriptions(id) 
    ON DELETE SET NULL;

-- 4. TABELA ZAMÓWIEŃ (Nowa tabela zakupów, planów VIP i produktów)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    order_number TEXT UNIQUE NOT NULL, -- np. SZW/2026/11/001
    total_amount NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'PLN',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded', 'cancelled')),
    payment_method TEXT DEFAULT 'stripe', -- stripe_card, blik, apple_pay, etc.
    stripe_checkout_session_id TEXT,
    stripe_payment_intent_id TEXT,
    subscription_id TEXT REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb, -- szczegóły zamówionych pozycji (tytuł, cena, ilość)
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
    badge TEXT DEFAULT 'POLECENIE_SZWAGRA', -- 'POLECENIE_SZWAGRA', 'CEBULA_DEAL', 'WOL_ROBOCZY', 'BLAD_CENOWY'
    temperature INTEGER DEFAULT 100,       -- Stopnie gorącości oferty (np. 150°C)
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    is_vip_only BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TABELA ŁĄCZĄCA: DEALS <-> CATEGORIES (Relacja Wiele-do-Wielu / M:N)
-- Jeden produkt może należeć do wielu kategorii jednocześnie (np. klucz udarowy: Narzędzia + Motoryzacja)
CREATE TABLE IF NOT EXISTS public.deal_categories (
    deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
    category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (deal_id, category_id)
);

-- 7. SUB-TABELA: HISTORIA CEN Z OSTATNICH 30 DNI (Sub-tabela do deals)
-- Śledzenie zmian cen i realizacja wymogów dyrektywy Omnibus
CREATE TABLE IF NOT EXISTS public.deal_price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
    price NUMERIC(10, 2) NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indeks do błyskawicznego odpytywania historii cen z ostatnich 30 dni
CREATE INDEX IF NOT EXISTS idx_deal_price_history_30d 
    ON public.deal_price_history (deal_id, recorded_at DESC);

-- Trigger aktualizujący najniższą cenę z ostatnich 30 dni w tabeli deals
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
-- Kategorie i powiązania: Odczyt dla wszystkich
CREATE POLICY "Kategorie są publiczne" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Powiązania kategorii są publiczne" ON public.deal_categories FOR SELECT USING (true);

-- Profile: Każdy widzi profile publiczne, edycja własnego konta
CREATE POLICY "Profile są widoczne publicznie" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Użytkownik edytuje swój profil" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Subskrypcje: Użytkownik widzi wyłącznie swoją subskrypcję (po ID)
CREATE POLICY "Użytkownik widzi swoje subskrypcje" ON public.subscriptions FOR SELECT USING (user_id = auth.uid());

-- Zamówienia: Użytkownik widzi wyłącznie swoje zamówienia (po ID)
CREATE POLICY "Użytkownik widzi swoje zamówienia" ON public.orders FOR SELECT USING (user_id = auth.uid());

-- Historia cen: Dostępna publicznie (wykresy cen, Omnibus)
CREATE POLICY "Historia cen jest publiczna" ON public.deal_price_history FOR SELECT USING (true);

-- Okazje: Publiczny odczyt dla ofert zwykłych, oferty VIP tylko z aktywną subskrypcją połączoną po ID
CREATE POLICY "Okazje widoczne dla uprawnionych" ON public.deals FOR SELECT USING (
    is_vip_only = false OR 
    EXISTS (
        SELECT 1 FROM public.subscriptions 
        WHERE subscriptions.user_id = auth.uid() 
          AND subscriptions.status = 'active'
    )
);

-- Głosy i komentarze
CREATE POLICY "Głosy są widoczne" ON public.votes FOR SELECT USING (true);
CREATE POLICY "Zalogowani mogą głosować" ON public.votes FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Komentarze są widoczne" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Zalogowani mogą komentować" ON public.comments FOR INSERT WITH CHECK (user_id = auth.uid());

-- ====================================================================
-- DANE POCZĄTKOWE (SEED DATA)
-- ====================================================================
INSERT INTO public.categories (id, name, description, icon) VALUES
('narzedzia', 'Narzędzia i Warsztat', 'Wkrętarki, młotowiertarki, klucze i sprzęt do garażu', 'Wrench'),
('motoryzacja', 'Motoryzacja i Garaż', 'Klucze do kół, chemia samochodowa, prostowniki i myjki', 'Car'),
('dom-ogrod', 'Dom i Ogród', 'Kosiarki, sprzęt ogrodowy, naprawy domowe i hydraulika', 'Home'),
('elektronika', 'Elektronika i Gadżety', 'Multimetry, latarki taktyczne, akumulatory i gadżety', 'Zap')
ON CONFLICT (id) DO NOTHING;
