import { MetadataRoute } from 'next';
import { getAllMarketSlugs } from '@/actions/market-actions'; // Yeni yazdığımız fonksiyonu import ettik

export const revalidate = 3600; // Sitemap her 1 saatte bir güncellensin (Cache)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://nolymarket.com'; // Domain adresin

 const staticRoutes = [
    '',              
    '/leaderboard',  
    '/rewards',      
    '/help',         
    '/accuracy',     
    '/terms',
    // --- YENİ EKLENEN KATEGORİLER ---
    '/category/siyaset',
    '/category/spor',
    '/category/ekonomi',
    '/category/kripto',
    '/category/teknoloji'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8, // Ana sayfa 1, diğerleri 0.8
  }));

  // 2. Dinamik Piyasalar (Veritabanından Otomatik Gelenler)
  let dynamicRoutes: MetadataRoute.Sitemap = [];

  try {
    const markets = await getAllMarketSlugs();
    
    dynamicRoutes = markets.map((market) => ({
      url: `${baseUrl}/market/${market.slug}`,
      lastModified: market.updated_at ? new Date(market.updated_at) : new Date(),
      changeFrequency: 'hourly' as const, // Oranlar değiştiği için saatlik tarama istiyoruz
      priority: 0.9, // Piyasa sayfaları bizim için en değerli sayfalar
    }));

  } catch (error) {
    console.error("Sitemap oluşturulurken hata:", error);
  }

  // Hepsini birleştirip döndürüyoruz
  return [...staticRoutes, ...dynamicRoutes];
}