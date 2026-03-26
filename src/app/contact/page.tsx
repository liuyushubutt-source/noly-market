"use client";

import { Suspense } from "react";
import { Mail, MapPin, Send, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const dynamic = "force-dynamic";

function ContactContent() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Mesajınız başarıyla iletildi! Ekibimiz en kısa sürede dönüş yapacaktır.");
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-[1200px] animate-in fade-in duration-500">
      
      <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
        <Badge className="bg-primary/10 text-primary border-none uppercase tracking-widest font-black mb-4">7/24 Destek</Badge>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">Bizimle İletişime Geçin</h1>
        <p className="text-muted-foreground font-medium text-sm sm:text-base">
          Sorularınız, iş birliği teklifleriniz veya platformla ilgili geri bildirimleriniz için buradayız.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
        
        {/* İLETİŞİM BİLGİLERİ (Sol Taraf) */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-card border border-border/50 rounded-3xl p-6 sm:p-8 shadow-sm flex items-start gap-4 transition-all hover:border-primary/30">
            <div className="bg-primary/10 p-3 rounded-2xl text-primary"><MapPin size={24} /></div>
            <div>
              <h3 className="font-black text-lg mb-1">Merkez Ofis</h3>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed">İzmir, Türkiye <br/> Noly Teknoloji A.Ş.</p>
            </div>
          </div>

          <div className="bg-card border border-border/50 rounded-3xl p-6 sm:p-8 shadow-sm flex items-start gap-4 transition-all hover:border-primary/30">
            <div className="bg-blue-500/10 p-3 rounded-2xl text-blue-500"><Mail size={24} /></div>
            <div>
              <h3 className="font-black text-lg mb-1">E-Posta</h3>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed">destek@nolymarket.com <br/> info@nolymarket.com</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary to-blue-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <MessageSquare size={32} className="mb-4 text-white/80" />
            <h3 className="font-black text-xl mb-2">Hızlı Destek mi Lazım?</h3>
            <p className="text-sm font-medium text-white/80 mb-6">Sosyal medya hesaplarımızdan (X) bize DM atarak çok daha hızlı yanıt alabilirsiniz.</p>
            <Button variant="secondary" className="w-full font-bold">X (Twitter)'dan Yaz</Button>
          </div>
        </div>

        {/* İLETİŞİM FORMU (Sağ Taraf) */}
        <div className="md:col-span-7 bg-card border border-border/50 rounded-[2rem] p-6 sm:p-10 shadow-lg relative">
          <h2 className="text-2xl font-black tracking-tight mb-6">Mesaj Gönder</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Ad Soyad</label>
                <Input required placeholder="Ahmet Yılmaz" className="h-12 rounded-xl bg-secondary/20 border-border/50 focus-visible:ring-primary" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">E-Posta Adresi</label>
                <Input required type="email" placeholder="ornek@mail.com" className="h-12 rounded-xl bg-secondary/20 border-border/50 focus-visible:ring-primary" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Konu</label>
              <Input required placeholder="Nasıl yardımcı olabiliriz?" className="h-12 rounded-xl bg-secondary/20 border-border/50 focus-visible:ring-primary" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Mesajınız</label>
              <textarea 
                required 
                placeholder="Detayları buraya yazabilirsiniz..." 
                className="flex min-h-[150px] w-full rounded-xl bg-secondary/20 border border-border/50 px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary resize-none placeholder:text-muted-foreground" 
              />
            </div>

            <Button type="submit" className="w-full h-14 rounded-xl font-black text-sm tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
              <Send size={18} className="mr-2" /> MESAJI GÖNDER
            </Button>
          </form>
        </div>

      </div>
    </div>
  );
}


export default function ContactPage() {
  return (
    // Eğer saniyelik bir gecikme olursa ekranda patlamak yerine yumuşak bir yükleniyor ekranı gösterecek
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold text-muted-foreground animate-pulse">Sayfa yükleniyor...</div>}>
      <ContactContent />
    </Suspense>
  );
}
