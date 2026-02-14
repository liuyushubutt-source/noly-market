"use client";

import { useState } from "react";
import { MarketCard } from "./market-card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
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

  // NOT: URL değişikliklerini yakalamak için useEffect KULLANILMIYOR.
  // Sıfırlama işlemi parent bileşendeki (page.tsx) 'key' prop'u ile otomatik yapılıyor.

  const loadMore = async () => {
    setLoading(true);
    
    // Server action'ı Client'tan çağırırken tüm parametreleri yolluyoruz
    const newMarkets = await getMarkets({ category, q, watchlist, limit: 16, offset });
    
    if (newMarkets && newMarkets.length > 0) {
      setMarkets((prev) => {
        // Çift key hatasını (duplicate) kesin olarak önlemek için var olanları filtrele
        const existingIds = new Set(prev.map(m => m.id));
        const uniqueNewMarkets = newMarkets.filter(m => !existingIds.has(m.id));
        
        return [...prev, ...uniqueNewMarkets];
      });
      
      setOffset((prev) => prev + 16);
      
      // Eğer 16'dan az geldiyse demek ki veritabanında başka kalmamış
      if (newMarkets.length < 16) setHasMore(false); 
    } else {
      setHasMore(false);
    }
    
    setLoading(false);
  };

  // Dinamik Boş Mesaj Yöneticisi
  const getEmptyMessage = () => {
    if (watchlist) return "Henüz kaydettiğin bir piyasa bulunmuyor.";
    if (q) return `"${q}" için aktif piyasa bulunamadı.`;
    return "Bu kategoride henüz aktif piyasa bulunmuyor.";
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* MARKET KARTLARI GRID'İ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {markets.map((market) => (
          <MarketCard 
            key={market.id} 
            market={market} 
            // Kullanıcının favori ID'leri arasında bu market var mı kontrol et
            isBookmarked={userBookmarks.includes(market.id)} 
          />
        ))}
      </div>

      {/* VERİ BULUNAMADI DURUMU */}
      {markets.length === 0 && (
        <div className="text-center py-20 bg-secondary/20 rounded-[2rem] border border-dashed border-border/50">
          <p className="text-muted-foreground font-medium text-lg">
            {getEmptyMessage()}
          </p>
        </div>
      )}

      {/* DAHA FAZLA YÜKLE BUTONU */}
      {hasMore && (
        <div className="flex justify-center pt-8">
          <Button 
            onClick={loadMore} 
            disabled={loading} 
            variant="outline" 
            className="w-full md:w-auto px-12 h-12 font-black rounded-full shadow-sm border-border/50 hover:bg-secondary/50"
          >
            {loading ? <Loader2 className="animate-spin mr-2" /> : "DAHA FAZLA YÜKLE"}
          </Button>
        </div>
      )}
    </div>
  );
}