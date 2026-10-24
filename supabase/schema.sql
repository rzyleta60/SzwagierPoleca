-- ====================================================================
-- SCHEMA BAZY DANYCH: szwagierpoleca.pl (Supabase PostgreSQL)
-- ====================================================================

-- 1. Tabela kategorii
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabela profili użytkowników (powiązana z Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    is_vip BOOLEAN DEFAULT false,
    stripe_customer_id TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'szwagier_admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabela okazji i rekomendacji sprzętu
CREATE TABLE IF NOT EXISTS public.deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    szwagier_verdict TEXT NOT NULL, -- Prawdziwa opinia Szwagra
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
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabela głosów (Warto / Nie warto)
CREATE TABLE IF NOT EXISTS public.votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(deal_id, user_id)
);

-- 5. Tabela komentarzy
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Tabela subskrypcji Stripe (Klub Szwagra VIP)
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id TEXT PRIMARY KEY, -- stripe subscription id
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    price_id TEXT NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT false,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Włączenie RLS (Row Level Security)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Polityki RLS
-- Kategorie: Odczyt dla wszystkich
CREATE POLICY "Kategorie widoczne dla każdego" ON public.categories FOR SELECT USING (true);

-- Profile: Każdy widzi profile, edycja własnego profilu
CREATE POLICY "Profile są publiczne" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Użytkownik może edytować swój profil" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Okazje: Publiczny odczyt (chyba że VIP_only i użytkownik nie jest VIP)
CREATE POLICY "Okazje widoczne dla każdego" ON public.deals FOR SELECT USING (
    is_vip_only = false OR 
    (auth.uid() IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_vip = true
    ))
);
CREATE POLICY "Zalogowani mogą dodawać okazje" ON public.deals FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Głosy: Odczyt dla każdego, głosowanie dla zalogowanych
CREATE POLICY "Głosy są widoczne" ON public.votes FOR SELECT USING (true);
CREATE POLICY "Zalogowani mogą głosować" ON public.votes FOR ALL USING (auth.uid() = user_id);

-- Komentarze: Odczyt dla każdego, dodawanie dla zalogowanych
CREATE POLICY "Komentarze są widoczne" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Zalogowani mogą dodawać komentarze" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Automatyczny trigger tworzenia profilu przy rejestracji w Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'full_name', 'Szwagier'),
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- PRZYKŁADOWE DANE POCZĄTKOWE (SEED DATA)
INSERT INTO public.categories (id, name, description, icon) VALUES
('narzedzia', 'Narzędzia i Warsztat', 'Wkrętarki, młotowiertarki, klucze i sprzęt do garażu', 'Wrench'),
('motoryzacja', 'Motoryzacja i Garaż', 'Klucze do kół, chemia samochodowa, prostowniki i myjki', 'Car'),
('dom-ogrod', 'Dom i Ogród', 'Kosiarki, sprzęt ogrodowy, naprawy domowe i hydraulika', 'Home'),
('elektronika', 'Elektronika i Gadżety', 'Multimetry, latarki taktyczne, akumulatory i gadżety', 'Zap')
ON CONFLICT (id) DO NOTHING;
