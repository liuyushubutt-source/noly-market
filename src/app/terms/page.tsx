import { FileCheck, ShieldAlert } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-[800px] animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="mb-12">
        <h1 className="text-4xl font-black tracking-tighter mb-4 flex items-center gap-3">
          <FileCheck className="text-primary h-10 w-10" /> KULLANIM KOŞULLARI
        </h1>
        <p className="text-muted-foreground font-medium">Son Güncelleme: 13 Şubat 2026</p>
      </div>

      <div className="prose prose-sm md:prose-base dark:prose-invert prose-headings:font-black prose-a:text-primary max-w-none space-y-8">
        
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-6 flex items-start gap-4 not-prose">
          <ShieldAlert className="text-yellow-500 h-6 w-6 shrink-0 mt-1" />
          <p className="text-sm font-medium leading-relaxed">
            <strong>Önemli Uyarı:</strong> Noly Market bir kumar veya bahis platformu değildir. Sistemde kullanılan "TP" (Tahmin Puanı) gerçek bir para birimi değildir ve nakde çevrilemez. Platform sadece eğlence ve kitlelerin bilgeliğini (wisdom of crowds) ölçme amacı taşır.
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl border-b border-border/50 pb-2">1. Kabul Edilme</h2>
          <p className="text-muted-foreground leading-relaxed">
            Bu web sitesine veya mobil uygulamaya erişerek, bu Kullanım Koşulları'nı ve Gizlilik Politikası'nı okuduğunuzu, anladığınızı ve bunlara yasal olarak bağlı kalmayı kabul etmiş olursunuz.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl border-b border-border/50 pb-2">2. Hesap ve Güvenlik</h2>
          <p className="text-muted-foreground leading-relaxed">
            Hizmetlerimizi kullanabilmek için Google hesabı ile giriş yapmanız gerekmektedir. Hesabınızın gizliliğini korumak sizin sorumluluğunuzdadır. Bir kullanıcının birden fazla (sahte) hesap açarak TP dengesini manipüle etmesi yasaktır ve tespiti halinde hesaplar kalıcı olarak kapatılır.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl border-b border-border/50 pb-2">3. Piyasaların Sonuçlandırılması</h2>
          <p className="text-muted-foreground leading-relaxed">
            Piyasalar, güvenilir ve bağımsız haber kaynaklarına dayanılarak adminler tarafından sonuçlandırılır. Bir piyasanın sonucunda itilaf (anlaşmazlık) çıkması durumunda, yönetim piyasayı iptal edip yatırılan tüm TP'leri iade etme hakkını saklı tutar.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl border-b border-border/50 pb-2">4. Topluluk Kuralları</h2>
          <p className="text-muted-foreground leading-relaxed">
            Piyasa yorumlarında hakaret, nefret söylemi, spam veya manipülatif (yalan haber yayma) içerik paylaşmak kesinlikle yasaktır. İhlal durumunda kullanıcının yorum yapma yetkisi süresiz olarak elinden alınabilir.
          </p>
        </section>

      </div>
    </div>
  );
}