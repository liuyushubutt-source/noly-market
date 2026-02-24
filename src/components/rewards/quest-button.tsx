"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { claimQuestReward } from "@/actions/reward-actions";
import { toast } from "sonner";
import { Loader2, CheckCircle2, Gift } from "lucide-react";
import { useBalance } from "@/context/balance-context";
import { useRouter } from "next/navigation";

export function QuestButton({ questId, reward, isCompleted }: { questId: string, reward: number, isCompleted: boolean }) {
  const [loading, setLoading] = useState(false);
  const { refreshBalance } = useBalance();
  const router = useRouter();

  if (isCompleted) {
    return (
      <Button disabled variant="secondary" className="font-black text-green-500 bg-green-500/10 opacity-100 h-10 px-4">
        <CheckCircle2 size={18} className="mr-2" /> ALINDI
      </Button>
    );
  }

  const handleClaim = async () => {
    setLoading(true);
    try {
      // HATA AYIKLAMA: Terminale (F12 > Console) bak, ne gönderiyor gör.
      console.log("Ödül talebi gönderiliyor:", questId);

      const res = await claimQuestReward(questId, reward);
      
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(`${reward} TP Eklendi!`);
        refreshBalance();
        router.refresh(); // Sayfayı yenileyerek 'ALINDI' yazmasını tetikler
      }
    } catch (err) {
      toast.error("Bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleClaim} disabled={loading} className="font-black h-10 px-4">
      {loading ? <Loader2 className="animate-spin" /> : <><Gift size={16} className="mr-2" /> ÖDÜLÜ AL</>}
    </Button>
  );
}