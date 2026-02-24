"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { 
  Home, Search, Flame, Menu, PieChart, User, Trophy, 
  Gift, ShieldCheck, Code, FileText, FileCheck, LogOut, 
  Twitter, Instagram, MessageCircle, Hash 
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { ThemeToggle } from "./theme-toggle";
import { HowItWorks } from "./how-it-works"; 
import { useBalance } from "@/context/balance-context";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Trend etiketler (Arama çekmecesi için)
const TRENDING_TAGS = [
  { label: "Erken Seçim", value: "Erken Seçim" },
  { label: "Asgari Ücret", value: "Asgari" },
  { label: "Süper Lig", value: "Super Lig" },
  { label: "Galatasaray", value: "Galatasaray" },
  { label: "Fenerbahçe", value: "Fenerbahçe" },
  { label: "Bitcoin", value: "Bitcoin" }
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, balance } = useBalance();
  const supabase = createClient();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback` } });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearchOpen(false);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    if (searchQuery) params.set("q", searchQuery); else params.delete("q");
    router.push(`/?${params.toString()}`);
  };

  const navigateToTag = (tag: string) => {
    setIsSearchOpen(false);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    params.set("q", tag);
    router.push(`/?${params.toString()}`);
  };

  // Navigasyon Öğeleri
  const NAV_ITEMS = [
    { label: "Ana Sayfa", icon: Home, href: "/", isActive: pathname === "/" },
    { label: "Keşfet", icon: Search, action: () => setIsSearchOpen(true), isActive: isSearchOpen },
    { label: "Gündem", icon: Flame, href: "/?category=popular", isActive: searchParams.get("category") === "popular" },
  ];

  return (
    <>
      <HowItWorks isFloating={true} />

      {/* --- ARAMA ÇEKMECESİ (DRAWER) --- */}
      <Drawer open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DrawerContent className="bg-background/95 backdrop-blur-xl border-border/50 pb-safe h-[85vh]">
          <DrawerHeader className="text-left border-b border-border/50 pb-4">
            <DrawerTitle className="text-lg font-black">Piyasalarda Ara</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 space-y-6 overflow-y-auto no-scrollbar">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                autoFocus
                placeholder="Etiket, soru veya kategori ara..." 
                className="w-full pl-11 h-14 bg-secondary/50 border-border/50 rounded-2xl text-base font-medium focus-visible:ring-primary" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
              />
            </form>

            <div>
              <h4 className="text-[11px] font-black text-muted-foreground uppercase mb-3 tracking-widest flex items-center gap-1">
                <TrendingUp size={14} /> Trend Etiketler
              </h4>
              <div className="flex flex-wrap gap-2">
                {TRENDING_TAGS.map(t => (
                    <Button 
                      key={t.label} variant="secondary" size="sm" 
                      className="h-9 text-xs px-4 font-bold rounded-xl bg-secondary/50 hover:bg-secondary border border-transparent hover:border-border/50" 
                      onClick={() => navigateToTag(t.value)}
                    >
                        <Hash size={14} className="mr-1.5 opacity-50 text-primary"/> {t.label}
                    </Button>
                ))}
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* --- MOBİL ALT MENÜ ÇUBUĞU --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/50 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-around h-[68px] px-2">
          
          {NAV_ITEMS.map((item, index) => (
            item.href ? (
              <Link 
                key={index} href={item.href} 
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${item.isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                <item.icon className={`h-6 w-6 ${item.isActive ? "fill-primary/20 scale-110 transition-transform" : ""}`} strokeWidth={item.isActive ? 2.5 : 2} />
                <span className="text-[10px] font-bold">{item.label}</span>
              </Link>
            ) : (
              <button 
                key={index} onClick={item.action}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${item.isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                <item.icon className={`h-6 w-6 ${item.isActive ? "scale-110 transition-transform" : ""}`} strokeWidth={item.isActive ? 2.5 : 2} />
                <span className="text-[10px] font-bold">{item.label}</span>
              </button>
            )
          ))}

          {/* DAHA FAZLA BUTONU VE YANDAN AÇILAN MENÜ (SHEET) */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <button className="flex flex-col items-center justify-center w-full h-full space-y-1 text-muted-foreground hover:text-foreground transition-colors">
                <Menu className="h-6 w-6" strokeWidth={2} />
                <span className="text-[10px] font-bold">Menü</span>
              </button>
            </SheetTrigger>
            
            <SheetContent side="right" className="w-[85vw] sm:w-[350px] p-0 bg-background/95 backdrop-blur-xl border-l border-border/50 flex flex-col h-full">
              <SheetHeader className="p-5 text-left border-b border-border/50">
                <SheetTitle className="flex items-center gap-2 font-black text-xl tracking-tighter">
                  <span className="text-2xl">📉</span> NOLYMARKET
                </SheetTitle>
              </SheetHeader>
              
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                
                {/* 1. KULLANICI / GİRİŞ ALANI */}
                {user ? (
                  <div className="bg-secondary/30 p-4 rounded-2xl border border-border/50 space-y-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                        <AvatarImage src={user.user_metadata?.avatar_url} className="object-cover" />
                        <AvatarFallback className="font-bold bg-primary text-primary-foreground">{user.email?.[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col overflow-hidden">
                        <span className="font-black text-base truncate">{user.user_metadata?.full_name || "Kullanıcı"}</span>
                        <span className="text-[11px] font-bold text-primary flex items-center gap-1"><Wallet size={12}/> {Math.round(balance).toLocaleString()} TP</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button asChild variant="outline" size="sm" className="w-full font-bold h-9 rounded-xl" onClick={() => setIsMenuOpen(false)}>
                        <Link href="/portfolio"><PieChart size={14} className="mr-1.5"/> Portfolyo</Link>
                      </Button>
                      <Button asChild variant="outline" size="sm" className="w-full font-bold h-9 rounded-xl" onClick={() => setIsMenuOpen(false)}>
                        <Link href="/profile"><User size={14} className="mr-1.5"/> Profilim</Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-primary/5 p-5 rounded-2xl border border-primary/20 text-center space-y-3">
                    <div className="bg-background p-3 rounded-full w-fit mx-auto border border-border/50 shadow-sm"><User size={24} className="text-primary"/></div>
                    <p className="text-xs font-bold text-muted-foreground">Tahmin yapmak ve kazanmak için aramıza katıl.</p>
                    <div className="flex flex-col gap-2 pt-2">
                      <Button onClick={handleGoogleLogin} className="w-full font-black h-11 rounded-xl shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">ÜYE OL</Button>
                      <Button onClick={handleGoogleLogin} variant="outline" className="w-full font-bold h-11 rounded-xl bg-background">Giriş Yap</Button>
                    </div>
                  </div>
                )}

                {/* 2. PLATFORM LİNKLERİ */}
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-2 mb-2">Platform</p>
                  <Link href="/leaderboard" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 text-sm font-bold rounded-xl hover:bg-secondary/50 transition-colors"><Trophy size={18} className="text-yellow-500"/> Liderlik Tablosu</Link>
                  <Link href="/rewards" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 text-sm font-bold rounded-xl hover:bg-secondary/50 transition-colors"><Gift size={18} className="text-pink-500"/> Ödüller & Görevler</Link>
                  <Link href="/accuracy" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 text-sm font-bold rounded-xl hover:bg-secondary/50 transition-colors"><ShieldCheck size={18} className="text-green-500"/> Doğruluk Oranı</Link>
                </div>

                {/* 3. BİLGİ LİNKLERİ */}
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-2 mb-2">Sistem & Bilgi</p>
                  <Link href="/api-docs" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 text-sm font-bold rounded-xl hover:bg-secondary/50 transition-colors text-muted-foreground"><Code size={18} /> API'ler</Link>
                  <Link href="/terms" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 text-sm font-bold rounded-xl hover:bg-secondary/50 transition-colors text-muted-foreground"><FileCheck size={18} /> Kurallar</Link>
                </div>
              </div>

              {/* 4. ALT KISIM (Sosyal Medya, Çıkış ve Tema) */}
              <div className="p-5 border-t border-border/50 bg-secondary/10 space-y-4 mt-auto">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground">Tema Seçimi</span>
                  <ThemeToggle />
                </div>
                
                {/* SOSYAL MEDYA İKONLARI */}
                <div className="flex items-center justify-center gap-3 pt-2">
                  <a href="https://twitter.com" target="_blank" rel="noreferrer" className="p-2.5 bg-background border border-border/50 rounded-full text-muted-foreground hover:text-[#1DA1F2] hover:border-[#1DA1F2] transition-colors shadow-sm"><Twitter size={18} /></a>
                  <a href="https://instagram.com" target="_blank" rel="noreferrer" className="p-2.5 bg-background border border-border/50 rounded-full text-muted-foreground hover:text-[#E1306C] hover:border-[#E1306C] transition-colors shadow-sm"><Instagram size={18} /></a>
                  <a href="https://discord.com" target="_blank" rel="noreferrer" className="p-2.5 bg-background border border-border/50 rounded-full text-muted-foreground hover:text-[#5865F2] hover:border-[#5865F2] transition-colors shadow-sm"><MessageCircle size={18} /></a>
                </div>

                {user && (
                  <Button 
                    variant="ghost" 
                    className="w-full text-red-500 hover:text-red-600 hover:bg-red-500/10 font-bold mt-2 h-10 rounded-xl"
                    onClick={() => { supabase.auth.signOut(); window.location.reload(); }}
                  >
                    <LogOut size={16} className="mr-2"/> Çıkış Yap
                  </Button>
                )}
              </div>

            </SheetContent>
          </Sheet>

        </div>
      </div>
    </>
  );
}