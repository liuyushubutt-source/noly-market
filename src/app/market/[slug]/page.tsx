import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMarketDetail, getMarketPrices } from "@/actions/market-actions";
import { getMarketComments } from "@/actions/comment-actions";
import { MarketChart } from "@/components/market/market-chart";
import { PredictionPanel } from "@/components/market/prediction-panel";
import { MarketComments } from "@/components/market/market-comments";
import { Badge } from "@/components/ui/badge";
import { Clock, Info } from "lucide-react";

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params;
  const market = await getMarketDetail(slug);

  if (!market) {
    return {
      title: "Piyasa Bulunamadı | Noly Market",
      description: "Aradığınız tahmin piyasası bulunamadı veya süresi dolmuş olabilir."
    };
  }

  return {
    title: market.question,
    description: market.description || "Bu piyasadaki güncel oranları incele, tahminini yap ve portföyünü büyüt.",
    openGraph: {
      title: market.question,
      description: market.description,
    },
    twitter: {
      card: "summary_large_image",
      title: market.question,
      description: market.description,
    }
  };
}

export default async function MarketPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; 
  const market = await getMarketDetail(slug);

  if (!market) return notFound();

  const [chartData, comments] = await Promise.all([
    getMarketPrices(market.id, market.market_type),
    getMarketComments(market.id)
  ]);

  // YENİ EKLENEN: Google Botları için JSON-LD Yapısal Veri (Schema)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Question", // Google'a bunun bir soru/tahmin olduğunu söylüyoruz
    "name": market.question,
    "text": market.description || `${market.question} hakkında tahminlerinizi yapın.`,
    "url": `https://nolymarket.com/market/${market.slug}`,
    "expires": market.end_date, // Piyasanın bitiş tarihini Google'a bildiriyoruz
    "author": {
      "@type": "Organization",
      "name": "Noly Market"
    }
  };

  return (
    <>
      {/* Schema Kodunu Sayfaya Enjekte Ediyoruz */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="container mx-auto px-4 py-6 max-w-[1400px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
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

            <div className="bg-card border rounded-3xl p-6 h-[400px] shadow-sm">
              <MarketChart data={chartData} market={market} />
            </div>

            <div className="bg-secondary/20 rounded-2xl p-6 border border-border/50">
              <h3 className="font-bold flex items-center gap-2 mb-3">
                <Info size={18} className="text-primary" /> Piyasa Hakkında
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                {market.description}
              </p>
            </div>

            <div className="pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <MarketComments marketId={market.id} initialComments={comments} />
            </div>

          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <PredictionPanel market={market} />
            </div>
          </div>

        </div>
      </div>
    </>
  );
}