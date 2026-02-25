"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { claimQuestReward } from "@/actions/reward-actions";
import { toast } from "sonner";
import { Loader2, CheckCircle2, Gift, Lock, ArrowRight } from "lucide-react";
import { useBalance } from "@/context/balance-context";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function QuestButton({ 
  questId, 
  reward, 
  isCompleted, 
  isEligible, 
  link 
}: { 
  questId: string; 
  reward: number; 
  isCompleted: boolean; 
  isEligible: boolean; 
  link: string;
}) {
  const [loading, setLoading] = useState(false);
  const { refreshBalance } = useBalance();
  const router = useRouter();

  // DURUM 1: GÖREV ZATEN YAPILDI (ÖDÜL ALINDI)
  if (isCompleted) {
    return (
      <Button disabled variant="secondary" className="font-black text-green-500 bg-green-500/10 opacity-100 h-10 px-4">
        <CheckCircle2 size={18} className="mr-2" /> ALINDI
      </Button>
    );
  }

  // DURUM 2: GÖREV HENÜZ YAPILMADI (KİLİTLİ, KULLANICIYI İLGİLİ SAYFAYA YÖNLENDİR)
  if (!isEligible) {
    return (
      <Button asChild variant="outline" className="font-bold text-muted-foreground h-10 px-4 border-border/50 hover:border-primary/50 hover:text-primary transition-colors">
        <Link href={link}>
          <Lock size={14} className="mr-2 opacity-50" /> GÖREVİ YAP
        </Link>
      </Button>
    );
  }

  // DURUM 3: GÖREV YAPILDI AMA ÖDÜL ALINMADI (PARLAK BUTON)
  const handleClaim = async () => {
    setLoading(true);
    try {
      const res = await claimQuestReward(questId, reward);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(`${reward} TP Eklendi! 🎉`);
        refreshBalance();
        router.refresh();
      }
    } catch (err) {
      toast.error("Bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleClaim} disabled={loading} className="font-black h-10 px-4 bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20 hover:scale-105 transition-transform">
      {loading ? <Loader2 className="animate-spin" /> : <><Gift size={16} className="mr-2" /> ÖDÜLÜ AL</>}
    </Button>
  );
}