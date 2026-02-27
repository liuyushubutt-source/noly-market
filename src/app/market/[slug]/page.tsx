import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMarketDetail, getMarketPrices } from "@/actions/market-actions";
import { getMarketComments } from "@/actions/comment-actions";
import { MarketChart } from "@/components/market/market-chart";
import { PredictionPanel } from "@/components/market/prediction-panel";
import { MarketComments } from "@/components/market/market-comments";
import { Badge } from "@/components/ui/badge";
import { Clock, Info, CheckCircle2, XCircle, Activity, TrendingUp, AlertTriangle } from "lucide-react";

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

  let chartData: any[] = [];
  let comments: any[] = [];
  let chartError = false;

  try {
    const results = await Promise.all([
      getMarketPrices(market.id, market.market_type),
      getMarketComments(market.id)
    ]);
    chartData = results[0] || [];
    comments = results[1] || [];
  } catch (error) {
    console.error("Market Detay Veri Çekme Hatası:", error);
    chartError = true;
  }

  // --- 🌟 SEO ALTIN VURUŞU: DİNAMİK QAPage ŞEMASI ---
  // 1. Breadcrumb (Site Haritası Yolu) Şeması
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Noly Market", "item": "https://nolymarket.com/" },
      { "@type": "ListItem", "position": 2, "name": market.category ? (market.category.charAt(0).toUpperCase() + market.category.slice(1)) : "Piyasalar", "item": `https://nolymarket.com/category/${market.category?.toLowerCase() || 'genel'}` },
      { "@type": "ListItem", "position": 3, "name": market.question, "item": `https://nolymarket.com/market/${market.slug}` }
    ]
  };

  // 2. Çoklu Seçenekleri ve Binary'i Dinamik Olarak Cevaplara (Answers) Çeviren Algoritma
  let suggestedAnswers = [];
  
  if (market.market_type === 'binary') {
    const yesProb = Math.round((market.yes_probability || 0.5) * 100);
    const noProb = 100 - yesProb;
    suggestedAnswers = [
      { "@type": "Answer", "text": `Evet (%${yesProb} İhtimal)`, "url": `https://nolymarket.com/market/${market.slug}` },
      { "@type": "Answer", "text": `Hayır (%${noProb} İhtimal)`, "url": `https://nolymarket.com/market/${market.slug}` }
    ];
  } else if (market.market_options && market.market_options.length > 0) {
    // Eğer çoklu seçenekliyse (Multiple Choice), tüm şıkları Google'a gönder
    suggestedAnswers = market.market_options.map((opt: any) => ({
      "@type": "Answer",
      "text": `${opt.name} (%${Math.round((opt.probability || 0) * 100)} İhtimal)`,
      "url": `https://nolymarket.com/market/${market.slug}`
    }));
  }

  // 3. QAPage Şeması (Google'da Soru-Cevap Kutucukları Çıkarmak İçin)
  const qaSchema = {
    "@context": "https://schema.org",
    "@type": "QAPage",
    "mainEntity": {
      "@type": "Question",
      "name": market.question,
      "text": market.description || "Bu piyasada yatırımcılar gelecekteki bu olayın sonucunu oranlarla tahmin ediyor.",
      "answerCount": suggestedAnswers.length,
      "suggestedAnswer": suggestedAnswers
    }
  };

  // İki şemayı birleştirip Google'a tek bir paket (Array) olarak sunuyoruz
  const jsonLd = [breadcrumbSchema, qaSchema];

  const isResolved = market.status === 'resolved';
  const isCancelled = market.status === 'cancelled';
  const isActive = market.status === 'active';

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      <div className="container mx-auto px-2 sm:px-4 py-4 md:py-8 max-w-[1400px] animate-in fade-in duration-500">
        
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:gap-8">
          
          {/* SOL ALAN */}
          <div className="lg:col-span-8 flex flex-col gap-4 sm:gap-6">
            
            {/* 1. PREMIUM BAŞLIK ALANI */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                
                <Badge variant="secondary" className="uppercase tracking-widest text-[9px] sm:text-[10px] font-black border-none px-2 py-0.5 sm:py-1">
                  {market.category}
                </Badge>
                
                {isResolved && <Badge className="bg-green-500/10 hover:bg-green-500/20 text-green-500 border-none uppercase tracking-widest text-[9px] sm:text-[10px] font-black"><CheckCircle2 size={12} className="mr-1"/> Sonuçlandı</Badge>}
                {isCancelled && <Badge className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border-none uppercase tracking-widest text-[9px] sm:text-[10px] font-black"><XCircle size={12} className="mr-1"/> İptal Edildi</Badge>}
                {isActive && <Badge className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border-none uppercase tracking-widest text-[9px] sm:text-[10px] font-black"><Activity size={12} className="mr-1"/> İşleme Açık</Badge>}

                <Badge variant="outline" className="uppercase tracking-widest text-[9px] sm:text-[10px] font-black border-border/50 text-muted-foreground px-2 py-0.5 sm:py-1">
                  <TrendingUp size={12} className="mr-1 text-primary"/> 
                  {market.total_volume_tp ? Math.round(market.total_volume_tp).toLocaleString() : 0} TP Hacim
                </Badge>

                <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground font-bold ml-auto bg-secondary/30 px-2 py-1 sm:py-1.5 rounded-md">
                  <Clock size={12} />
                  Bitiş: {new Date(market.end_date).toLocaleDateString("tr-TR")}
                </div>
              </div>

              <h1 className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight leading-snug pr-2">
                {market.question}
              </h1>
            </div>

            {/* 2. MOBİL TAHMİN PANELİ (Üstte) */}
            <div className="block lg:hidden mt-2 mb-2">
              <PredictionPanel market={market} />
            </div>

            {/* 3. PREMIUM GRAFİK ALANI */}
            <div className="bg-card border border-border/50 sm:border-2 rounded-2xl sm:rounded-3xl p-3 sm:p-6 h-[280px] sm:h-[420px] shadow-sm relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-48 sm:w-80 h-48 sm:h-80 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none transition-all duration-700 group-hover:bg-primary/10" />
               
               <div className="relative z-10 h-full w-full">
                 {!chartError ? (
                   <MarketChart data={chartData} market={market} />
                 ) : (
                   <div className="flex flex-col items-center justify-center h-full text-center opacity-50 bg-secondary/10 rounded-xl border border-dashed border-border/50">
                     <AlertTriangle size={40} className="mb-3 text-red-500/50" />
                     <p className="font-bold text-sm">Grafik Verisi Alınamadı</p>
                     <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">Sunucu kaynaklı bir hata oluştu, ancak yatırım yapmaya devam edebilirsiniz.</p>
                   </div>
                 )}
               </div>
            </div>

            {/* 4. AÇIKLAMA VE KURALLAR KUTUSU */}
            <div className="bg-secondary/10 rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 border border-border/50 shadow-sm relative overflow-hidden mt-2">
              <div className="absolute left-0 top-0 bottom-0 w-1 sm:w-1.5 bg-gradient-to-b from-primary to-purple-500"></div>
              
              <h3 className="font-black text-base sm:text-lg flex items-center gap-2 mb-2 sm:mb-3 tracking-tight">
                <Info size={18} className="text-primary" /> Piyasa Hakkında
              </h3>
              <p className="text-[13px] sm:text-sm text-muted-foreground leading-relaxed font-medium whitespace-pre-wrap">
                {market.description || "Bu piyasa için özel bir kural girilmemiştir. Standart Noly Market kuralları geçerlidir."}
              </p>
            </div>

            {/* 5. YORUMLAR / TROLLBOX */}
            <div className="pt-4 sm:pt-6">
               <MarketComments marketId={market.id} initialComments={comments} />
            </div>

          </div>

          {/* SAĞ ALAN (Masaüstü Tahmin Paneli) */}
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