import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMarketDetail, getMarketPrices } from "@/actions/market-actions";
import { getMarketComments } from "@/actions/comment-actions";
import { MarketChart } from "@/components/market/market-chart";
import { PredictionPanel } from "@/components/market/prediction-panel";
import { MarketComments } from "@/components/market/market-comments";
import { Badge } from "@/components/ui/badge";
import { Clock, Info, CheckCircle2, XCircle, Activity, TrendingUp } from "lucide-react";

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

 // KESİN ÇÖZÜM: Google Botları için 'Breadcrumb' (İçerik Haritası) Şeması
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Noly Market",
        "item": "https://nolymarket.com/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": market.category ? (market.category.charAt(0).toUpperCase() + market.category.slice(1)) : "Piyasalar",
        "item": `https://nolymarket.com/category/${market.category?.toLowerCase() || 'genel'}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": market.question,
        "item": `https://nolymarket.com/market/${market.slug}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-[1400px] animate-in fade-in duration-500">
        
        {/* MOBİL UYUMLU (MOBILE-FIRST) BÜYÜK GRID DÜZENİ */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* SOL ALAN (Grafik, Açıklama, Yorumlar) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* 1. BAŞLIK VE ETİKETLER (HEADER) */}
            <div className="space-y-4 mb-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="uppercase tracking-widest text-[10px] font-black border-none">
                  {market.category}
                </Badge>
                
                {/* DİNAMİK DURUM ROZETLERİ */}
                {market.status === 'resolved' && (
                  <Badge className="bg-green-500/10 hover:bg-green-500/20 text-green-500 border-none uppercase tracking-widest text-[10px] font-black">
                    <CheckCircle2 size={12} className="mr-1"/> Sonuçlandı
                  </Badge>
                )}
                {market.status === 'cancelled' && (
                  <Badge className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border-none uppercase tracking-widest text-[10px] font-black">
                    <XCircle size={12} className="mr-1"/> İptal Edildi
                  </Badge>
                )}
                {market.status === 'active' && (
                  <Badge className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border-none uppercase tracking-widest text-[10px] font-black">
                    <Activity size={12} className="mr-1"/> İşleme Açık
                  </Badge>
                )}

                {/* HACİM GÖSTERGESİ (Zenginlik katar) */}
                <Badge variant="outline" className="uppercase tracking-widest text-[10px] font-black border-border/50 text-muted-foreground">
                  <TrendingUp size={12} className="mr-1 text-primary"/> 
                  {market.total_volume_tp ? Math.round(market.total_volume_tp).toLocaleString() : 0} TP Hacim
                </Badge>

                {/* BİTİŞ TARİHİ */}
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-muted-foreground font-bold ml-auto bg-secondary/30 px-2 py-1 rounded-md">
                  <Clock size={12} />
                  Bitiş: {new Date(market.end_date).toLocaleDateString("tr-TR")}
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-snug">
                {market.question}
              </h1>
            </div>

            {/* 2. GRAFİK ALANI */}
            <div className="bg-card border-2 border-border/50 rounded-3xl p-4 sm:p-6 h-[350px] sm:h-[400px] shadow-lg relative overflow-hidden">
               {/* Arka plan süslemesi */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
               <div className="relative z-10 h-full w-full">
                 <MarketChart data={chartData} market={market} />
               </div>
            </div>

            {/* 3. MOBİLDE TAHMİN PANELİ (SADECE MOBİLDE GRAFİĞİN HEMEN ALTINDA ÇIKAR) */}
            <div className="block lg:hidden mt-2">
              <PredictionPanel market={market} />
            </div>

            {/* 4. AÇIKLAMA VE KURALLAR KUTUSU */}
            <div className="bg-secondary/10 rounded-[2rem] p-6 sm:p-8 border border-border/50 shadow-sm relative overflow-hidden mt-2">
              {/* Dekoratif sol şerit */}
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-primary to-purple-500"></div>
              
              <h3 className="font-black text-lg flex items-center gap-2 mb-3 tracking-tight">
                <Info size={20} className="text-primary" /> Piyasa Hakkında / Kurallar
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium whitespace-pre-wrap">
                {market.description || "Bu piyasa için özel bir kural veya açıklama girilmemiştir. Genel piyasa kuralları geçerlidir."}
              </p>
            </div>

            {/* 5. YORUMLAR (En alt kısım) */}
            <div className="pt-6 sm:pt-8 border-t border-border/50">
               <MarketComments marketId={market.id} initialComments={comments} />
            </div>

          </div>

          {/* SAĞ ALAN (Masaüstünde Sabit Duran Tahmin Paneli) */}
          <div className="hidden lg:block lg:col-span-4">
            <div className="sticky top-24">
              <PredictionPanel market={market} />
            </div>
          </div>

        </div>
      </div>
    </>
  );
}