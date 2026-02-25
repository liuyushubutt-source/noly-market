"use client";

import { useState } from "react";
import { useBalance } from "@/context/balance-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase"; // veya kendi supabase importun
import { Loader2, Twitter, MessageCircle, Link as LinkIcon, CheckCircle2, AlertCircle, Wallet } from "lucide-react";

export function PredictionPanel({ market }: { market: any }) {
  const { user, balance, refreshBalance } = useBalance();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedSide, setSelectedSide] = useState<"YES" | "NO" | number | null>(null);
  const supabase = createClient();

  const isLocked = market.status !== 'active';

  const getProfessionalShareText = () => {
    let oddsText = "";
    if (market.market_type === 'binary' && market.yes_probability !== undefined) {
      const yesPct = Math.round(market.yes_probability * 100);
      const noPct = Math.round((1 - market.yes_probability) * 100);
      oddsText = `📊 Oranlar: EVET %${yesPct} | HAYIR %${noPct}\n\n`;
    } else if (market.market_options && market.market_options.length > 0) {
      const topOption = [...market.market_options].sort((a, b) => Number(b.probability) - Number(a.probability))[0];
      const topPct = Math.round(topOption.probability * 100);
      oddsText = `📊 Favori: ${topOption.name} (%${topPct})\n\n`;
    }
    const statusText = isLocked ? "🛑 Bu piyasa sonuçlandı! Sonuçları gör:" : "📉📈 Noly Market'te güncel verilere göz at ve pozisyonunu al.";
    return `"${market.question}"\n\n${oddsText}${statusText}`;
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : `https://nolymarket.com/market/${market.slug}`;
  const shareText = getProfessionalShareText();

  const shareOnTwitter = () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  const shareOnWhatsApp = () => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + "\n\n" + shareUrl)}`, '_blank');
  const copyLink = () => { navigator.clipboard.writeText(shareUrl); toast.success("Piyasa bağlantısı kopyalandı!"); };

  const handlePredict = async () => {
    if (isLocked) return toast.error("Bu piyasa kapandığı için işlem yapılamaz.");
    if (!user) return toast.error("Tahmin yapmak için giriş yapmalısın!");
    if (!selectedSide) return toast.error("Lütfen bir seçenek belirleyin.");
    
    const safeAmount = Math.floor(Number(amount));
    if (!safeAmount || safeAmount <= 0) return toast.error("Geçerli bir tam sayı girin.");
    if (safeAmount > balance) return toast.error("Yetersiz TP bakiyesi!");

    setLoading(true);
    const { error } = await supabase.rpc('place_prediction', {
      p_market_id: market.id,
      p_user_id: user.id,
      p_amount_tp: safeAmount,
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

  // 🔒 KİLİTLİ DURUM EKRANI (Daha Kompakt)
  if (isLocked) {
    return (
      <div className="bg-secondary/10 border border-dashed border-border/50 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-sm flex flex-col items-center justify-center text-center space-y-3 sm:space-y-4">
        <div className={`p-3 sm:p-4 rounded-full ${market.status === 'resolved' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
           {market.status === 'resolved' ? <CheckCircle2 size={32} /> : <AlertCircle size={32} />}
        </div>
        <div>
          <h3 className="font-black text-lg sm:text-xl mb-0.5 sm:mb-1">
            {market.status === 'resolved' ? 'Piyasa Sonuçlandı' : 'Piyasa İptal Edildi'}
          </h3>
          <p className="text-[11px] sm:text-sm text-muted-foreground font-medium">Bu piyasa kapandığı için yeni işlem alınmamaktadır.</p>
        </div>
        
        <div className="w-full pt-3 sm:pt-4 border-t border-border/50 mt-3 sm:mt-4">
          <p className="text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 sm:mb-3">Sonucu Paylaş</p>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 h-8 sm:h-10 bg-background hover:bg-[#1DA1F2] hover:text-white transition-colors border-border/50" onClick={shareOnTwitter}><Twitter size={14} className="sm:w-4 sm:h-4" /></Button>
            <Button variant="outline" className="flex-1 h-8 sm:h-10 bg-background hover:bg-[#25D366] hover:text-white transition-colors border-border/50" onClick={shareOnWhatsApp}><MessageCircle size={14} className="sm:w-4 sm:h-4" /></Button>
            <Button variant="outline" className="flex-1 h-8 sm:h-10 bg-background hover:bg-secondary transition-colors border-border/50" onClick={copyLink}><LinkIcon size={14} className="sm:w-4 sm:h-4" /></Button>
          </div>
        </div>
      </div>
    );
  }

  // 📈 AÇIK PİYASA (PREMIUM İŞLEM PANELİ)
  return (
    <div className="bg-card border border-border/50 sm:border-2 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-md sm:shadow-xl space-y-4 sm:space-y-5 relative overflow-hidden">
      <h3 className="font-black text-base sm:text-xl tracking-tight flex items-center justify-between">
        Pozisyon Al
        <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse sm:hidden"></span>
      </h3>

      {/* SEÇENEKLER ALANI (Sıkı ve Şık) */}
      <div className="grid grid-cols-1 gap-2 sm:gap-2.5">
        {market.market_type === 'binary' ? (
          <div className="flex gap-2 sm:gap-3">
            <Button 
              variant="outline"
              className={`flex-1 h-11 sm:h-14 font-black text-xs sm:text-base rounded-xl transition-all duration-200 border-border/50 ${selectedSide === "YES" ? "bg-green-500 hover:bg-green-600 text-white border-green-500 shadow-md shadow-green-500/20 ring-2 ring-green-500/50 ring-offset-2 ring-offset-background" : "bg-background hover:border-green-500/40 hover:bg-green-500/5 text-foreground"}`}
              onClick={() => setSelectedSide("YES")}
            >
              EVET
            </Button>
            <Button 
              variant="outline"
              className={`flex-1 h-11 sm:h-14 font-black text-xs sm:text-base rounded-xl transition-all duration-200 border-border/50 ${selectedSide === "NO" ? "bg-red-500 hover:bg-red-600 text-white border-red-500 shadow-md shadow-red-500/20 ring-2 ring-red-500/50 ring-offset-2 ring-offset-background" : "bg-background hover:border-red-500/40 hover:bg-red-500/5 text-foreground"}`}
              onClick={() => setSelectedSide("NO")}
            >
              HAYIR
            </Button>
          </div>
        ) : (
          market.market_options.map((opt: any) => (
            <Button 
              key={opt.id}
              variant="outline"
              className={`h-10 sm:h-12 justify-between px-3 sm:px-4 font-bold text-xs sm:text-sm rounded-xl transition-all duration-200 border-border/50 ${selectedSide === opt.id ? "bg-primary text-primary-foreground border-primary shadow-md ring-2 ring-primary/50 ring-offset-1 ring-offset-background" : "bg-background hover:border-primary/40 hover:bg-primary/5 text-foreground"}`}
              onClick={() => setSelectedSide(opt.id)}
            >
              <span className="truncate pr-2">{opt.name}</span>
              <span className="shrink-0 opacity-80">%{Math.round(opt.probability * 100)}</span>
            </Button>
          ))
        )}
      </div>

      {/* YATIRIM MİKTARI (Input) */}
      <div className="space-y-1.5 sm:space-y-2 bg-secondary/20 p-3 sm:p-4 rounded-xl border border-border/50">
        <div className="flex justify-between text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          <span>Tutar</span>
          <span className="flex items-center gap-1"><Wallet size={10} className="text-primary"/> Cüzdan: {Math.round(balance).toLocaleString()}</span>
        </div>
        <div className="relative flex items-center">
          <Input 
            type="number" 
            step="1" 
            min="1" 
            placeholder="0" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="h-10 sm:h-12 text-base sm:text-xl font-black bg-background border-border/50 focus-visible:ring-1 focus-visible:ring-primary pr-12 rounded-lg sm:rounded-xl w-full shadow-inner"
          />
          <span className="absolute right-3 font-black text-xs sm:text-sm text-muted-foreground">TP</span>
        </div>
      </div>

      {/* ONAY BUTONU */}
      <Button 
        disabled={loading || !user || !amount || !selectedSide} 
        className="w-full h-11 sm:h-14 text-sm sm:text-lg font-black shadow-lg shadow-primary/20 rounded-xl transition-all active:scale-[0.98]"
        onClick={handlePredict}
      >
        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (user ? "İŞLEMİ ONAYLA" : "GİRİŞ YAP")}
      </Button>

      {/* PAYLAŞIM ALANI */}
      <div className="pt-3 sm:pt-4 border-t border-border/50 mt-1 sm:mt-2">
        <div className="flex items-center justify-between gap-2">
           <span className="text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest hidden sm:block">Piyasayı Paylaş</span>
           <div className="flex gap-1.5 sm:gap-2 w-full sm:w-auto">
            <Button variant="ghost" size="sm" className="flex-1 sm:flex-none h-8 sm:h-9 bg-secondary/30 hover:bg-[#1DA1F2] hover:text-white transition-colors rounded-lg px-0 sm:px-3" onClick={shareOnTwitter} title="X'te Paylaş"><Twitter size={14} className="sm:mr-1.5" /><span className="hidden sm:inline-block text-[10px] font-bold">Twitter</span></Button>
            <Button variant="ghost" size="sm" className="flex-1 sm:flex-none h-8 sm:h-9 bg-secondary/30 hover:bg-[#25D366] hover:text-white transition-colors rounded-lg px-0 sm:px-3" onClick={shareOnWhatsApp} title="WhatsApp'ta Paylaş"><MessageCircle size={14} className="sm:mr-1.5" /><span className="hidden sm:inline-block text-[10px] font-bold">WhatsApp</span></Button>
            <Button variant="ghost" size="sm" className="flex-1 sm:flex-none h-8 sm:h-9 bg-secondary/30 hover:bg-secondary/80 transition-colors rounded-lg px-0 sm:px-3" onClick={copyLink} title="Bağlantıyı Kopyala"><LinkIcon size={14} className="sm:mr-1.5" /><span className="hidden sm:inline-block text-[10px] font-bold">Kopyala</span></Button>
          </div>
        </div>
      </div>
      
    </div>
  );
}