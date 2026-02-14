"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PieChart, User, MoreHorizontal, Trophy, Gift, ShieldCheck, Code, FileText, FileCheck } from "lucide-react";
import { Drawer, DrawerContent, DrawerTrigger, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { ThemeToggle } from "./theme-toggle";
import { HowItWorks } from "./how-it-works"; 

export function BottomNav() {
  const pathname = usePathname();

  const NAV_ITEMS = [
    { label: "Ana Sayfa", icon: Home, href: "/" },
    { label: "Portfolyo", icon: PieChart, href: "/portfolio" }, // Burayı ileride ayıracağımız için /portfolio yaptık
    { label: "Profil", icon: User, href: "/profile" },
  ];

  return (
    <>
      <HowItWorks isFloating={true} />

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-t border-border pb-safe">
        <div className="flex items-center justify-around h-16 px-2">
          
          {NAV_ITEMS.map((item) => {
            // Aktif sayfa kontrolü (Ana sayfa haricindekiler alt dizinleri de kapsasın diye startsWith kullanabiliriz)
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            
            return (
              <Link 
                key={item.label} // KRİTİK DÜZELTME BURADA: key olarak label kullanıyoruz
                href={item.href} 
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? "fill-primary/20" : ""}`} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-bold">{item.label}</span>
              </Link>
            );
          })}

          {/* DAHA FAZLA (SLIDE MENU) */}
          <Drawer>
            <DrawerTrigger asChild>
              <button className="flex flex-col items-center justify-center w-full h-full space-y-1 text-muted-foreground hover:text-foreground transition-colors">
                <MoreHorizontal className="h-5 w-5" strokeWidth={2} />
                <span className="text-[10px] font-bold">Daha Fazla</span>
              </button>
            </DrawerTrigger>
            <DrawerContent className="bg-background/95 backdrop-blur-xl border-border/50 pb-safe">
              <DrawerHeader className="text-left border-b border-border/50 pb-4">
                <DrawerTitle className="text-xs font-black text-muted-foreground uppercase tracking-widest">Platform & Ayarlar</DrawerTitle>
              </DrawerHeader>
              <div className="p-4 space-y-1">
                <Link href="/leaderboard" className="flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl hover:bg-secondary transition-colors"><Trophy size={18} className="text-yellow-500"/> Liderlik Tablosu</Link>
                <Link href="/rewards" className="flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl hover:bg-secondary transition-colors"><Gift size={18} className="text-pink-500"/> Ödüller</Link>
                <Link href="/accuracy" className="flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl hover:bg-secondary transition-colors"><ShieldCheck size={18} className="text-green-500"/> Doğruluk</Link>
                
                <div className="my-2 border-t border-border/30" />
                <div className="px-4 py-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Geliştirici & Yasal</div>
                
                <Link href="/api-docs" className="flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl hover:bg-secondary transition-colors"><Code size={18} /> API'ler</Link>
                <Link href="/docs" className="flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl hover:bg-secondary transition-colors"><FileText size={18} /> Dokümantasyon</Link>
                <Link href="/terms" className="flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl hover:bg-secondary transition-colors"><FileCheck size={18} /> Kullanım Koşulları</Link>
                
                <div className="my-2 border-t border-border/30" />
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm font-bold">Tema Değiştir</span>
                  <ThemeToggle />
                </div>
              </div>
            </DrawerContent>
          </Drawer>

        </div>
      </div>
    </>
  );
}