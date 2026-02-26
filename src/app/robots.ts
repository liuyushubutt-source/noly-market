import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*', // Tüm arama motoru botlarına (Google, Bing, Yandex) izin ver
      allow: '/',     // Sitenin tamamını taramalarına izin ver
      disallow: [
        '/api/',      // API yollarını taramalarını engelle (Güvenlik ve kota tasarrufu için)
        '/_next/',    // Next.js'in kendi sistem dosyalarını taramalarını engelle
      ],
    },
    // SİTE HARİTASI BAĞLANTISI (En kritik yer!)
    // Google botu robots.txt'yi okuduğunda sitemap'in nerede olduğunu otomatik bulacak.
    sitemap: 'https://nolymarket.com/sitemap.xml',
  };
}