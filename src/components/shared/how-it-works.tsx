"use client";

import { useState } from "react";
import { useBalance } from "@/context/balance-context";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { PlayCircle, DollarSign, Trophy, ArrowRight, BookOpen } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";

export function HowItWorks({ isFloating = false }: { isFloating?: boolean }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const { user } = useBalance();
  const supabase = createClient();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const login = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback` } });
  };

  const handleAction = () => {
    if (user) setOpen(false);
    else { setOpen(false); login(); }
  };

  const Content = () => (
    <div className="space-y-6 pb-6 px-4 md:px-0">
      {step === 1 && (
        <div className="space-y-4 pt-4 animate-in fade-in slide-in-from-right-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center"><PlayCircle className="w-8 h-8 text-blue-600" /></div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-black">1. Piyasayı İncele</h3>
            <p className="text-muted-foreground font-medium">Gündemdeki soruları bul ve 'Evet' veya 'Hayır' hisselerinden birini seç.</p>
          </div>
          <Button className="w-full font-bold h-12 text-lg" onClick={() => setStep(2)}>Devam Et <ArrowRight size={16} className="ml-2"/></Button>
        </div>
      )}
      {step === 2 && (
        <div className="space-y-4 pt-4 animate-in fade-in slide-in-from-right-4">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center"><DollarSign className="w-8 h-8 text-green-600" /></div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-black">2. Öngörünü Yap</h3>
            <p className="text-muted-foreground font-medium">Başlangıç sermayen olan TP'leri kullanarak fikrine yatırım yap. İşlem ücreti yok.</p>
          </div>
          <Button className="w-full font-bold h-12 text-lg" onClick={() => setStep(3)}>Devam Et <ArrowRight size={16} className="ml-2"/></Button>
        </div>
      )}
      {step === 3 && (
        <div className="space-y-4 pt-4 animate-in fade-in slide-in-from-right-4">
          <div className="mx-auto w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center"><Trophy className="w-8 h-8 text-yellow-600" /></div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-black">3. Haklı Çık ve Kazan 🤑</h3>
            <p className="text-muted-foreground font-medium">Piyasa sonuçlandığında, doğru tahmininle yatırdığın TP'leri katla.</p>
          </div>
          <Button className="w-full font-bold h-12 text-lg bg-primary hover:bg-primary/90" onClick={handleAction}>
            {user ? "Hemen Tahmin Yap" : "Kayıt Ol / Giriş Yap"}
          </Button>
        </div>
      )}
      <div className="flex justify-center gap-2 mt-4">
        {[1, 2, 3].map((i) => (<div key={i} className={`w-2 h-2 rounded-full transition-colors ${step === i ? "bg-primary" : "bg-muted"}`} />))}
      </div>
    </div>
  );

  // MASAÜSTÜ VEYA NORMAL GÖRÜNÜM
  if (isDesktop || !isFloating) {
    return (
      <Dialog open={open} onOpenChange={(val) => { setOpen(val); setStep(1); }}>
        <Button variant="ghost" className={`text-xs font-bold text-blue-500 hover:text-blue-600 ${isFloating ? 'hidden' : 'hidden lg:flex'}`} onClick={() => setOpen(true)}>
          <BookOpen size={14} className="mr-1" /> Nasıl Çalışır?
        </Button>
        <DialogContent className="sm:max-w-md bg-background/90 backdrop-blur-xl border-border/50">
          {/* KRİTİK EKLENTİ: Ekran okuyucular için gizli DialogTitle eklendi */}
          <DialogHeader>
            <DialogTitle className="sr-only">Sistem Nasıl Çalışır?</DialogTitle>
          </DialogHeader>
          <Content />
        </DialogContent>
      </Dialog>
    );
  }

  // MOBİL YÜZEN BUTON (FLOATING PILL)
  return (
    <Drawer open={open} onOpenChange={(val) => { setOpen(val); setStep(1); }}>
      <div className="fixed bottom-[80px] left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
        <Button 
          onClick={() => setOpen(true)}
          className="rounded-full bg-background/80 backdrop-blur-xl border border-border/50 shadow-2xl text-foreground hover:bg-background font-bold text-xs h-10 px-5 gap-2"
        >
          <BookOpen size={14} className="text-blue-500" /> Nasıl Çalışır?
        </Button>
      </div>
      <DrawerContent className="bg-background/80 backdrop-blur-2xl border-border/50 pb-safe">
        {/* Zaten Drawer'da eklemiştik */}
        <DrawerHeader><DrawerTitle className="sr-only">Sistem Nasıl Çalışır?</DrawerTitle></DrawerHeader>
        <Content />
      </DrawerContent>
    </Drawer>
  );
}