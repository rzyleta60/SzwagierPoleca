# 🗄️ Zaktualizowany Schemat i Architektura Bazy Danych: szwagierpoleca.pl

Wizualna mapa powiązań relacyjnych (PostgreSQL / Supabase) po wdrożeniu zmian architektonicznych:
1. **Relacja M:N (Wiele-do-Wielu)**: Jeden produkt może należeć do wielu kategorii jednocześnie (`deal_categories`).
2. **Sub-tabela historii cen z 30 dni**: Śledzenie historii cen i dyrektywa Omnibus (`deal_price_history`).
3. **Ujednolicona tabela użytkowników**: `profiles` jako jedyna tabela użytkowników z polami `email` i `password_hash`.
4. **Tabela zamówień**: Nowa tabela `orders` ewidencjonująca płatności i zamówienia.
5. **Precyzyjna relacja subskrypcji po ID**: `profiles.active_subscription_id` oraz `subscriptions.user_id` powiązane bezpośrednio po kluczach ID.

---

## 1. Zaktualizowany Diagram Relacji Bazy Danych (ERD)

```mermaid
erDiagram
    PROFILES ||--o| SUBSCRIPTIONS : "posiada aktywny abonament po ID (active_subscription_id)"
    PROFILES ||--o{ ORDERS : "składa zamówienia po ID (user_id)"
    PROFILES ||--o{ DEALS : "dodaje okazje (author_id)"
    PROFILES ||--o{ VOTES : "oddaje głos (user_id)"
    PROFILES ||--o{ COMMENTS : "pisze komentarz (user_id)"

    DEALS ||--o{ DEAL_CATEGORIES : "przypisany do (deal_id)"
    CATEGORIES ||--o{ DEAL_CATEGORIES : "zawiera okazje (category_id)"
    DEALS ||--o{ DEAL_PRICE_HISTORY : "historia cen z 30 dni (deal_id)"
    DEALS ||--o{ VOTES : "oceniany przez głosy (deal_id)"
    DEALS ||--o{ COMMENTS : "posiada opinie (deal_id)"

    ORDERS }o--o| SUBSCRIPTIONS : "opłaca subskrypcję (subscription_id)"

    PROFILES {
        uuid id PK "Unikalny identyfikator użytkownika (UUID)"
        string email UK "Adres e-mail użytkownika"
        string password_hash "Bezpieczny hash hasła (bcrypt/argon2)"
        string username UK "Unikalny nick w serwisie"
        string full_name "Imię i nazwisko"
        string avatar_url "Link do zdjęcia profilowego"
        string stripe_customer_id "Identyfikator klienta w Stripe (cus_...)"
        string active_subscription_id FK "Klucz obcy do subscriptions(id)"
        string role "Rola: 'user' lub 'szwagier_admin'"
        timestamptz created_at "Data rejestracji"
        timestamptz updated_at "Data aktualizacji"
    }

    SUBSCRIPTIONS {
        string id PK "Identyfikator subskrypcji Stripe (sub_...)"
        uuid user_id FK "Powiązanie po ID z profiles(id)"
        string status "Status: active, trialing, past_due, canceled"
        string price_id "ID planu w Stripe (price_...)"
        boolean cancel_at_period_end "Czy anulowano na koniec okresu"
        timestamptz current_period_start "Początek bieżącego okresu"
        timestamptz current_period_end "Koniec opłaconego okresu"
        timestamptz created_at "Data startu subskrypcji"
        timestamptz updated_at "Data aktualizacji"
    }

    ORDERS {
        uuid id PK "Unikalny identyfikator zamówienia"
        uuid user_id FK "Klucz obcy po ID do profiles(id)"
        string order_number UK "Numer zamówienia (np. SZW/2026/11/001)"
        numeric total_amount "Łączna kwota do zapłaty (PLN)"
        string currency "Waluta: 'PLN'"
        string status "Status: pending, paid, failed, refunded"
        string payment_method "Metoda: stripe_card, blik, apple_pay"
        string stripe_checkout_session_id "Identyfikator sesji Stripe Checkout"
        string stripe_payment_intent_id "Identyfikator transakcji Stripe"
        string subscription_id FK "Opcjonalny link do subscriptions(id)"
        jsonb items "Lista kupionych pozycji (nazwa, ilość, cena)"
        timestamptz created_at "Data złożenia zamówienia"
        timestamptz updated_at "Data aktualizacji"
    }

    DEALS {
        uuid id PK "Unikalny identyfikator okazji (UUID)"
        string title "Pełna nazwa i model sprzętu"
        string slug UK "Adres URL przyjazny SEO"
        uuid author_id FK "Klucz obcy do profiles(id)"
        text description "Opis parametrów sprzętu"
        text szwagier_verdict "Opinia, test i werdykt Szwagra"
        text_array pros "Wypunktowane zalety sprzętu"
        text_array cons "Wypunktowane wady i mankamenty"
        numeric original_price "Cena regularna (PLN)"
        numeric deal_price "Aktualna cena w promocji (PLN)"
        int discount_percent "Wyliczony automatycznie % rabatu"
        numeric lowest_price_30_days "Najniższa cena z 30 dni (Omnibus)"
        string coupon_code "Kod rabatowy do sklepu"
        string deal_url "Bezpośredni link do sklepu"
        string image_url "Zdjęcie produktu"
        string store_name "Sklep: Castorama, Lidl, Allegro itp."
        string badge "Odznaka: Atest Szwagra, Błąd Cenowy..."
        int temperature "Gorącość oferty (°C)"
        int upvotes "Liczba głosów 'Warto'"
        int downvotes "Liczba głosów 'Nie warto'"
        boolean is_vip_only "Czy oferta tylko dla Klubu VIP"
        boolean is_featured "Wyróżnienie na stronie głównej"
        timestamptz created_at "Data publikacji"
        timestamptz updated_at "Data aktualizacji"
    }

    CATEGORIES {
        string id PK "Slug kategorii (np. 'narzedzia', 'motoryzacja')"
        string name "Nazwa kategorii"
        string description "Opis kategorii"
        string icon "Nazwa ikony Lucide"
        timestamptz created_at "Data utworzenia"
    }

    DEAL_CATEGORIES {
        uuid deal_id PK,FK "Klucz obcy do deals(id)"
        string category_id PK,FK "Klucz obcy do categories(id)"
        timestamptz created_at "Data przypisania"
    }

    DEAL_PRICE_HISTORY {
        uuid id PK "Unikalny identyfikator wpisu historii"
        uuid deal_id FK "Klucz obcy do deals(id)"
        numeric price "Zarejestrowana cena w danym momencie (PLN)"
        timestamptz recorded_at "Data i godzina pomiaru ceny"
    }

    VOTES {
        uuid id PK "Unikalny identyfikator głosu"
        uuid deal_id FK "Klucz obcy do deals(id)"
        uuid user_id FK "Klucz obcy do profiles(id)"
        string vote_type "Typ głosu: 'up' lub 'down'"
        timestamptz created_at "Data oddania głosu"
    }

    COMMENTS {
        uuid id PK "Unikalny identyfikator komentarza"
        uuid deal_id FK "Klucz obcy do deals(id)"
        uuid user_id FK "Klucz obcy do profiles(id)"
        text content "Treść opinii majsterkowicza"
        timestamptz created_at "Data dodania"
    }
```

---

## 2. Architektura Przepływu Danych i Integracji ze Stripe

```mermaid
flowchart TD
    subgraph Klient["👤 Interfejs Użytkownika (Next.js 14)"]
        UI_Home[Strona Główna / Okazje]
        UI_Deals[Karta Okazji + Wykres Cen 30 Dni]
        UI_Checkout[Zakup VIP / Płatność]
    end

    subgraph Backend["⚡ Backend Next.js API"]
        API_Checkout[/api/checkout]
        API_Webhook[/api/webhook]
        API_Vote[/api/deals/vote]
    end

    subgraph BazaPostgres["🐘 Baza Supabase (PostgreSQL)"]
        TabProfiles[(profiles)]
        TabSubscriptions[(subscriptions)]
        TabOrders[(orders)]
        TabDeals[(deals)]
        TabDealCategories[(deal_categories)]
        TabCategories[(categories)]
        TabPriceHistory[(deal_price_history)]
        TabVotes[(votes)]
        TabComments[(comments)]
    end

    subgraph StripeAPI["💳 Bramka Płatności Stripe"]
        StripeSession[Stripe Checkout Session]
        StripeEvent[Zdarzenie Webhook: checkout.session.completed]
    end

    %% Przepływ przeglądania okazji
    UI_Home -->|Filtrowanie wielokrotnych kategorii| TabDealCategories
    TabDealCategories --> TabCategories
    TabDealCategories --> TabDeals
    UI_Deals -->|Pobranie historii cen z 30 dni| TabPriceHistory
    TabPriceHistory -->|Trigger wyliczający najniższą cenę| TabDeals

    %% Przepływ zamówienia i subskrypcji
    UI_Checkout -->|1. Inicjalizacja zamówienia| API_Checkout
    API_Checkout -->|2. Utworzenie rekordu 'pending'| TabOrders
    API_Checkout -->|3. Wygenerowanie sesji| StripeSession
    StripeSession -->|4. Klient płaci (Karta / BLIK)| StripeEvent
    StripeEvent -->|5. Potwierdzenie webhookiem| API_Webhook
    API_Webhook -->|6. Aktualizacja zamówienia na 'paid'| TabOrders
    API_Webhook -->|7. Zapis subskrypcji z ID| TabSubscriptions
    API_Webhook -->|8. Powiązanie po ID: active_subscription_id| TabProfiles
```

---

## 3. Podsumowanie Wprowadzonych Usprawnień

| Element | Wcześniej | Teraz (Po Zmianach) | Dlaczego tak jest lepiej? |
| :--- | :--- | :--- | :--- |
| **Relacja Okazja ➔ Kategoria** | 1:N (jedno pole `category_id` w `deals`) | **M:N (Tabela łącząca `deal_categories`)** | Sprzęt może należeć do kilku kategorii (np. klucz pneumatyczny jest jednocześnie w *Narzędziach* i *Motoryzacji*). |
| **Historia cen** | Brak sub-tabeli | **Sub-tabela `deal_price_history` z indeksem 30 dni** | Pozwala rysować wykres zmian cen, wykrywać sztuczne promocje i realizować wymogi unijnej dyrektywy Omnibus. |
| **Tabela użytkowników** | Dwie tabele (`users` + `profiles` bez hasła) | **Jedna tabela `profiles` z polami `email` i `password_hash`** | Czysta, przejrzysta architektura bez niepotrzebnych powtórzeń, pełna kontrola nad danymi konta. |
| **Tabela zamówień** | Brak | **Tabela `orders` z numerem zamówienia, kwotą i statusem** | Pełna ewidencja zakupów (Klub VIP, produkty, gadżety), historia transakcji i integracja ze Stripe. |
| **Połączenie użytkownika z subem** | Luźna flaga logiczna `is_vip: boolean` | **Ścisła relacja po ID (`active_subscription_id` ➔ `subscriptions.id`)** | Eliminacja błędów niespójności. Status VIP wynika bezpośrednio z konkretnego rekordu i ID aktywnej subskrypcji w Stripe. |
