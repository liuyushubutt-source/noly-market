import Link from "next/link";
import { TrendingUp, Twitter, Github, Mail, Globe, ArrowRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative border-t border-border/50 bg-background/95 mt-20 overflow-hidden">
      {/* Arka Plan Dekoratif Parlaması */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[800px] h-[200px] bg-primary/5 rounded-[100%] blur-[80px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 py-12 md:py-16 max-w-[1400px] relative z-10">
        
        {/* MOBİL İÇİN 2, MASAÜSTÜ İÇİN 5 SÜTUNLU KUSURSUZ GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 md:gap-12 lg:gap-8">
          
          {/* Marka & Açıklama (Mobilde 2 sütunu da kaplar, Masaüstünde 2 sütun genişliğindedir) */}
          <div className="col-span-2 lg:col-span-2 space-y-6 sm:pr-8">
            <Link href="/" className="inline-flex items-center space-x-2.5 font-black text-2xl tracking-tighter group">
              <div className="bg-primary/10 p-2 rounded-xl border border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <TrendingUp size={24} className="text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <span>NOLY<span className="text-primary">MARKET</span></span>
            </Link>
            <p className="text-muted-foreground text-sm font-medium leading-relaxed max-w-sm">
              Türkiye'nin ilk ve en aktif gündem tahmin piyasası. Gelişmeleri analiz et, pozisyonunu al ve dijital portföyünü büyüt.
            </p>
            
            {/* Premium Sosyal İkonlar */}
            <div className="flex items-center gap-3 pt-2">
              <Link href="#" className="bg-secondary/50 p-2.5 rounded-xl text-muted-foreground hover:bg-[#1DA1F2] hover:text-white transition-all duration-300 hover:-translate-y-1 shadow-sm">
                <Twitter size={18} />
              </Link>
              <Link href="#" className="bg-secondary/50 p-2.5 rounded-xl text-muted-foreground hover:bg-foreground hover:text-background transition-all duration-300 hover:-translate-y-1 shadow-sm">
                <Github size={18} />
              </Link>
              <Link href="#" className="bg-secondary/50 p-2.5 rounded-xl text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:-translate-y-1 shadow-sm">
                <Mail size={18} />
              </Link>
            </div>
          </div>

          {/* Linkler - 1 */}
          <div className="col-span-1">
            <h4 className="font-black text-sm mb-5 uppercase tracking-widest text-foreground">Platform</h4>
            <ul className="space-y-4 text-sm font-medium text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-primary transition-all duration-300 flex items-center group">
                  <span className="h-1.5 w-1.5 bg-primary rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  Keşfet
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="hover:text-primary transition-all duration-300 flex items-center group">
                  <span className="h-1.5 w-1.5 bg-primary rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  Portfolyo
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="hover:text-primary transition-all duration-300 flex items-center group">
                  <span className="h-1.5 w-1.5 bg-primary rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  Liderlik Tablosu
                </Link>
              </li>
              <li>
                <Link href="/rewards" className="hover:text-primary transition-all duration-300 flex items-center group">
                  <span className="h-1.5 w-1.5 bg-primary rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  Ödüller & Görevler
                </Link>
              </li>
            </ul>
          </div>

          {/* Linkler - 2 */}
          <div className="col-span-1">
            <h4 className="font-black text-sm mb-5 uppercase tracking-widest text-foreground">Geliştirici</h4>
            <ul className="space-y-4 text-sm font-medium text-muted-foreground">
              <li>
                <Link href="/api-docs" className="hover:text-primary transition-all duration-300 flex items-center group">
                  <span className="h-1.5 w-1.5 bg-primary rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  API Servisleri
                </Link>
              </li>
              <li>
                <Link href="/docs" className="hover:text-primary transition-all duration-300 flex items-center group">
                  <span className="h-1.5 w-1.5 bg-primary rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  Sistem Nasıl Çalışır?
                </Link>
              </li>
              <li>
                <Link href="/accuracy" className="hover:text-primary transition-all duration-300 flex items-center group">
                  <span className="h-1.5 w-1.5 bg-primary rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  Tahmin Raporları
                </Link>
              </li>
            </ul>
          </div>

          {/* Linkler - 3 */}
          <div className="col-span-2 sm:col-span-1">
            <h4 className="font-black text-sm mb-5 uppercase tracking-widest text-foreground">Kurumsal</h4>
            <ul className="space-y-4 text-sm font-medium text-muted-foreground">
              <li>
                <Link href="/terms" className="hover:text-primary transition-all duration-300 flex items-center group">
                  <span className="h-1.5 w-1.5 bg-primary rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  Kullanıcı Sözleşmesi
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary transition-all duration-300 flex items-center group">
                  <span className="h-1.5 w-1.5 bg-primary rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  Gizlilik Politikası
                </Link>
              </li>
             
            </ul>
          </div>
        </div>

        {/* ALT BİLGİ (KOPYALAMA HAKLARI VE DURUM) */}
        <div className="mt-16 pt-6 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-6">
          
          <p className="text-xs font-bold text-muted-foreground order-2 md:order-1 text-center md:text-left">
            © {new Date().getFullYear()} Noly Market. Tüm hakları saklıdır. Platformdaki veriler bilgilendirme amaçlıdır.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 order-1 md:order-2 text-[11px] sm:text-xs font-black uppercase tracking-widest text-muted-foreground">
            {/* Sistem Aktif Rozeti */}
            <div className="flex items-center gap-2 bg-secondary/40 border border-border/50 px-3 py-1.5 rounded-lg">
               <span className="relative flex h-2.5 w-2.5">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
               </span>
               Sistem Aktif
            </div>

            {/* Dil / Lokasyon Rozeti */}
            <div className="flex items-center gap-1.5 bg-secondary/40 border border-border/50 px-3 py-1.5 rounded-lg hover:text-foreground cursor-pointer transition-colors">
               <Globe size={14} /> Türkçe (TR)
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}