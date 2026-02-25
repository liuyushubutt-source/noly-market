"use client";

import { useState } from "react";
import { MarketCard } from "./market-card";
import { Button } from "@/components/ui/button";
import { Loader2, SearchX, BookmarkX, Activity } from "lucide-react";
import { getMarkets } from "@/actions/market-actions";

export function MarketFeed({ 
  initialMarkets, 
  category, 
  q,
  watchlist,
  userBookmarks = []
}: { 
  initialMarkets: any[]; 
  category?: string; 
  q?: string;
  watchlist?: string;
  userBookmarks?: number[];
}) {
  const [markets, setMarkets] = useState(initialMarkets);
  const [offset, setOffset] = useState(16);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialMarkets.length === 16);

  const loadMore = async () => {
    setLoading(true);
    
    const newMarkets = await getMarkets({ category, q, watchlist, limit: 16, offset });
    
    if (newMarkets && newMarkets.length > 0) {
      setMarkets((prev) => {
        const existingIds = new Set(prev.map(m => m.id));
        const uniqueNewMarkets = newMarkets.filter(m => !existingIds.has(m.id));
        return [...prev, ...uniqueNewMarkets];
      });
      
      setOffset((prev) => prev + 16);
      if (newMarkets.length < 16) setHasMore(false); 
    } else {
      setHasMore(false);
    }
    
    setLoading(false);
  };

  // Dinamik Boş Mesaj ve İkon Yöneticisi (Sayfanın boş kalmamasını sağlar)
  const getEmptyState = () => {
    if (watchlist) return { text: "İzleme listende henüz bir piyasa yok. Hemen keşfet ve favorilerine ekle.", icon: BookmarkX };
    if (q) return { text: `"${q}" aramasına uygun aktif bir piyasa bulamadık. Başka kelimeler dene.`, icon: SearchX };
    return { text: "Bu kategoride henüz aktif bir piyasa bulunmuyor.", icon: Activity };
  };

  const emptyState = getEmptyState();
  const EmptyIcon = emptyState.icon;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      
      {/* MARKET KARTLARI GRID'İ - MOBİLDE SIKI (gap-3), MASAÜSTÜNDE FERAH (gap-6) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
        {markets.map((market) => (
          <MarketCard 
            key={market.id} 
            market={market} 
            isBookmarked={userBookmarks.includes(market.id)} 
          />
        ))}
      </div>

      {/* PREMIUM VERİ BULUNAMADI EKRANI */}
      {markets.length === 0 && (
         <div className="flex flex-col items-center justify-center py-16 sm:py-24 bg-secondary/10 rounded-[2rem] border-2 border-dashed border-border/50 text-center px-4 transition-all">
            <div className="bg-background/80 backdrop-blur p-4 rounded-full mb-4 shadow-sm border border-border/50">
              <EmptyIcon className="h-8 w-8 text-muted-foreground opacity-70" />
            </div>
            <h3 className="text-lg sm:text-xl font-black tracking-tight mb-2">Piyasa Bulunamadı</h3>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium max-w-sm">
              {emptyState.text}
            </p>
         </div>
      )}

      {/* DAHA FAZLA YÜKLE BUTONU (Mobilde tam genişlik, şık tasarım) */}
      {hasMore && markets.length > 0 && (
        <div className="flex justify-center pt-2 sm:pt-6 pb-8">
          <Button 
            onClick={loadMore} 
            disabled={loading} 
            variant="outline" 
            className="w-full sm:w-auto px-8 sm:px-12 h-12 sm:h-14 text-xs sm:text-sm font-black rounded-2xl sm:rounded-full shadow-sm border-border/50 hover:bg-secondary/80 hover:scale-[1.02] transition-all bg-background/50 backdrop-blur"
          >
            {loading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : "DAHA FAZLA PİYASA GÖSTER"}
          </Button>
        </div>
      )}
    </div>
  );
}