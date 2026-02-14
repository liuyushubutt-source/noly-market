import { HelpCircle, Search, MessageSquare } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function HelpPage() {
  const faqs = [
    {
      q: "TP (Tahmin Puanı) nedir, nasıl kazanılır?",
      a: "TP, sistemimizin temel para birimidir. Sisteme ilk kayıt olduğunuzda size ücretsiz olarak 1000 TP verilir. Piyasalar hakkında doğru öngörülerde bulunarak bu puanı katlayabilirsiniz."
    },
    {
      q: "Gerçek para yatırabilir miyim veya TP'leri çekebilir miyim?",
      a: "Hayır. Noly Market bir kumar sitesi değildir. TP'ler sadece platform içindeki itibarınızı ve sıralamanızı belirler. Ancak ileride TP'lerinizi 'Ödüller' sayfasında çeşitli site içi ayrıcalıklara dönüştürebilirsiniz."
    },
    {
      q: "Bir piyasaya yatırdığım TP'yi geri çekebilir miyim?",
      a: "Evet. Piyasa kapanmadan (sonuçlanmadan) önce elinizdeki hisseleri güncel fiyattan satarak pozisyonunuzu kapatabilir ve TP'nizi geri (kar veya zararla) alabilirsiniz."
    },
    {
      q: "Oranlar (Fiyatlar) nasıl belirleniyor?",
      a: "Oranlar tamamen arz-talep dengesine (Kitlelerin Bilgeliği) göre AMM (Otomatik Piyasa Yapıcı) algoritmamız tarafından anlık olarak belirlenir. 'Evet' hissesine çok alım gelirse, fiyatı (ihtimali) otomatik olarak yükselir."
    },
    {
      q: "Piyasa yanlış sonuçlandıysa ne yapabilirim?",
      a: "Adminlerimiz sonuçları en güvenilir haber kaynaklarından teyit ederek girer. Ancak insani bir hata olduğunu düşünüyorsanız piyasa yorumlarına yazabilir veya doğrudan destek hesabımızla iletişime geçebilirsiniz."
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-[800px] animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex items-center justify-center p-4 bg-blue-500/10 rounded-full mb-2 border border-blue-500/20 shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)]">
          <HelpCircle className="text-blue-500 h-12 w-12" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter">YARDIM MERKEZİ</h1>
        <p className="text-muted-foreground font-medium text-lg">
          Aklına takılan bir şey mi var? En sık sorulan soruların cevapları burada.
        </p>
      </div>

      <div className="relative mb-12 max-w-lg mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
        <Input placeholder="Sorununuzu yazın..." className="pl-12 h-14 rounded-2xl bg-secondary/50 border-border/50 text-base shadow-sm focus-visible:ring-primary" />
      </div>

      <div className="bg-card border border-border/50 rounded-3xl p-6 md:p-8 shadow-sm mb-12">
        <h2 className="text-xl font-black mb-6 flex items-center gap-2 border-b border-border/50 pb-4">
          Sıkça Sorulan Sorular
        </h2>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-border/50">
              <AccordionTrigger className="text-left font-bold hover:text-primary transition-colors py-4">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground font-medium leading-relaxed pb-4">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="bg-secondary/30 border border-border/50 rounded-3xl p-8 text-center flex flex-col items-center gap-4">
         <div className="bg-primary/20 p-3 rounded-full text-primary"><MessageSquare /></div>
         <h3 className="text-xl font-black">Cevabını bulamadın mı?</h3>
         <p className="text-muted-foreground font-medium text-sm">Bizimle doğrudan iletişime geçmekten çekinme.</p>
         <Button className="font-bold px-8 mt-2 shadow-primary/20 shadow-lg">Bize Ulaş</Button>
      </div>

    </div>
  );
}