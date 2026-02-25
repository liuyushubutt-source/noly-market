import { getMarkets } from "@/actions/market-actions";
import { getUserBookmarks } from "@/actions/bookmark-actions";
import { MarketFeed } from "@/components/market/market-feed";
import { TrendingUp, Flame, ArrowRight, Bookmark } from "lucide-react";
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
    <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8 max-w-[1400px] animate-in fade-in duration-500">
      <div className="flex flex-col gap-6 sm:gap-8">
        
        {/* POLYMARKET TARZI DİNAMİK BANNER */}
        {!category && !q && !watchlist && (
          <div className="bg-gradient-to-r from-card via-card to-primary/5 rounded-[2rem] p-6 sm:p-10 md:p-14 border border-border/50 relative overflow-hidden shadow-lg group">
            <div className="absolute top-0 right-0 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none transition-all duration-1000 group-hover:bg-primary/20" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1 text-center md:text-left space-y-4 sm:space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20 text-[10px] sm:text-xs font-black uppercase tracking-widest mx-auto md:mx-0">
                  <Flame size={14} className="animate-pulse"/> Günün Fırsatı
                </div>
                
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-[1.1]">
                  GÜNDEMİ TAHMİN ET, <br className="hidden md:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
                    TP KAZAN.
                  </span>
                </h1>
                
                <p className="text-muted-foreground font-medium text-sm sm:text-lg max-w-xl mx-auto md:mx-0">
                  Siyasetten spora, teknolojiden magazine yüzlerce piyasada pozisyon al. Bilgini kazanca dönüştür.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3 sm:gap-4 pt-2">
                  <Button asChild size="lg" className="w-full sm:w-auto h-12 sm:h-14 px-8 font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                     <Link href="#piyasalar">Piyasalara Göz At</Link>
                  </Button>
                  <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto h-12 sm:h-14 px-8 font-black text-sm sm:text-base rounded-2xl">
                     <Link href="/rewards">Görevleri İncele <ArrowRight size={18} className="ml-2"/></Link>
                  </Button>
                </div>
              </div>

              {/* Banner Sağ Kısım - Canlı İstatistikler (Süsleme) */}
              <div className="hidden lg:flex flex-col gap-4 min-w-[300px]">
                <div className="bg-background/80 backdrop-blur-md border border-border/50 p-6 rounded-3xl shadow-sm transform rotate-2 hover:rotate-0 transition-transform">
                   <div className="flex items-center gap-3 mb-2">
                      <TrendingUp className="text-green-500 h-8 w-8" />
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Aktif Piyasa Hacmi</p>
                        <p className="text-2xl font-black">2.4M+ TP</p>
                      </div>
                   </div>
                   <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden mt-4"><div className="bg-green-500 w-[75%] h-full animate-pulse"></div></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BAŞLIK */}
        <div id="piyasalar" className="flex items-center justify-between border-b border-border/50 pb-4 mt-2 sm:mt-6 px-2 sm:px-0">
          <h2 className="text-lg sm:text-2xl font-black uppercase tracking-widest text-foreground flex items-center gap-2">
            {watchlist ? <Bookmark className="text-yellow-500" /> : q ? "Arama Sonuçları" : <TrendingUp className="text-primary" />}
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