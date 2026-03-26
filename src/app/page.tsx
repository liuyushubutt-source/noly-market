import { getMarkets } from "@/actions/market-actions";
import { getUserBookmarks } from "@/actions/bookmark-actions";
import { MarketFeed } from "@/components/market/market-feed";
import { TrendingUp, ArrowRight, Bookmark } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function HomePage({ searchParams }: { searchParams: Promise<{ category?: string, q?: string, watchlist?: string }> }) {
  const params = await searchParams;
  const category = params.category;
  const q = params.q;
  const watchlist = params.watchlist;
  
  const [initialMarkets, userBookmarkedIds] = await Promise.all([
    getMarkets({ category, q, watchlist, limit: 16, offset: 0 }),
    getUserBookmarks()
  ]);

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-[1400px] animate-in fade-in duration-500">
      <div className="flex flex-col gap-6 sm:gap-8">
        
        {/* ESTETİK, KOMPAKT VE MOBİL UYUMLU BANNER */}
        {!category && !q && !watchlist && (
          <div className="bg-gradient-to-br from-card via-background to-primary/5 rounded-3xl p-5 sm:p-8 md:p-10 border border-border/50 relative overflow-hidden shadow-sm">
            {/* Zarif arkaplan parlaması */}
            <div className="absolute top-0 right-0 w-[200px] sm:w-[400px] h-[200px] sm:h-[400px] bg-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              
              {/* Sol Taraf - Metin ve Butonlar */}
              <div className="flex-1 text-center md:text-left space-y-3 sm:space-y-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter leading-tight">
                  TÜRKİYE GÜNDEMİNDE <br className="hidden sm:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
                    N'OLY?
                  </span>
                </h1>
                
                <p className="text-muted-foreground font-medium text-xs sm:text-sm md:text-base max-w-lg mx-auto md:mx-0">
                  Siyasetten spora, teknolojiden magazine yüzlerce piyasada tahminini yap, TP kazan ve sıralamada zirveye yerleş.
                </p>

                <div className="flex flex-row items-center justify-center md:justify-start gap-3 pt-2">
                  <Button asChild size="default" className="w-1/2 sm:w-auto h-11 sm:h-12 px-4 sm:px-6 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                     <Link href="#piyasalar">Piyasaları Keşfet</Link>
                  </Button>
                  <Button asChild variant="secondary" size="default" className="w-1/2 sm:w-auto h-11 sm:h-12 px-4 sm:px-6 font-black text-xs sm:text-sm rounded-xl border border-border/50 hover:bg-secondary/80">
                     <Link href="/rewards">Ödül Kazan <ArrowRight size={14} className="ml-1.5 hidden sm:inline-block"/></Link>
                  </Button>
                </div>
              </div>

              {/* Sağ Taraf - Kompakt Canlı İstatistik */}
              <div className="hidden md:flex flex-col gap-3 min-w-[240px]">
                <div className="bg-background/60 backdrop-blur-sm border border-border/50 p-4 sm:p-5 rounded-2xl shadow-sm">
                   <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-green-500/10 rounded-lg">
                        <TrendingUp className="text-green-500 h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Platform Hacmi</p>
                        <p className="text-lg sm:text-xl font-black">2.4M+ TP</p>
                      </div>
                   </div>
                   <div className="h-1 w-full bg-secondary rounded-full overflow-hidden mt-3">
                     <div className="bg-green-500 w-[75%] h-full animate-pulse"></div>
                   </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* BAŞLIK */}
        <div id="piyasalar" className="flex items-center justify-between border-b border-border/50 pb-3 sm:pb-4 mt-2 sm:mt-4 px-2 sm:px-0">
          <h2 className="text-base sm:text-xl font-black uppercase tracking-widest text-foreground flex items-center gap-2">
            {watchlist ? <Bookmark className="text-yellow-500 size-4 sm:size-5" /> : q ? "Arama Sonuçları" : <TrendingUp className="text-primary size-4 sm:size-5" />}
            {watchlist ? "İzleme Listen" : q ? `"${q}"` : `${category || 'TÜM'} PİYASALAR`}
          </h2>
        </div>

        {/* FEED (Market Listesi) */}
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
