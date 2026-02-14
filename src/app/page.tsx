import { getMarkets } from "@/actions/market-actions";
import { getUserBookmarks } from "@/actions/bookmark-actions";
import { MarketFeed } from "@/components/market/market-feed";

export const dynamic = "force-dynamic";

export default async function HomePage({ searchParams }: { searchParams: Promise<{ category?: string, q?: string, watchlist?: string }> }) {
  const params = await searchParams;
  const category = params.category;
  const q = params.q;
  const watchlist = params.watchlist; // Yeni
  
  // Marketleri ve kullanıcının favori ID'lerini eşzamanlı çek
  const [initialMarkets, userBookmarkedIds] = await Promise.all([
    getMarkets({ category, q, watchlist, limit: 16, offset: 0 }),
    getUserBookmarks()
  ]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-[1400px]">
      <div className="flex flex-col gap-8">
        
        {/* Banner */}
        {!category && !q && !watchlist && (
          <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-[2rem] p-8 md:p-12 border border-primary/10 relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-4">
                TÜRKİYE GÜNDEMİNDE <br /> <span className="text-primary">N'OLY?</span>
              </h1>
              <p className="text-muted-foreground max-w-md font-medium text-lg">
                Siyasetten spora, teknolojiden magazine her şeyi tahmin et, TP kazan, sıralamada yüksel.
              </p>
            </div>
          </div>
        )}

        {(category || q || watchlist) && (
          <h2 className="text-2xl font-black uppercase tracking-widest text-primary border-b pb-4">
            {watchlist ? "KAYDETTİĞİN PİYASALAR" : q ? `"${q}" İÇİN SONUÇLAR` : `${category} PİYASALARI`}
          </h2>
        )}

        {/* Feed Bileşeni: Favori ID'lerini Prop olarak yolluyoruz */}
        <MarketFeed 
          key={`${category || 'all'}-${q || 'none'}-${watchlist || 'false'}`} 
          initialMarkets={initialMarkets} 
          category={category} 
          q={q} 
          watchlist={watchlist}
          userBookmarks={userBookmarkedIds} 
        />
      </div>
    </div>
  );
}