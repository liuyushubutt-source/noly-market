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
  title: "Noly Market | Gündemi Tahmin Et",
  description: "Türkiye'nin en hareketli tahmin piyasası.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning tema paketi için gereklidir
    <html lang="tr" suppressHydrationWarning> 
      <body className={inter.className}>
        {/* Varsayılan Tema Karanlık (dark) */}
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <BalanceProvider>
            <div className="relative flex min-h-screen flex-col">
              <Navbar />
              {/* Mobilde alt menü içeriğin üstüne binmesin diye pb-16 (padding-bottom) ekledik */}
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