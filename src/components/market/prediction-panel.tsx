"use client";

import { useState } from "react";
import { useBalance } from "@/context/balance-context";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase";
import { Loader2, CheckCircle2, AlertCircle, Wallet, Share2, Twitter, LinkIcon, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function PredictionPanel({ market }: { market: any }) {
  const { user, balance, refreshBalance } = useBalance();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedSide, setSelectedSide] = useState<"YES" | "NO" | number | null>(null);
  const supabase = createClient();

  const isLocked = market.status !== 'active';

  const shareUrl = typeof window !== "undefined" ? window.location.href : `https://nolymarket.com/market/${market.slug}`;

  const handleShare = (platform: 'twitter' | 'whatsapp' | 'copy') => {
    let text = `"${market.question}"\n\n📉📈 Noly Market'te pozisyonunu al.`;
    if (platform === 'twitter') window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
    if (platform === 'whatsapp') window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + "\n\n" + shareUrl)}`, '_blank');
    if (platform === 'copy') { navigator.clipboard.writeText(shareUrl); toast.success("Bağlantı kopyalandı!"); }
  };

  const handlePredict = async () => {
    if (isLocked) return toast.error("Piyasa kapalı.");
    if (!user) return toast.error("Giriş yapmalısın.");
    if (!selectedSide) return toast.error("Seçim yapın.");
    
    // Zaten arayüzde engelledik ama backend'e giderken tekrar garantiye alıyoruz
    const safeAmount = Math.floor(Number(amount));
    if (!safeAmount || safeAmount <= 0) return toast.error("Geçerli tutar girin.");
    if (safeAmount > balance) return toast.error("Yetersiz bakiye.");

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
      toast.success("İşlem başarılı!");
      setAmount("");
      refreshBalance(); 
      window.location.reload(); 
    }
    setLoading(false);
  };

  // KİLİTLİ PİYASA (Kompakt)
  if (isLocked) {
    return (
      <div className="bg-secondary/10 border border-border/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-3">
        <div className={cn("p-3 rounded-full", market.status === 'resolved' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500')}>
           {market.status === 'resolved' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
        </div>
        <div>
          <h3 className="font-bold text-sm sm:text-base">{market.status === 'resolved' ? 'Piyasa Sonuçlandı' : 'Piyasa İptal Edildi'}</h3>
          <p className="text-[11px] text-muted-foreground mt-1">İşleme kapalıdır.</p>
        </div>
      </div>
    );
  }

  // Dinamik Buton Metni
  const getButtonText = () => {
    if (!user) return "GİRİŞ YAP";
    if (loading) return <Loader2 className="animate-spin h-4 w-4 mx-auto" />;
    if (!selectedSide) return "SEÇİM YAPIN";
    if (!amount || Number(amount) <= 0) return "TUTAR GİRİN";
    
    if (market.market_type === 'binary') {
        return `${selectedSide === 'YES' ? 'EVET' : 'HAYIR'} AL`;
    }
    return "İŞLEMİ ONAYLA";
  };

  // Dinamik Buton Rengi
  const getButtonColor = () => {
    if (!selectedSide || !amount || Number(amount) <= 0) return "bg-secondary text-muted-foreground hover:bg-secondary/80";
    if (market.market_type === 'binary' && selectedSide === 'YES') return "bg-green-500 hover:bg-green-600 text-white shadow-md shadow-green-500/20";
    if (market.market_type === 'binary' && selectedSide === 'NO') return "bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/20";
    return "bg-primary hover:bg-primary/90 text-primary-foreground";
  };

  return (
    <div className="bg-card border border-border/50 rounded-[1.25rem] p-4 sm:p-5 shadow-sm space-y-4">
      
      {/* Üst Başlık ve Paylaşım Menüsü */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm sm:text-base tracking-tight">Pozisyon Al</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="text-muted-foreground hover:text-foreground transition-colors p-1">
              <Share2 size={14} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 rounded-xl">
            <DropdownMenuItem onClick={() => handleShare('twitter')} className="text-xs cursor-pointer"><Twitter size={12} className="mr-2"/> X'te Paylaş</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleShare('whatsapp')} className="text-xs cursor-pointer"><MessageCircle size={12} className="mr-2"/> WhatsApp</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleShare('copy')} className="text-xs cursor-pointer"><LinkIcon size={12} className="mr-2"/> Kopyala</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* POLYMARKET TARZI SEÇİM ALANI */}
      <div className="w-full">
        {market.market_type === 'binary' ? (
          <div className="flex bg-secondary/30 p-1 rounded-xl border border-border/50">
            <button 
              onClick={() => setSelectedSide("YES")}
              className={cn(
                "flex-1 h-9 sm:h-10 text-[11px] sm:text-xs font-bold rounded-lg transition-all duration-200",
                selectedSide === "YES" ? "bg-green-500 text-white shadow-sm scale-[1.02]" : "text-muted-foreground hover:text-foreground"
              )}
            >
              EVET
            </button>
            <button 
              onClick={() => setSelectedSide("NO")}
              className={cn(
                "flex-1 h-9 sm:h-10 text-[11px] sm:text-xs font-bold rounded-lg transition-all duration-200",
                selectedSide === "NO" ? "bg-red-500 text-white shadow-sm scale-[1.02]" : "text-muted-foreground hover:text-foreground"
              )}
            >
              HAYIR
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-1.5">
            {market.market_options.map((opt: any) => (
              <button 
                key={opt.id}
                onClick={() => setSelectedSide(opt.id)}
                className={cn(
                  "flex items-center justify-between px-3 h-10 text-[11px] sm:text-xs font-bold rounded-xl border transition-all duration-200",
                  selectedSide === opt.id ? "border-primary bg-primary/5 text-primary" : "border-border/50 bg-secondary/10 text-muted-foreground hover:bg-secondary/30 hover:text-foreground"
                )}
              >
                <span className="truncate pr-2">{opt.name}</span>
                <span className="opacity-70">%{Math.round(opt.probability * 100)}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* MİNİMALİST TUTAR GİRİŞİ (VİRGÜL VE NOKTA ENGELLENDİ) */}
      <div className="bg-secondary/20 rounded-xl p-3 border border-border/50 focus-within:border-primary/40 focus-within:bg-secondary/30 transition-colors">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Tutar</span>
          <span className="text-[9px] font-bold text-muted-foreground flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors" onClick={() => setAmount(Math.floor(balance).toString())}>
            <Wallet size={10} /> Bakiye: {Math.floor(balance).toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <input 
            type="text" 
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="0"
            value={amount}
            onChange={(e) => {
              // RegExp ile RAKAM OLMAYAN tüm karakterleri (virgül, nokta, harf, eksi işareti) anında sil
              const onlyNumbers = e.target.value.replace(/[^0-9]/g, '');
              setAmount(onlyNumbers);
            }}
            className="bg-transparent border-none outline-none text-xl sm:text-2xl font-black w-full text-foreground placeholder:text-muted-foreground/30"
          />
          <span className="text-xs font-black text-muted-foreground ml-2">TP</span>
        </div>
      </div>

      {/* PREMIUM ONAY BUTONU */}
      <Button 
        disabled={loading || !user || !selectedSide || !amount || Number(amount) <= 0} 
        onClick={handlePredict}
        className={cn(
          "w-full h-11 sm:h-12 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all active:scale-[0.98]",
          getButtonColor()
        )}
      >
        {getButtonText()}
      </Button>
      
    </div>
  );
}