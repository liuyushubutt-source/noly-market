"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";

type BalanceContextType = {
  user: any | null;
  balance: number;
  isLoading: boolean;
  refreshBalance: () => Promise<void>;
};

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

export function BalanceProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  // 1. Bakiyeyi Veritabanından Çekme Fonksiyonu
  const refreshBalance = async () => {
    if (!user) return;
    const { data } = await supabase.from("profiles").select("tp_balance").eq("id", user.id).single();
    if (data) {
      setBalance(data.tp_balance || 0);
    }
  };

  // 2. Kullanıcıyı ve İlk Bakiyeyi Yükle
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data } = await supabase.from("profiles").select("tp_balance").eq("id", user.id).single();
        if (data) setBalance(data.tp_balance || 0);
      }
      setIsLoading(false);
    };
    init();
  }, []);

  // 3. İŞTE SİHRİN OLDUĞU YER: SİSTEMDEKİ TÜM TP ARTIŞLARINI (ÖDÜLLERİ) DİNLE
  useEffect(() => {
    const handleTpUpdate = (e: CustomEvent) => {
      // Ödül butonlarından gelen TP miktarını anında mevcut bakiyeye ekle
      setBalance((prevBalance) => prevBalance + e.detail);
    };

    // Sinyali dinlemeye başla
    window.addEventListener('tp-update', handleTpUpdate as EventListener);
    
    // Temizlik
    return () => window.removeEventListener('tp-update', handleTpUpdate as EventListener);
  }, []);

  return (
    <BalanceContext.Provider value={{ user, balance, isLoading, refreshBalance }}>
      {children}
    </BalanceContext.Provider>
  );
}

export const useBalance = () => {
  const context = useContext(BalanceContext);
  if (context === undefined) {
    throw new Error("useBalance must be used within a BalanceProvider");
  }
  return context;
};