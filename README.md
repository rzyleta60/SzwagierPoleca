# 🛠️ szwagierpoleca.pl

> **Prawdziwy sprzęt • Zero ściemy • Najlepsze okazje narzędziowe i błędy cenowe przetestowane w garażu.**

Nowoczesny, w pełni responsywny portal z okazjami, poleceniami sprzętu warsztatowego, motoryzacyjnego i domowego, zintegrowany ze **Stripe** (subskrypcje VIP) oraz **Supabase** (baza PostgreSQL, autoryzacja i uprawnienia RLS).

---

## 🚀 Technologie

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server & Client Components)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + Lucide Icons
- **Płatności & Monetyzacja**: [Stripe](https://stripe.com/) (Checkout Sessions, Customer Portal, Webhooki, plany miesięczne i roczne)
- **Baza Danych & Auth**: [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security, Auth, Triggers)
- **Język**: TypeScript

---

## 📦 Struktura Projektu

```text
szwagierpoleca/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── checkout/route.ts   # Inicjalizacja Stripe Checkout dla Klubu VIP
│   │   │   ├── portal/route.ts     # Stripe Customer Billing Portal
│   │   │   ├── webhook/route.ts    # Obsługa zdarzeń Stripe (aktywacja VIP)
│   │   │   └── deals/vote/route.ts # Głosowanie (Warto / Nie warto)
│   │   ├── auth/
│   │   │   ├── login/page.tsx      # Logowanie (Hasło + Magic Link)
│   │   │   ├── register/page.tsx   # Rejestracja z potwierdzeniem
│   │   │   └── callback/route.ts   # Obsługa przekierowania Auth Supabase
│   │   ├── okazje/
│   │   │   ├── page.tsx            # Katalog wszystkich okazji z filtrami i sortowaniem
│   │   │   └── [id]/page.tsx       # Karta szczegółowa: werdykt szwagra, plusy/minusy, opinie
│   │   ├── dodaj-okazje/page.tsx   # Formularz zgłaszania nowej okazji
│   │   ├── vip/page.tsx            # Strona Klubu VIP z cennikiem i płatnościami Stripe
│   │   ├── layout.tsx              # Główny layout (Header, Footer, Meta OG)
│   │   ├── page.tsx                # Strona główna z sekcją Hero, gorącymi okazjami i zasadami
│   │   └── globals.css
│   ├── components/
│   │   ├── Header.tsx              # Nawigacja, wyszukiwarka, linki VIP i logowanie
│   │   ├── Footer.tsx              # Stopka, gwarancja szwagra, informacje prawne
│   │   ├── DealCard.tsx            # Karta okazji (temperatura, kupony, sklep, odznaki)
│   │   ├── Badge.tsx               # Odznaki (Atest Szwagra 🏆, Cebula Deal 🧅, Błąd Cenowy ⚡)
│   │   ├── VoteButtons.tsx         # Przyciski głosowania z natychmiastowym feedbackiem UI
│   │   ├── CategoryNav.tsx         # Poziome filtrowanie kategorii z ikonami
│   │   ├── HeroBanner.tsx          # Baner powitalny z metrykami zaufania
│   │   ├── VipPromoBanner.tsx      # Baner zachęcający do subskrypcji VIP
│   │   └── SzwagierRules.tsx       # Kodeks Szwagra: dlaczego nam ufasz
│   ├── data/
│   │   └── mock-deals.ts           # Bogata baza gotowych ofert i opinii
│   ├── lib/
│   │   ├── stripe.ts               # Klient Stripe SDK i konfiguracja planów VIP
│   │   ├── supabase/
│   │   │   ├── client.ts           # Klient przeglądarkowy (@supabase/ssr)
│   │   │   ├── server.ts           # Klient serwerowy z obsługą ciasteczek
│   │   │   └── admin.ts            # Klient z rolą administracyjną (service role)
│   │   └── utils.ts
│   └── types/
│       └── index.ts                # Definicje typów TypeScript
├── supabase/
│   └── schema.sql                  # Gotowy skrypt SQL do utworzenia bazy w Supabase
├── .env.example                    # Wzór zmiennych środowiskowych
├── package.json
└── tailwind.config.ts
```

---

## ⚡ Szybki Start

### 1. Klonowanie i instalacja zależności

```bash
cd /Users/sebastianrzetelny/Documents/szwagierpoleca
npm install
```

### 2. Konfiguracja zmiennych środowiskowych

Skopiuj plik `.env.example` do `.env.local`:

```bash
cp .env.example .env.local
```

Uzupełnij klucze:
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# SUPABASE (znajdziesz w Settings -> API w panelu Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://twój-projekt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=twój-anon-key
SUPABASE_SERVICE_ROLE_KEY=twój-service-role-key

# STRIPE (znajdziesz w Dashboard -> Developers -> API keys)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ID Produktów Stripe (Subscriptions)
STRIPE_PRICE_ID_VIP_MONTHLY=price_...
STRIPE_PRICE_ID_VIP_YEARLY=price_...
```

> **Wskazówka:** Projekt działa w pełni natychmiast z domyślnymi danymi demonstracyjnymi (mock data), nawet przed skonfigurowaniem zewnętrznych kont Stripe i Supabase!

### 3. Konfiguracja Bazy Danych Supabase

1. Załóż darmowy projekt na [supabase.com](https://supabase.com).
2. Przejdź do zakładki **SQL Editor**.
3. Otwórz plik `supabase/schema.sql` z tego projektu, wklej jego treść i kliknij **Run**.
4. Utworzą się automatycznie:
   - Tabele: `deals`, `categories`, `profiles`, `votes`, `comments`, `subscriptions`.
   - Zabezpieczenia **Row Level Security (RLS)**.
   - Automatyczny trigger tworzenia profilu przy rejestracji użytkownika.
   - Początkowe kategorie.

### 4. Konfiguracja Stripe (Płatności i Klub VIP)

1. W panelu [Stripe Dashboard](https://dashboard.stripe.com/test/products) utwórz produkt **Klub Szwagra VIP**:
   - Plan 1: 19,99 PLN miesięcznie cyklicznie -> skopiuj `Price ID` do `STRIPE_PRICE_ID_VIP_MONTHLY`
   - Plan 2: 149,00 PLN rocznie cyklicznie -> skopiuj `Price ID` do `STRIPE_PRICE_ID_VIP_YEARLY`
2. Włącz metody płatności: **Karty płatnicze**, **BLIK**, **Apple Pay / Google Pay**.
3. Aby lokalnie testować webhooki:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhook
   ```

### 5. Uruchomienie serwera deweloperskiego

```bash
npm run dev
```

Otwórz w przeglądarce [http://localhost:3000](http://localhost:3000).

---

## 💎 Główne Funkcjonalności

- 🔥 **System Stopni Gorącości (°C)**: Użytkownicy oceniają opłacalność ofert głosami „Warto / Nie warto”.
- 🏆 **Odznaki Jakości Szwagra**:
  - `Atest Szwagra 🏆` – sprzęt sprawdzony w boju, nie do zajechania.
  - `Cebula Deal 🧅` – bezkonkurencyjny stosunek ceny do możliwości.
  - `Błąd Cenowy ⚡` – pomyłka cenowa sklepu, natychmiastowy zakup.
  - `Wół Roboczy 🔨` – narzędzie do ciężkiej, codziennej pracy.
- 💬 **Recenzje i Testy w Garażu**: Każda oferta posiada szczegółowy werdykt, wypunktowane zalety i wady.
- 👑 **Klub Szwagra VIP (Stripe)**:
  - Automatyczna integracja ze Stripe Checkout.
  - Dostęp do ukrytych deali i natychmiastowych alertów o błędach.
  - Specjalna odznaka „Złoty Szwagier” przy komentarzach i w profilu.
- 🛡️ **Bezpieczna Autoryzacja (Supabase)**: Rejestracja, logowanie tradycyjne oraz Magic Link bezhasłowy.
