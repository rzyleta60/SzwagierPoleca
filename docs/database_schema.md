# 🗄️ Schemat i Architektura Bazy Danych: szwagierpoleca.pl

Wizualna mapa powiązań relacyjnych (PostgreSQL w chmurze Supabase) zintegrowana z autoryzacją użytkowników i subskrypcjami Stripe.

---

## 1. Diagram Relacji Bazy Danych (ERD)

```mermaid
erDiagram
    USERS ||--|| PROFILES : "1:1 trigger (on_auth_user_created)"
    PROFILES ||--o{ DEALS : "dodaje okazje (author_id)"
    CATEGORIES ||--o{ DEALS : "kategoryzuje (category_id)"
    DEALS ||--o{ VOTES : "posiada głosy (deal_id)"
    PROFILES ||--o{ VOTES : "oddaje głos (user_id)"
    DEALS ||--o{ COMMENTS : "posiada komentarze (deal_id)"
    PROFILES ||--o{ COMMENTS : "pisze komentarz (user_id)"
    PROFILES ||--o{ SUBSCRIPTIONS : "posiada subskrypcję Stripe (user_id)"

    USERS {
        uuid id PK "Identyfikator użytkownika Supabase Auth"
        string email "Adres e-mail"
        timestamptz created_at "Data rejestracji"
    }

    PROFILES {
        uuid id PK,FK "Klucz główny powiązany z auth.users.id"
        string username "Unikalny nick w serwisie"
        string full_name "Imię i nazwisko / nazwa"
        string avatar_url "Link do zdjęcia profilowego"
        boolean is_vip "Czy posiada aktywny Klub Szwagra VIP"
        string stripe_customer_id "Identyfikator klienta w Stripe (cus_...)"
        string role "Rola: 'user' lub 'szwagier_admin'"
        timestamptz created_at "Data utworzenia profilu"
        timestamptz updated_at "Data ostatniej modyfikacji"
    }

    CATEGORIES {
        string id PK "Klucz tekstowy (slug, np. 'narzedzia', 'motoryzacja')"
        string name "Wyświetlana nazwa kategorii"
        string description "Opis kategorii sprzętu"
        string icon "Nazwa ikony Lucide (Wrench, Car, Zap...)"
        timestamptz created_at "Data utworzenia"
    }

    DEALS {
        uuid id PK "Unikalny identyfikator okazji (gen_random_uuid)"
        string title "Pełna nazwa i model sprzętu"
        string slug "Unikalny adres URL (SEO-friendly)"
        string category_id FK "Powiązanie z categories(id)"
        uuid author_id FK "Powiązanie z profiles(id)"
        text description "Opis parametrów sprzętu"
        text szwagier_verdict "Opinia, test i werdykt Szwagra z garażu"
        text_array pros "Wypunktowane zalety (array tekstowy)"
        text_array cons "Wypunktowane wady i mankamenty"
        numeric original_price "Cena regularna przed promocją (PLN)"
        numeric deal_price "Aktualna cena w promocji (PLN)"
        int discount_percent "Kalkulowany automatycznie rabat procentowy"
        string coupon_code "Opcjonalny kod rabatowy do wklejenia"
        string deal_url "Bezpośredni link do sklepu"
        string image_url "Zdjęcie produktu wysokiej rozdzielczości"
        string store_name "Sklep: Castorama, Allegro, Lidl, Amazon..."
        string badge "Odznaka: Atest Szwagra, Cebula Deal, Błąd Cenowy..."
        int temperature "Gorącość oferty w stopniach Celsjusza (°C)"
        int upvotes "Liczba głosów 'Warto'"
        int downvotes "Liczba głosów 'Nie warto'"
        boolean is_vip_only "Czy okazja ukryta tylko dla członków VIP"
        boolean is_featured "Wyróżnienie na samej górze strony głównej"
        timestamptz created_at "Data publikacji"
    }

    VOTES {
        uuid id PK "Unikalny identyfikator głosu"
        uuid deal_id FK "Relacja do deals(id)"
        uuid user_id FK "Relacja do profiles(id)"
        string vote_type "Typ głosu: 'up' lub 'down'"
        timestamptz created_at "Czas oddania głosu"
    }

    COMMENTS {
        uuid id PK "Unikalny identyfikator komentarza"
        uuid deal_id FK "Relacja do deals(id)"
        uuid user_id FK "Relacja do profiles(id)"
        text content "Treść opinii lub komentarza użytkownika"
        timestamptz created_at "Data dodania"
    }

    SUBSCRIPTIONS {
        string id PK "Identyfikator subskrypcji Stripe (sub_...)"
        uuid user_id FK "Relacja do profiles(id)"
        string status "Status: 'active', 'canceled', 'past_due'"
        string price_id "Identyfikator planu w Stripe (price_...)"
        boolean cancel_at_period_end "Czy subskrypcja wygaśnie na koniec okresu"
        timestamptz current_period_end "Koniec opłaconego okresu dostępu"
        timestamptz created_at "Data zainicjowania subskrypcji"
    }
```

---

## 2. Architektura Przepływu Danych (Supabase + Stripe)

```mermaid
flowchart TD
    subgraph Uzytkownik["👤 Użytkownik / Przeglądarka"]
        Browser[Klient Next.js 14]
    end

    subgraph SupabaseAuth["🔐 Supabase Auth"]
        AuthRegister[Rejestracja e-mail / Magic Link]
        TriggerUser[Trigger: on_auth_user_created]
    end

    subgraph BazaPostgres["🐘 Baza Supabase (PostgreSQL)"]
        TabProfiles[(profiles)]
        TabCategories[(categories)]
        TabDeals[(deals)]
        TabVotes[(votes)]
        TabComments[(comments)]
        TabSubscriptions[(subscriptions)]
    end

    subgraph BramkaStripe["💳 Stripe Payments API"]
        StripeCheckout[Stripe Checkout Session]
        StripeWebhook[/api/webhook]
        CustomerPortal[Stripe Customer Portal]
    end

    %% Rejestracja
    Browser -->|1. Rejestracja| AuthRegister
    AuthRegister -->|2. Wyzwolenie triggera| TriggerUser
    TriggerUser -->|3. Utworzenie rekordu| TabProfiles

    %% Przeglądanie i interakcje
    Browser -->|Odczyt publiczny RLS| TabDeals
    Browser -->|Odczyt| TabCategories
    Browser -->|Głosowanie| TabVotes
    Browser -->|Komentowanie| TabComments
    TabVotes -->|Aktualizacja temperatury| TabDeals

    %% Płatności VIP
    Browser -->|4. Kliknięcie 'Wybierz plan'| StripeCheckout
    StripeCheckout -->|5. Płatność udana| StripeWebhook
    StripeWebhook -->|6. Aktywacja is_vip = true| TabProfiles
    StripeWebhook -->|7. Zapis subskrypcji| TabSubscriptions
    Browser -->|8. Zarządzanie subskrypcją| CustomerPortal
```

---

## 3. Zestawienie Tabel i Reguł Bezpieczeństwa (RLS)

| Tabela | Klucz Główny (PK) | Klucze Obce (FK) | Reguła RLS (Row Level Security) |
| :--- | :--- | :--- | :--- |
| **`profiles`** | `id` (UUID) | `id -> auth.users(id)` | Publiczny odczyt; edycja tylko dla właściciela konta (`auth.uid() = id`). |
| **`categories`** | `id` (TEXT) | *brak* | Publiczny odczyt dla każdego odwiedzającego. |
| **`deals`** | `id` (UUID) | `category_id -> categories(id)`<br>`author_id -> profiles(id)` | Publiczny odczyt dla standardowych okazji; okazje VIP tylko dla użytkowników z `is_vip = true`. Dodawanie dla zalogowanych. |
| **`votes`** | `id` (UUID) | `deal_id -> deals(id)`<br>`user_id -> profiles(id)` | Odczyt publiczny; dodawanie i edycja dla zalogowanego użytkownika (`UNIQUE(deal_id, user_id)` zapobiega podwójnemu głosowaniu). |
| **`comments`** | `id` (UUID) | `deal_id -> deals(id)`<br>`user_id -> profiles(id)` | Odczyt publiczny; dodawanie dla zalogowanych użytkowników. |
| **`subscriptions`**| `id` (TEXT) | `user_id -> profiles(id)` | Dostęp administracyjny (Service Role) zsynchronizowany z webhookami Stripe. |
