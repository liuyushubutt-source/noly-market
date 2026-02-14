"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createClient } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

interface BalanceContextType {
  user: User | null;
  balance: number;
  isLoading: boolean;
  refreshBalance: () => Promise<void>;
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

export function BalanceProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const refreshBalance = async () => {
    // Hem oturumu hem de profili tek seferde çekmeye çalışıyoruz
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (authUser) {
      setUser(authUser);
      const { data: profile } = await supabase
        .from("profiles")
        .select("tp_balance")
        .eq("id", authUser.id)
        .single();

      if (profile) setBalance(Number(profile.tp_balance));
    } else {
      setUser(null);
      setBalance(1000);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    refreshBalance();

    // Oturum değişikliklerini (Login/Logout) dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
          setUser(null);
          setBalance(0);
          setIsLoading(false);
      } else {
          refreshBalance();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <BalanceContext.Provider value={{ user, balance, isLoading, refreshBalance }}>
      {children}
    </BalanceContext.Provider>
  );
}

export const useBalance = () => {
  const context = useContext(BalanceContext);
  if (!context) throw new Error("useBalance, BalanceProvider içinde kullanılmalı.");
  return context;
};