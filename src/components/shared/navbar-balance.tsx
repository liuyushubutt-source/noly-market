"use client";

import { useState, useEffect } from "react";
import { Wallet } from "lucide-react";
import Link from "next/link";

export function NavbarBalance({ initialBalance }: { initialBalance: number }) {
  const [balance, setBalance] = useState(initialBalance);

  // Veritabanından (Sunucudan) yeni veri gelirse senkronize ol
  useEffect(() => {
    setBalance(initialBalance);
  }, [initialBalance]);

  // Zilden gelen "Ödül Alındı" sinyalini dinle ve bakiyeyi ANINDA arttır
  useEffect(() => {
    const handleTpUpdate = (e: CustomEvent) => {
      setBalance((prev) => prev + e.detail);
    };
    
    window.addEventListener('tp-update', handleTpUpdate as EventListener);
    return () => window.removeEventListener('tp-update', handleTpUpdate as EventListener);
  }, []);

  return (
    <Link href="/portfolio" className="hidden lg:flex items-center gap-2 bg-secondary/50 hover:bg-secondary px-3 py-1.5 rounded-xl border border-border/50 transition-colors">
      <Wallet size={16} className="text-primary" />
      <span className="font-bold text-sm tracking-tight">
        {Math.round(balance).toLocaleString()} <span className="text-[10px] text-muted-foreground">TP</span>
      </span>
    </Link>
  );
}