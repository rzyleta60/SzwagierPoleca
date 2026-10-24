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

export interface Deal {
  id: string;
  title: string;
  slug: string;
  category_id: string;
  category_name?: string;
  description: string;
  szwagier_verdict: string;
  pros: string[];
  cons: string[];
  original_price?: number;
  deal_price: number;
  discount_percent?: number;
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

export interface UserProfile {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  is_vip: boolean;
  role: 'user' | 'szwagier_admin';
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
