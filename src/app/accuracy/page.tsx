

import { ShieldCheck, TrendingUp, Users, Target, BarChart3 } from "lucide-react";

export const dynamic = "force-dynamic";

export default function AccuracyPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-[900px] animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex items-center justify-center p-4 bg-green-500/10 rounded-full mb-2 border border-green-500/20 shadow-[0_0_30px_-5px_rgba(34,197,94,0.3)]">
          <ShieldCheck className="text-green-500 h-12 w-12" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter">
          NOLY MARKET NE KADAR İSABETLİ?
        </h1>
        <p className="text-muted-foreground font-medium text-lg max-w-2xl mx-auto">
          Piyasalarımız haber sitelerinden veya anketlerden daha isabetlidir. Çünkü burada insanlar görüşlerini sadece söylemez, arkasına "TP" koyarlar.
        </p>
      </div>

      {/* İSTATİSTİKLER */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        <div className="bg-card border border-border/50 rounded-[2rem] p-6 text-center shadow-sm">
          <Target className="h-8 w-8 text-primary mx-auto mb-3" />
          <p className="text-4xl font-black">%84</p>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">İsabet Oranı</p>
        </div>
        <div className="bg-card border border-border/50 rounded-[2rem] p-6 text-center shadow-sm">
          <Users className="h-8 w-8 text-blue-500 mx-auto mb-3" />
          <p className="text-4xl font-black">5.2K+</p>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Aktif Tahminci</p>
        </div>
        <div className="bg-card border border-border/50 rounded-[2rem] p-6 text-center shadow-sm">
          <BarChart3 className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
          <p className="text-4xl font-black">2.4M</p>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Hacim (TP)</p>
        </div>
      </div>

      {/* NASIL ÇALIŞIR METNİ */}
      <div className="bg-secondary/20 border border-border/50 rounded-[2rem] p-8 md:p-10 space-y-6">
        <h2 className="text-2xl font-black flex items-center gap-2">
          Kitlelerin Bilgeliği (Wisdom of the Crowds)
        </h2>
        <div className="space-y-4 text-muted-foreground font-medium leading-relaxed">
          <p>
            Geleneksel anketler insanlara "Ne düşünüyorsun?" diye sorarken, Noly Market <strong>"Neye yatırım yapıyorsun?"</strong> diye sorar.
          </p>
          <p>
            İnsanlar bir fikrin arkasına kendi birikimlerini koyduklarında, duygularından arınır ve analitik düşünmeye başlarlar. Bir piyasada 'Evet' ihtimali %70 olarak görünüyorsa, bu rastgele bir sayı değildir. Bu, o konuya kafa yoran, araştıran ve parasını riske atan yüzlerce kişinin ortak uzlaşmasıdır.
          </p>
          <p>
            Bu dinamik, OPY (Otomatik Piyasa Yapıcı) algoritmamızla birleştiğinde, haber bültenlerinden bile daha hızlı ve doğru bir sinyal mekanizması yaratır.
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center gap-4 text-sm font-bold text-foreground">
          <TrendingUp className="text-green-500 shrink-0" />
          <p>Kısacası; oranlar yanılmaz, sadece henüz bilmediğimiz bir gerçeği yansıtırlar.</p>
        </div>
      </div>

    </div>
  );
}
