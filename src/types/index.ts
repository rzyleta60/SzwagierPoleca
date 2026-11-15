export type BadgeType = 
  | 'POLECENIE_SZWAGRA' 
  | 'CEBULA_DEAL' 
  | 'WOL_ROBOCZY' 
  | 'BLAD_CENOWY' 
  | 'HIT_DNIA';

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  count?: number;
}

export interface DealPriceHistory {
  id: string;
  deal_id: string;
  price: number;
  recorded_at: string;
}

export interface Deal {
  id: string;
  title: string;
  slug: string;
  category_id?: string; // dla kompatybilności wstecznej
  category_ids?: string[]; // relacja M:N: jeden produkt w wielu kategoriach
  category_name?: string;
  description: string;
  szwagier_verdict: string;
  pros: string[];
  cons: string[];
  original_price?: number;
  deal_price: number;
  discount_percent?: number;
  lowest_price_30_days?: number; // dyrektywa Omnibus (z tabeli deal_price_history)
  price_history?: DealPriceHistory[]; // sub-tabela historii cen z 30 dni
  coupon_code?: string;
  deal_url: string;
  image_url: string;
  store_name: string;
  badge: BadgeType;
  temperature: number; // np. 240 (stopnie gorącości)
  upvotes: number;
  downvotes: number;
  is_vip_only: boolean;
  is_featured: boolean;
  created_at: string;
  author?: {
    username: string;
    avatar_url?: string;
    is_vip?: boolean;
  };
  comments_count?: number;
}

export interface Subscription {
  id: string; // stripe subscription id: sub_...
  user_id: string; // powiązanie po ID z profiles.id
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete';
  price_id: string;
  cancel_at_period_end: boolean;
  current_period_start?: string;
  current_period_end?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id?: string;
  name: string;
  price: number;
  quantity: number;
  store?: string;
  image_url?: string;
  deal_url?: string;
  type?: string;
}

export interface Order {
  id: string;
  user_id: string; // powiązanie po ID z profiles.id
  order_number: string;
  total_amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';
  payment_method?: string;
  stripe_checkout_session_id?: string;
  stripe_payment_intent_id?: string;
  subscription_id?: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  password_hash?: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  stripe_customer_id?: string;
  active_subscription_id?: string; // powiązanie po ID ze subskrypcją
  subscription?: Subscription;
  is_vip?: boolean; // wyliczane po ID aktywnej subskrypcji
  role: 'user' | 'szwagier_admin';
  created_at?: string;
  updated_at?: string;
}

export interface Comment {
  id: string;
  deal_id: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  is_vip?: boolean;
  content: string;
  created_at: string;
}
