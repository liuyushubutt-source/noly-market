import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BalanceProvider } from "@/context/balance-context";
import { ThemeProvider } from "@/components/theme-provider";
import { BottomNav } from "@/components/shared/bottom-nav";
import { Toaster } from "sonner";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

// 1. VIEWPORT AYARLARI
export const viewport: Viewport = {
  themeColor: "#0f172a", // Koyu tema rengin neyse ona göre ayarla
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

// 2. GELİŞMİŞ METADATA (Google Botları İçin Maksimum Veri)
export const metadata: Metadata = {
  metadataBase: new URL("https://nolymarket.com"),
  title: {
    default: "Noly Market | Türkiye'nin İlk ve En Büyük Tahmin Pazarı",
    template: "%s | Noly Market"
  },
  description: "Siyaset, spor, teknoloji ve ekonomi üzerine gerçek zamanlı tahminlerde bulunun. N'OLY diyerek gündemi takip edin, bilginizi kazanca dönüştürün ve portföyünüzü büyütün.",
  keywords: [
    "tahmin pazarı", "prediction market", "gündem tahmin", "siyaset tahminleri", 
    "kripto", "spor tahmin", "noly market", "bilgi yarışması", "tp kazan", "noly"
  ],
  authors: [{ name: "Noly Teknoloji A.Ş." }],
  creator: "Noly Market",
  publisher: "Noly Market",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: "https://nolymarket.com",
  },
  openGraph: {
    title: "Noly Market | Türkiye'nin Lider Tahmin Platformu",
    description: "Geleceği öngör, doğru verilerle strateji geliştir ve sıralamada yüksel.",
    url: "https://nolymarket.com",
    siteName: "Noly Market",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Noly Market | Lider Tahmin Platformu",
    description: "Gerçek zamanlı oranlarla siyaset, spor ve ekonomi tahminleri.",
  },
  // ÖNEMLİ: Google Search Console onay kodunu buraya eklemelisin!
  verification: {
    google: "dPuRup7ZCI5wcN22jzFSfrM6DzoPVn_0I57bu6vAIXc", 
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  
  // 3. KUSURSUZ JSON-LD (Sitelinks ve Kurumsal Görünüm İçin Sinyal)
  // Google'a sitemizin sıradan bir blog değil, bir "Organizasyon" ve alt menüleri olan bir "Platform" olduğunu söylüyoruz.
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Noly Market",
      "url": "https://nolymarket.com",
      "description": "Türkiye'nin en büyük tahmin pazarı.",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://nolymarket.com/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Noly Market",
      "url": "https://nolymarket.com",
      "logo": "https://nolymarket.com/logo.png", // Kendi logo linkinle değiştir
      "sameAs": [
        "https://twitter.com/nolymarket", // Varsa sosyal medya linklerin
        "https://instagram.com/nolymarket"
      ]
    },
    {
      // İŞTE SITELINKS İÇİN GOOGLE'A VERDİĞİMİZ KOPYA (SiteNavigationElement)
      "@context": "https://schema.org",
      "@type": "ItemList",
      "itemListElement": [
        {
          "@type": "SiteNavigationElement",
          "position": 1,
          "name": "Piyasalar",
          "url": "https://nolymarket.com/"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 2,
          "name": "Liderlik Tablosu",
          "url": "https://nolymarket.com/leaderboard"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 3,
          "name": "Görevler ve Ödüller",
          "url": "https://nolymarket.com/rewards"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 4,
          "name": "Nasıl Çalışır?",
          "url": "https://nolymarket.com/docs"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 5,
          "name": "İletişim",
          "url": "https://nolymarket.com/contact"
        }
      ]
    }
  ];

  return (
    <html lang="tr" suppressHydrationWarning> 
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <BalanceProvider>
            <div className="relative flex min-h-screen flex-col">
              <Suspense fallback={<div className="h-16 w-full bg-background animate-pulse" />}>
                <Navbar />
              </Suspense>
              
              <main className="flex-1 pb-16 md:pb-0">{children}</main>
              
              <Footer />
              
              <Suspense fallback={null}>
                <BottomNav />
              </Suspense>
            </div>
            <Toaster richColors position="bottom-right" />
          </BalanceProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
