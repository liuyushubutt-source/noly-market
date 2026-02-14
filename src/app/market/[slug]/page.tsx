import { notFound } from "next/navigation";
import { getMarketDetail, getMarketPrices } from "@/actions/market-actions";
import { getMarketComments } from "@/actions/comment-actions"; // YENİ İÇE AKTARMA
import { MarketChart } from "@/components/market/market-chart";
import { PredictionPanel } from "@/components/market/prediction-panel";
import { MarketComments } from "@/components/market/market-comments"; // YENİ İÇE AKTARMA
import { Badge } from "@/components/ui/badge";
import { Clock, Info } from "lucide-react";

export default async function MarketPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; // Next.js 15 asenkron params
  const market = await getMarketDetail(slug);

  if (!market) return notFound();

  // Yorumları ve fiyat geçmişini aynı anda çekerek sayfanın yüklenme süresini yarı yarıya düşürüyoruz
  const [chartData, comments] = await Promise.all([
    getMarketPrices(market.id, market.market_type),
    getMarketComments(market.id)
  ]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-[1400px]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SOL KOLON: Bilgi, Grafik, Açıklama ve YORUMLAR */}
        <div className="lg:col-span-8 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="uppercase tracking-widest text-[10px]">
                {market.category}
              </Badge>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-bold">
                <Clock size={14} />
                Bitiş: {new Date(market.end_date).toLocaleDateString("tr-TR")}
              </div>
            </div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight leading-tight">
              {market.question}
            </h1>
          </div>

          {/* Grafik Alanı */}
          <div className="bg-card border rounded-3xl p-6 h-[400px] shadow-sm">
            <MarketChart data={chartData} market={market} />
          </div>

          {/* Açıklama */}
          <div className="bg-secondary/20 rounded-2xl p-6 border border-border/50">
            <h3 className="font-bold flex items-center gap-2 mb-3">
              <Info size={18} className="text-primary" /> Piyasa Hakkında
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
              {market.description}
            </p>
          </div>

          {/* YENİ EKLENEN: YORUMLAR MODÜLÜ */}
          <div className="pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <MarketComments marketId={market.id} initialComments={comments} />
          </div>

        </div>

        {/* SAĞ KOLON: Tahmin Paneli */}
        <div className="lg:col-span-4">
          {/* Mobilde alta kayan, masaüstünde ekrana yapışan (sticky) yapı */}
          <div className="sticky top-24">
            <PredictionPanel market={market} />
          </div>
        </div>

      </div>
    </div>
  );
}