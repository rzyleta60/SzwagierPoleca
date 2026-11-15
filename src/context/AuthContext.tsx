'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { UserProfile } from '@/types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isVip: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  toggleTestVip: (enable: boolean, planId?: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isVip: false,
  isLoading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
  toggleTestVip: async () => false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isVip, setIsVip] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkLocalTestVip = (userId?: string) => {
    if (typeof window !== 'undefined' && userId) {
      return localStorage.getItem(`szwagier_test_vip_${userId}`) === 'true';
    }
    return false;
  };

  const fetchProfile = async (currentUser: User) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      const hasLocalTestVip = checkLocalTestVip(currentUser.id);

      if (!error && data) {
        setProfile(data as UserProfile);
        const vipStatus = Boolean(data.active_subscription_id || data.role === 'szwagier_admin' || hasLocalTestVip);
        setIsVip(vipStatus);
      } else {
        setProfile(null);
        setIsVip(hasLocalTestVip);
      }
    } catch (err) {
      console.warn('Nie udało się pobrać profilu użytkownika:', err);
      setIsVip(checkLocalTestVip(currentUser.id));
    }
  };

  const refreshProfile = async () => {
    try {
      const supabase = createClient();
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser);
      } else {
        setProfile(null);
        setIsVip(false);
      }
    } catch (err) {
      console.warn('Błąd podczas odświeżania profilu:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTestVip = async (enable: boolean, planId?: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/vip/test-activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          action: enable ? 'activate' : 'deactivate',
          planId,
        }),
      });

      if (enable) {
        if (typeof window !== 'undefined' && user?.id) {
          localStorage.setItem(`szwagier_test_vip_${user.id}`, 'true');
        }
        setIsVip(true);
      } else {
        if (typeof window !== 'undefined' && user?.id) {
          localStorage.removeItem(`szwagier_test_vip_${user.id}`);
        }
        if (typeof window !== 'undefined') {
          localStorage.removeItem('szwagier_test_vip');
        }
        setIsVip(false);
      }

      if (user) {
        await fetchProfile(user);
      }

      return response.ok;
    } catch (err) {
      console.warn('Błąd w toggleTestVip, fallback lokalny:', err);
      if (enable) {
        if (typeof window !== 'undefined' && user?.id) {
          localStorage.setItem(`szwagier_test_vip_${user.id}`, 'true');
        }
        setIsVip(true);
      } else {
        if (typeof window !== 'undefined' && user?.id) {
          localStorage.removeItem(`szwagier_test_vip_${user.id}`);
        }
        if (typeof window !== 'undefined') {
          localStorage.removeItem('szwagier_test_vip');
        }
        setIsVip(false);
      }
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    try {
      const supabase = createClient();

      supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
        if (!mounted) return;
        setUser(currentUser);
        if (currentUser) {
          fetchProfile(currentUser).finally(() => {
            if (mounted) setIsLoading(false);
          });
        } else {
          setIsVip(false);
          setIsLoading(false);
        }
      }).catch(() => {
        if (mounted) {
          setIsVip(false);
          setIsLoading(false);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (!mounted) return;
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          await fetchProfile(currentUser);
        } else {
          setProfile(null);
          setIsVip(false);
        }
        setIsLoading(false);
      });

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    } catch (err) {
      console.warn('Inicjalizacja AuthContext nie powiodła się:', err);
      setIsLoading(false);
    }
  }, []);

  const signOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      if (typeof window !== 'undefined') {
        if (user?.id) localStorage.removeItem(`szwagier_test_vip_${user.id}`);
        localStorage.removeItem('szwagier_test_vip');
      }
      setUser(null);
      setProfile(null);
      setIsVip(false);
      window.location.href = '/';
    } catch (err) {
      console.error('Błąd podczas wylogowywania:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isVip,
        isLoading,
        signOut,
        refreshProfile,
        toggleTestVip,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
