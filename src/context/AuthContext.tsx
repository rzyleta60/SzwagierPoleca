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
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isVip: false,
  isLoading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isVip, setIsVip] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (currentUser: User) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (!error && data) {
        setProfile(data as UserProfile);
        const vipStatus = Boolean(data.active_subscription_id || data.role === 'szwagier_admin');
        setIsVip(vipStatus);
      } else {
        // Fallback: profil nie utworzony w bazie lub błąd
        setProfile(null);
        setIsVip(false);
      }
    } catch (err) {
      console.warn('Nie udało się pobrać profilu użytkownika:', err);
      setIsVip(false);
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
          setIsLoading(false);
        }
      }).catch(() => {
        if (mounted) setIsLoading(false);
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
