import { Target, Coins, Trophy, Zap, Info } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Nasıl Çalışır? | Noly Market",
  description: "Noly Market'te nasıl işlem yapılır ve TP kazanılır öğrenin.",
};

export default function DocsPage() {
  const steps = [
    {
      icon: Target,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      title: "1. Bir Piyasa Seçin",
      desc: "Ana sayfada veya kategorilerde siyasetten spora, ekonomiden e-spora kadar yüzlerce aktif soru bulunur. İlgi alanınıza ve bilgi birikiminize en uygun piyasayı bulun."
    },
    {
      icon: Coins,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
      title: "2. Pozisyon Alın",
      desc: "Bir olayın gerçekleşip gerçekleşmeyeceğine inanıyorsanız 'EVET' veya 'HAYIR' hisselerinden birine TP (Noly Point) yatırarak öngörünüzü sisteme kaydedin."
    },
    {
      icon: Zap,
      color: "text-primary",
      bg: "bg-primary/10",
      title: "3. Fiyatları Takip Edin",
      desc: "Piyasadaki oranlar (%70 Evet gibi), diğer kullanıcıların işlemlerine göre gerçek zamanlı olarak değişir. Erken pozisyon almak her zaman daha kazançlıdır."
    },
    {
      icon: Trophy,
      color: "text-green-500",
      bg: "bg-green-500/10",
      title: "4. Sonuç & Ödül Dağıtımı",
      desc: "Belirtilen tarih geldiğinde olay sonuçlandırılır. Doğru tahmini yapan yatırımcılar, havuzda toplanan tüm TP'yi oranları doğrultusunda kendi aralarında paylaşır."
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-[1200px] animate-in fade-in duration-500">
      
      {/* BAŞLIK */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">Nasıl Çalışır?</h1>
        <p className="text-muted-foreground font-medium text-sm sm:text-base">
          Geleceği tahmin etmenin matematiği: 4 basit adımda Noly Market ekosistemini keşfedin ve kazanmaya başlayın.
        </p>
      </div>

      {/* ADIMLAR (GRID) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-16">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={index} className="bg-card border-2 border-border/50 rounded-3xl p-6 sm:p-8 shadow-sm hover:border-primary/40 transition-all hover:shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-foreground/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 transition-all group-hover:bg-primary/10" />
              
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${step.bg}`}>
                <Icon size={28} className={step.color} />
              </div>
              
              <h3 className="text-xl font-black mb-3">{step.title}</h3>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                {step.desc}
              </p>
            </div>
          )
        })}
      </div>

      {/* SIKÇA SORULANLAR (INFO BOX) */}
      <div className="bg-secondary/20 border border-border/50 rounded-[2rem] p-8 sm:p-12 relative overflow-hidden">
         <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-primary to-blue-500"></div>
         <div className="flex items-center gap-3 mb-6">
           <Info size={28} className="text-primary" />
           <h2 className="text-2xl font-black tracking-tight">Kritik Bilgiler</h2>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-bold text-foreground mb-2">TP (Noly Point) Nedir?</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">Platformdaki işlemlerinizi gerçekleştirdiğiniz sanal puan birimidir. Gerçek bir para değeri taşımaz. Günlük görevleri yaparak, doğru tahminlerde bulunarak kazanabilirsiniz.</p>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-2">Piyasaları Kim Sonuçlandırıyor?</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">Sonuçlar, tamamen güvenilir haber kaynakları, resmi federasyonlar (TFF vb.) ve resmi makamların açıklamaları referans alınarak platform yönetimi tarafından şeffaf bir şekilde onaylanır.</p>
            </div>
         </div>
      </div>

    </div>
  );
}