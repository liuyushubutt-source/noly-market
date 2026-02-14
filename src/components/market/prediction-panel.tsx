"use client";

import { useState } from "react";
import { useBalance } from "@/context/balance-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export function PredictionPanel({ market }: { market: any }) {
  const { user, balance, refreshBalance } = useBalance();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedSide, setSelectedSide] = useState<"YES" | "NO" | number | null>(null);
  const supabase = createClient();

  const handlePredict = async () => {
    if (!user) return toast.error("Tahmin yapmak için giriş yapmalısın!");
    if (!selectedSide) return toast.error("Lütfen bir seçenek belirleyin.");
    if (!amount || Number(amount) <= 0) return toast.error("Geçerli bir TP girin.");
    if (Number(amount) > balance) return toast.error("Yetersiz TP bakiyesi!");

    setLoading(true);
    
    // SQL RPC Fonksiyonumuzu çağırıyoruz
    const { error } = await supabase.rpc('place_prediction', {
      p_market_id: market.id,
      p_user_id: user.id,
      p_amount_tp: Number(amount),
      p_market_type: market.market_type,
      p_side: market.market_type === 'binary' ? selectedSide : null,
      p_option_id: market.market_type !== 'binary' ? selectedSide : null
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Öngörün başarıyla kaydedildi!");
      setAmount("");
      refreshBalance(); // Bakiyeyi anında güncelle
      window.location.reload(); // Oranları ve grafiği yenilemek için
    }
    setLoading(false);
  };

  return (
    <div className="bg-card border-2 border-border/50 rounded-3xl p-6 shadow-xl space-y-6">
      <h3 className="font-black text-xl tracking-tight">Öngörünü Yap</h3>

      {/* SEÇENEKLER */}
      <div className="grid grid-cols-1 gap-2">
        {market.market_type === 'binary' ? (
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant={selectedSide === "YES" ? "default" : "outline"}
              className={`h-16 font-black text-lg ${selectedSide === "YES" ? "bg-green-600 hover:bg-green-700" : ""}`}
              onClick={() => setSelectedSide("YES")}
            >
              EVET
            </Button>
            <Button 
              variant={selectedSide === "NO" ? "default" : "outline"}
              className={`h-16 font-black text-lg ${selectedSide === "NO" ? "bg-red-600 hover:bg-red-700" : ""}`}
              onClick={() => setSelectedSide("NO")}
            >
              HAYIR
            </Button>
          </div>
        ) : (
          market.market_options.map((opt: any) => (
            <Button 
              key={opt.id}
              variant={selectedSide === opt.id ? "default" : "outline"}
              className="h-12 justify-between px-4 font-bold"
              onClick={() => setSelectedSide(opt.id)}
            >
              <span>{opt.name}</span>
              <span className="text-primary">%{Math.round(opt.probability * 100)}</span>
            </Button>
          ))
        )}
      </div>

      {/* INPUT */}
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-black uppercase text-muted-foreground">
          <span>Yatırılacak TP</span>
          <span>Bakiye: {balance.toLocaleString()} TP</span>
        </div>
        <div className="relative">
          <Input 
            type="number" 
            placeholder="0.00" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="h-14 text-xl font-black bg-secondary/30 border-none focus-visible:ring-primary"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-muted-foreground">TP</span>
        </div>
      </div>

      <Button 
        disabled={loading || !user} 
        className="w-full h-14 text-lg font-black shadow-lg shadow-primary/20"
        onClick={handlePredict}
      >
        {loading ? <Loader2 className="animate-spin" /> : (user ? "İŞLEMİ ONAYLA" : "GİRİŞ YAPMALISIN")}
      </Button>
    </div>
  );
}