"use client";

import { useState } from "react";
import { useBalance } from "@/context/balance-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase";
import { Loader2, Twitter, MessageCircle, Link as LinkIcon } from "lucide-react";

export function PredictionPanel({ market }: { market: any }) {
  const { user, balance, refreshBalance } = useBalance();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedSide, setSelectedSide] = useState<"YES" | "NO" | number | null>(null);
  const supabase = createClient();

  // --- YENİ VE PROFESYONEL PAYLAŞIM METNİ OLUŞTURUCU ---
  const getProfessionalShareText = () => {
    let oddsText = "";

    if (market.market_type === 'binary' && market.yes_probability !== undefined) {
      const yesPct = Math.round(market.yes_probability * 100);
      const noPct = Math.round((1 - market.yes_probability) * 100);
      oddsText = `📊 Oranlar: EVET %${yesPct} | HAYIR %${noPct}\n\n`;
    } else if (market.market_options && market.market_options.length > 0) {
      // Çoklu seçeneklerde en yüksek ihtimalli (favori) olanı bul
      const topOption = [...market.market_options].sort((a, b) => Number(b.probability) - Number(a.probability))[0];
      const topPct = Math.round(topOption.probability * 100);
      oddsText = `📊 Favori: ${topOption.name} (%${topPct})\n\n`;
    }

    // "\n" ifadeleri Twitter ve WhatsApp'ta alt satıra geçmeyi sağlar
    return `"${market.question}"\n\n${oddsText}Noly Market'te güncel verilere göz at ve pozisyonunu al. 📉📈`;
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : `https://nolymarket.com/market/${market.slug}`;
  const shareText = getProfessionalShareText();

  const shareOnTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareOnWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + "\n\n" + shareUrl)}`, '_blank');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Piyasa bağlantısı kopyalandı!");
  };
  // --------------------------------------------------

  const handlePredict = async () => {
    if (!user) return toast.error("Tahmin yapmak için giriş yapmalısın!");
    if (!selectedSide) return toast.error("Lütfen bir seçenek belirleyin.");
    if (!amount || Number(amount) <= 0) return toast.error("Geçerli bir TP girin.");
    if (Number(amount) > balance) return toast.error("Yetersiz TP bakiyesi!");

    setLoading(true);
    
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
      refreshBalance(); 
      window.location.reload(); 
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
              className={`h-16 font-black text-lg ${selectedSide === "YES" ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}
              onClick={() => setSelectedSide("YES")}
            >
              EVET
            </Button>
            <Button 
              variant={selectedSide === "NO" ? "default" : "outline"}
              className={`h-16 font-black text-lg ${selectedSide === "NO" ? "bg-red-600 hover:bg-red-700 text-white" : ""}`}
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
            className="h-14 text-xl font-black bg-secondary/30 border-none focus-visible:ring-primary pr-12"
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

      {/* PAYLAŞIM MODÜLÜ */}
      <div className="pt-4 border-t border-border/50">
        <p className="text-[11px] font-bold text-muted-foreground text-center mb-3 uppercase tracking-wider">
          Bu Piyasayı Paylaş
        </p>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1 bg-secondary/20 hover:bg-[#1DA1F2] hover:text-white transition-colors border-none" 
            onClick={shareOnTwitter}
            title="X'te Paylaş"
          >
            <Twitter size={18} />
          </Button>
          
          <Button 
            variant="outline" 
            className="flex-1 bg-secondary/20 hover:bg-[#25D366] hover:text-white transition-colors border-none" 
            onClick={shareOnWhatsApp}
            title="WhatsApp'ta Paylaş"
          >
            <MessageCircle size={18} />
          </Button>
          
          <Button 
            variant="outline" 
            className="flex-1 bg-secondary/20 hover:bg-secondary/80 transition-colors border-none" 
            onClick={copyLink}
            title="Bağlantıyı Kopyala"
          >
            <LinkIcon size={18} />
          </Button>
        </div>
      </div>
      
    </div>
  );
}