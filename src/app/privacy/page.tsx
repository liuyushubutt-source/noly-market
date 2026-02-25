import { ShieldCheck, Lock, EyeOff, Server } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Gizlilik ve Kullanım Şartları | Noly Market",
  description: "Noly Market platformunun gizlilik politikası ve kullanıcı sözleşmesi.",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-[1000px] animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="bg-gradient-to-br from-card to-secondary/30 border border-border/50 rounded-[2rem] p-8 sm:p-12 mb-10 relative overflow-hidden text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
        <ShieldCheck size={48} className="mx-auto text-primary mb-4 relative z-10" />
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 relative z-10">Gizlilik & Sözleşme</h1>
        <p className="text-muted-foreground font-medium text-sm sm:text-base max-w-2xl mx-auto relative z-10">
          Noly Market olarak verilerinizi koruyor ve şeffaf bir platform sunuyoruz. Platformu kullanarak aşağıdaki şartları kabul etmiş sayılırsınız.
        </p>
      </div>

      {/* İÇERİK */}
      <div className="bg-card border border-border/50 rounded-[2rem] p-6 sm:p-10 shadow-sm space-y-10">
        
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary"><Lock size={20} /></div>
            <h2 className="text-xl font-black tracking-tight">1. Genel Hükümler ve Sorumluluk Reddi</h2>
          </div>
          <div className="text-muted-foreground text-sm leading-relaxed space-y-4">
            <p>Noly Market ("Platform"), kullanıcıların belirli konularda öngörülerde bulunduğu sosyal bir tahmin ve analiz platformudur.</p>
            <p><strong className="text-foreground">Sanal Ekonomi (TP):</strong> Platform içerisinde kullanılan "TP" (Noly Point), hiçbir şekilde itibari para (Fiat currency) veya kripto para birimi karşılığı olmayan, tamamen platform içi bir etkileşim puanıdır. TP puanları nakde çevrilemez, satılamaz veya dışarıya transfer edilemez. Noly Market bir kumar veya bahis sitesi değildir.</p>
            <p><strong className="text-foreground">Yaş Sınırı:</strong> Platformu kullanabilmek için 18 yaşını doldurmuş olmanız gerekmektedir. Yanlış beyanlardan doğacak hukuki sorumluluk tamamen kullanıcıya aittir.</p>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Server size={20} /></div>
            <h2 className="text-xl font-black tracking-tight">2. Veri Toplama ve İşleme (KVKK)</h2>
          </div>
          <div className="text-muted-foreground text-sm leading-relaxed space-y-4">
            <p>Sizlere daha iyi bir hizmet sunabilmek amacıyla hesap bilgileriniz (Ad, e-posta adresi), platform içi hareketleriniz (tahminler, yorumlar) ve cihaz bilgileriniz güvenli sunucularımızda şifrelenerek saklanmaktadır.</p>
            <p>Verileriniz, yalnızca platform deneyimini kişiselleştirmek ve güvenlik ihlallerini önlemek amacıyla işlenir. Hiçbir kişisel veriniz 3. taraf reklam şirketleriyle satılmaz veya izinsiz paylaşılmaz.</p>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500"><EyeOff size={20} /></div>
            <h2 className="text-xl font-black tracking-tight">3. Platform Kuralları ve Yaptırımlar</h2>
          </div>
          <div className="text-muted-foreground text-sm leading-relaxed space-y-4">
            <ul className="list-disc pl-5 space-y-2">
              <li>Tartışma panolarında (Yorumlar) nefret söylemi, yasa dışı içerik paylaşımı veya spam yapmak kesinlikle yasaktır.</li>
              <li>Sistemi manipüle etmeye yönelik bot kullanımı, çoklu hesap (multi-accounting) veya açık arama işlemleri tespit edildiğinde hesaplar kalıcı olarak silinir ve tüm TP bakiyesi sıfırlanır.</li>
              <li>Piyasa sonuçlandırmaları platform yöneticileri veya güvenilir veri sağlayıcıları tarafından yapılır. Sonuçlara itiraz hakkı saklı olmakla birlikte, nihai karar Noly Market yönetimine aittir.</li>
            </ul>
          </div>
        </section>

        <div className="pt-8 border-t border-border/50 text-center">
          <Badge variant="secondary" className="font-bold text-xs uppercase tracking-widest">Son Güncelleme: 25 Şubat 2026</Badge>
        </div>

      </div>
    </div>
  );
}