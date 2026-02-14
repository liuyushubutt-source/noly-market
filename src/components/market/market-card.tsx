"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TrendingUp, Clock, Bookmark } from "lucide-react";
import { useState } from "react";
import { toggleBookmark } from "@/actions/bookmark-actions";
import { toast } from "sonner";
import { useBalance } from "@/context/balance-context";
import { cn } from "@/lib/utils";

export function MarketCard({ market, isBookmarked = false }: { market: any, isBookmarked?: boolean }) {
  const { user } = useBalance();
  const isBinary = market.market_type === 'binary';
  const options = market.market_options || [];
  
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [loading, setLoading] = useState(false);

  const sortedOptions = [...options].sort((a, b) => Number(b.probability) - Number(a.probability));

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault(); // Karta tıklanıp detay sayfasına gitmesini engeller
    if (!user) return toast.error("Kaydetmek için giriş yapmalısınız.");
    
    setLoading(true);
    // Optimistic UI (Kullanıcı beklemesin diye anında yıldızı doldururuz)
    setBookmarked(!bookmarked); 
    try {
      await toggleBookmark(market.id);
      toast.success(bookmarked ? "Kaydedilenlerden çıkarıldı." : "Kaydedilenlere eklendi!");
    } catch (error) {
      setBookmarked(bookmarked); // Hata olursa eski haline getir
      toast.error("Bir hata oluştu.");
    }
    setLoading(false);
  };

  return (
    <Link href={`/market/${market.slug}`} className="group block h-full">
      <div className="bg-card hover:bg-secondary/20 border border-border/50 hover:border-primary/30 transition-all rounded-2xl p-5 shadow-sm flex flex-col h-full relative">
        
        {/* BOOKMARK BUTONU */}
        <button 
          onClick={handleBookmark}
          disabled={loading}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/50 backdrop-blur border border-border/50 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Bookmark size={16} className={cn(bookmarked && "fill-yellow-500 text-yellow-500")} />
        </button>

        {/* Üst Kısım: Resim ve Kategori */}
        <div className="flex items-start justify-between mb-4">
          <Avatar className="h-12 w-12 rounded-xl border border-border">
            <AvatarImage src={market.image_url} className="object-cover" />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {market.question.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                {market.category}
            </span>
        </div>

        {/* Soru */}
        <h3 className="text-base font-bold leading-tight mb-4 group-hover:text-primary transition-colors line-clamp-2 pr-6">
          {market.question}
        </h3>

        {/* Dinamik İçerik (Binary vs Multiple) */}
        <div className="mt-auto space-y-4">
          {isBinary ? (
            <div className="space-y-2">
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden flex">
                <div className="bg-green-500 h-full transition-all" style={{ width: `${Math.round(market.yes_probability * 100)}%` }} />
                <div className="bg-red-500 h-full transition-all" style={{ width: `${Math.round((1 - market.yes_probability) * 100)}%` }} />
              </div>
              <div className="flex justify-between text-[11px] font-black uppercase">
                <span className="text-green-600">Evet %{Math.round(market.yes_probability * 100)}</span>
                <span className="text-red-600">Hayır %{Math.round((1 - market.yes_probability) * 100)}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              {sortedOptions.slice(0, 3).map((opt) => (
                <div key={opt.id} className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-muted-foreground truncate pr-2">{opt.name}</span>
                  <span className="text-foreground">%{Math.round(opt.probability * 100)}</span>
                </div>
              ))}
              {options.length > 3 && (
                <div className="text-[10px] text-muted-foreground font-medium italic">+ {options.length - 3} seçenek daha</div>
              )}
            </div>
          )}

          {/* Alt Bilgi */}
          <div className="flex items-center justify-between pt-3 border-t border-border/50 text-[10px] text-muted-foreground font-bold">
            <div className="flex items-center gap-1">
              <TrendingUp size={12} className="text-blue-500" />
              <span>{Number(market.total_volume_tp).toLocaleString()} TP</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>{new Date(market.end_date).toLocaleDateString("tr-TR")}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}