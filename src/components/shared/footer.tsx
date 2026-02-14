import Link from "next/link";
import { TrendingUp, Twitter, Github, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/95 mt-20">
      <div className="container mx-auto px-4 py-12 max-w-[1400px]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          
          {/* Marka & Açıklama */}
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center space-x-2 font-black text-xl tracking-tighter">
              <span className="text-2xl">📉</span>
              <span>NOLYMARKET</span>
            </Link>
            <p className="text-muted-foreground text-sm font-medium leading-relaxed">
              Türkiye'nin ilk ve en aktif gündem tahmin piyasası. Bilgini teste sok, geleceği öngör ve liderlik tablosuna adını yazdır.
            </p>
            <div className="flex gap-4 pt-2">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors"><Twitter size={20} /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors"><Github size={20} /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors"><Mail size={20} /></Link>
            </div>
          </div>

          {/* Linkler */}
          <div>
            <h4 className="font-black text-base mb-4 uppercase tracking-wider">Platform</h4>
            <ul className="space-y-3 text-sm font-medium text-muted-foreground">
              <li><Link href="/" className="hover:text-primary transition-colors">Piyasalar</Link></li>
              <li><Link href="/leaderboard" className="hover:text-primary transition-colors">Liderlik Tablosu</Link></li>
              <li><Link href="/rewards" className="hover:text-primary transition-colors">Ödüller & TP</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-base mb-4 uppercase tracking-wider">Geliştirici</h4>
            <ul className="space-y-3 text-sm font-medium text-muted-foreground">
              <li><Link href="/api-docs" className="hover:text-primary transition-colors">API Dokümantasyonu</Link></li>
              <li><Link href="/docs" className="hover:text-primary transition-colors">Nasıl Çalışır?</Link></li>
              <li><Link href="/accuracy" className="hover:text-primary transition-colors">Doğruluk Oranları</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-base mb-4 uppercase tracking-wider">Yasal</h4>
            <ul className="space-y-3 text-sm font-medium text-muted-foreground">
              <li><Link href="/terms" className="hover:text-primary transition-colors">Kullanım Koşulları</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Gizlilik Politikası</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">İletişim</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-bold text-muted-foreground">
          <p>© {new Date().getFullYear()} Noly Market. Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-primary" />
            <span>Türkiye'de <span className="text-primary">❤️</span> ile geliştirildi</span>
          </div>
        </div>
      </div>
    </footer>
  );
}