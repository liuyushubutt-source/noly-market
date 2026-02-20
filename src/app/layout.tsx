import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BalanceProvider } from "@/context/balance-context";
import { ThemeProvider } from "@/components/theme-provider"; // Tema
import { BottomNav } from "@/components/shared/bottom-nav"; // Alt Menü
import { Toaster } from "sonner";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://nolymarket.com"), // Sitenin temel URL'si
  title: {
    default: "Noly Market | Türkiye'nin En Büyük Tahmin Pazarı",
    template: "%s | Noly Market" // Alt sayfalarda "Spor | Noly Market" şeklinde görünmesini sağlar
  },
  description: "Siyaset, spor, teknoloji ve ekonomi üzerine gerçek zamanlı tahminlerde bulunun. Gündemi takip ederek bilginizi kazanca dönüştürün ve portföyünüzü büyütün.",
  keywords: ["tahmin pazarı", "prediction market", "gündem tahmin", "siyaset", "kripto", "spor"],
  openGraph: {
    title: "Noly Market | Türkiye'nin En Büyük Tahmin Pazarı",
    description: "Geleceği öngör, doğru verilerle strateji geliştir ve kazan.",
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
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  
  // Google'ın siteyi bir organizasyon/platform olarak tanıması için Schema Markup
  const jsonLd = {
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
  };

  return (
    <html lang="tr" suppressHydrationWarning> 
      <head>
        {/* Schema Markup'ı buraya ekliyoruz */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <BalanceProvider>
            <div className="relative flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1 pb-16 md:pb-0">{children}</main>
              <Footer />
              <BottomNav />
            </div>
            <Toaster richColors position="bottom-right" />
          </BalanceProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}