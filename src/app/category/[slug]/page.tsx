import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMarkets } from "@/actions/market-actions";

import { MarketCard } from "@/components/market/market-card"; 

type Props = {
  params: Promise<{ slug: string }>;
};

const categoryNames: Record<string, string> = {
  siyaset: "Siyaset",
  spor: "Spor",
  ekonomi: "Ekonomi",
  kripto: "Kripto",
  teknoloji: "Teknoloji",
  magazin: "Magazin"
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const categoryName = categoryNames[slug] || slug.charAt(0).toUpperCase() + slug.slice(1);

  return {
    title: `${categoryName} Tahminleri`,
    description: `Gündemdeki en son ${categoryName.toLowerCase()} olaylarını Noly Market'te tahmin et, doğru analizle kazan.`,
    openGraph: {
      title: `${categoryName} Tahminleri | Noly Market`,
      description: `En güncel ${categoryName.toLowerCase()} oranları ve tahmin piyasaları.`,
    }
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  
  if (!categoryNames[slug] && slug !== "popular" && slug !== "new") {
    return notFound();
  }

  const categoryName = categoryNames[slug] || slug.charAt(0).toUpperCase() + slug.slice(1);

  // Kategoriye ait piyasaları çekiyoruz
  const markets = await getMarkets({ category: slug, limit: 20 });

  return (
    <div className="container mx-auto px-4 py-8 max-w-[1400px]">
      <div className="mb-8">
        <h1 className="text-3xl md:text-5xl font-black tracking-tight capitalize">
          {categoryName} Piyasaları
        </h1>
        <p className="text-muted-foreground mt-2 font-medium">
          {categoryName} dünyasındaki gelişmeleri tahmin et ve portföyünü büyüt.
        </p>
      </div>

      {markets && markets.length > 0 ? (
        // Grid yapısı senin kartlarına tam uyacak şekilde ayarlandı
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {markets.map((market: any) => (
             <MarketCard key={market.id} market={market} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-secondary/20 rounded-2xl border border-dashed">
          <p className="text-muted-foreground font-medium">Bu kategoride henüz aktif bir piyasa bulunmuyor.</p>
        </div>
      )}
    </div>
  );
}
