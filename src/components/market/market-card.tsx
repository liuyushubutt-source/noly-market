"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TrendingUp, Clock, Bookmark, ChevronRight } from "lucide-react";
import { useState } from "react";
import { toggleBookmark } from "@/actions/bookmark-actions";
import { toast } from "sonner";
import { useBalance } from "@/context/balance-context";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

export function MarketCard({ market, isBookmarked = false }: { market: any, isBookmarked?: boolean }) {
  const { user } = useBalance();
  const isBinary = market.market_type === 'binary';
  const options = market.market_options || [];
  
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [loading, setLoading] = useState(false);

  const sortedOptions = [...options].sort((a, b) => Number(b.probability) - Number(a.probability));

  // Binary için oran hesaplamaları
  const yesPct = isBinary && market.yes_probability !== undefined ? Math.round(market.yes_probability * 100) : 50;
  const noPct = 100 - yesPct;

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault(); 
    if (!user) return toast.error("Kaydetmek için giriş yapmalısınız.");
    
    setLoading(true);
    setBookmarked(!bookmarked); 
    try {
      await toggleBookmark(market.id);
      toast.success(bookmarked ? "Kaydedilenlerden çıkarıldı." : "Kaydedilenlere eklendi!");
    } catch (error) {
      setBookmarked(bookmarked); 
      toast.error("Bir hata oluştu.");
    }
    setLoading(false);
  };

  return (
    <Link href={`/market/${market.slug}`} className="group block h-full outline-none">
      <div className="bg-card hover:bg-secondary/10 border border-border/50 hover:border-primary/40 transition-all rounded-[1.5rem] p-4 sm:p-5 shadow-sm hover:shadow-md flex flex-col h-full relative cursor-pointer overflow-hidden">
        
        {/* Sol Üst - Kategori Tag */}
        <div className="absolute top-4 left-4 sm:left-5 z-10 flex items-center gap-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground bg-secondary/80 backdrop-blur px-2 py-0.5 rounded-md">
                {market.category}
            </span>
            {market.status === 'resolved' && <span className="text-[9px] font-black uppercase text-green-500 bg-green-500/10 px-2 py-0.5 rounded-md">Sonuçlandı</span>}
        </div>

        {/* Sağ Üst - Bookmark */}
        <button 
          onClick={handleBookmark}
          disabled={loading}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 p-2 rounded-full hover:bg-secondary transition-colors"
        >
          <Bookmark size={18} className={cn("text-muted-foreground transition-all", bookmarked && "fill-yellow-500 text-yellow-500 scale-110")} />
        </button>

        {/* BAŞLIK VE İKON (Üst Boşluk Kategori Tag'i için bırakıldı) */}
        <div className="flex items-start gap-3 sm:gap-4 mt-6 sm:mt-8 mb-4">
          <Avatar className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl border border-border/50 shrink-0">
            <AvatarImage src={market.image_url} className="object-cover" />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
              {market.question.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <h3 className="text-sm sm:text-base font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2 pr-6">
            {market.question}
          </h3>
        </div>

        {/* DİNAMİK ORAN BARLARI (POLYMARKET TARZI) */}
        <div className="mt-auto space-y-4">
          {isBinary ? (
            <div className="space-y-1.5">
              {/* Oran Çubuğu */}
              <div className="h-2 sm:h-2.5 w-full bg-secondary rounded-full overflow-hidden flex shadow-inner">
                <div className="bg-green-500 h-full transition-all duration-500" style={{ width: `${yesPct}%` }} />
                <div className="bg-red-500 h-full transition-all duration-500" style={{ width: `${noPct}%` }} />
              </div>
              
              {/* Polymarket Tarzı "Evet/Hayır" Satın Alma Hissi Veren Buton Görünümlü Metinler */}
              <div className="flex justify-between gap-2">
                <div className="flex-1 bg-green-500/5 hover:bg-green-500/10 border border-green-500/20 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 flex items-center justify-between transition-colors">
                    <span className="text-[10px] sm:text-xs font-black text-green-600 uppercase">EVET</span>
                    <span className="text-[11px] sm:text-sm font-black text-foreground">%{yesPct}</span>
                </div>
                <div className="flex-1 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 flex items-center justify-between transition-colors">
                    <span className="text-[10px] sm:text-xs font-black text-red-600 uppercase">HAYIR</span>
                    <span className="text-[11px] sm:text-sm font-black text-foreground">%{noPct}</span>
                </div>
              </div>
            </div>
          ) : (
            // ÇOKLU SEÇENEK (Multiple Choice)
            <div className="space-y-1.5">
              {sortedOptions.slice(0, 3).map((opt) => (
                <div key={opt.id} className="flex items-center justify-between text-[11px] sm:text-xs font-bold bg-secondary/30 hover:bg-secondary/60 rounded-lg px-2 sm:px-3 py-1.5 transition-colors">
                  <span className="text-muted-foreground truncate pr-2">{opt.name}</span>
                  <span className="text-foreground">%{Math.round(opt.probability * 100)}</span>
                </div>
              ))}
              {options.length > 3 && (
                <div className="text-[9px] sm:text-[10px] text-muted-foreground font-black uppercase tracking-widest text-center pt-1 flex items-center justify-center gap-1 group-hover:text-primary transition-colors">
                  + {options.length - 3} Diğer Seçenek <ChevronRight size={10} />
                </div>
              )}
            </div>
          )}

          {/* ALT BİLGİ (HACİM VE SÜRE) */}
          <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-border/50 text-[9px] sm:text-[10px] text-muted-foreground font-black uppercase tracking-widest">
            <div className="flex items-center gap-1.5">
              <TrendingUp size={12} className="text-primary" />
              <span>{market.total_volume_tp ? Number(market.total_volume_tp).toLocaleString() : 0} TP</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={12} />
              <span>{formatDistanceToNow(new Date(market.end_date), { addSuffix: true, locale: tr })}</span>
            </div>
          </div>
        </div>
        
      </div>
    </Link>
  );
}