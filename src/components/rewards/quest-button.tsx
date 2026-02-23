"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { claimQuestReward } from "@/actions/reward-actions";
import { toast } from "sonner";
import { Loader2, Gift, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function QuestButton({ questId, reward, isCompleted }: { questId: string, reward: number, isCompleted: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (isCompleted) {
    return (
      <Button disabled variant="outline" className="font-bold border-green-500/30 text-green-600 bg-green-500/5 h-10 px-5">
        <CheckCircle2 size={16} className="mr-2"/> Alındı
      </Button>
    );
  }

  const handleClaim = async () => {
    setLoading(true);
    try {
      await claimQuestReward(questId, reward);
      toast.success(`Tebrikler! ${reward} TP kazandın! 🎉`);
      
      // Bakiye göstergelerini (Navbar) anında güncellemek için sinyal gönder
      window.dispatchEvent(new CustomEvent('tp-update', { detail: reward }));
      router.refresh();
      
    } catch (error: any) {
      toast.error(error.message); // Örn: "Henüz profilini doldurmamışsın."
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleClaim} disabled={loading} variant="default" className="font-bold h-10 px-5 shadow-sm bg-primary text-primary-foreground">
      {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <><Gift size={16} className="mr-2" /> Ödülü Al</>}
    </Button>
  );
}