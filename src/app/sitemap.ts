import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://nolymarket.com'; // Kendi domainini yaz

  // 1. Statik Sayfaların (Görselindeki klasörlere göre)
  const staticRoutes = [
    '',
    '/leaderboard',
    '/rewards',
    '/help',
    '/accuracy',
    '/terms'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8, // Ana sayfa en yüksek önceliğe sahip (1)
  }));

  /* 2. Dinamik Market Sayfaların
    İleride veritabanından (Supabase, Prisma vs.) aktif tahmin piyasalarını 
    çekip sitemap'e otomatik eklemek için bu yapıyı kullanacaksın:
  */
  // const activeMarkets = await getActiveMarketsFromDB();
  // const dynamicRoutes = activeMarkets.map((market) => ({
  //   url: `${baseUrl}/market/${market.slug}`,
  //   lastModified: market.updatedAt,
  //   changeFrequency: 'hourly' as const, // Oranlar sürekli değiştiği için saatlik
  //   priority: 0.9,
  // }));

  return [...staticRoutes /*, ...dynamicRoutes*/];
}