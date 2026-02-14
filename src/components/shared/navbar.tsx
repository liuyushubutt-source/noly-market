"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useBalance } from "@/context/balance-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "./theme-toggle";
import { HowItWorks } from "./how-it-works";
import { cn } from "@/lib/utils";
import { NotificationCenter } from "./notification-center";
import { NavbarBalance } from "./navbar-balance";

import { 
  Search, TrendingUp, Landmark, Trophy, Coins, Monitor, Globe, Zap, LogOut, Wallet, 
  User as UserIcon, ChevronRight, ChevronLeft, Bookmark, Menu, Gift, ShieldCheck, 
  Code, FileText, FileCheck, Hash, HelpCircle, Film, Rocket, Cpu, Briefcase, Music, 
  Gamepad2, Car, Home, MapPin, GraduationCap, Flame, PlaneTakeoff, ShieldAlert
} from "lucide-react";

import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, 
  DropdownMenuSeparator, DropdownMenuLabel 
} from "@/components/ui/dropdown-menu";
import {
  Popover, PopoverContent, PopoverTrigger
} from "@/components/ui/popover";

// --- KATMAN 2: ANA KATEGORİLER (Tüm Türkiye ve Global Vizyon) ---
const MAIN_CATEGORIES = [
  { label: "🔥 Popüler", value: "popular", icon: Flame },
  { label: "⚡ Yeni", value: "new", icon: Zap },
  { label: "🇹🇷 Türkiye Gündemi", value: "Türkiye", icon: MapPin },
  { label: "🏛️ Siyaset & Seçim", value: "Siyaset", icon: Landmark },
  { label: "📈 Ekonomi & Finans", value: "Ekonomi", icon: Briefcase },
  { label: "⚽ Spor", value: "Spor", icon: Trophy },
  { label: "🛡️ Savunma Sanayii", value: "Savunma", icon: ShieldAlert },
  { label: "₿ Kripto Varlıklar", value: "Kripto", icon: Coins },
  { label: "💻 Teknoloji & Yapay Zeka", value: "Teknoloji", icon: Cpu },
  { label: "🚗 Otomotiv & Ulaşım", value: "Otomotiv", icon: Car },
  { label: "🏠 Emlak & Konut", value: "Emlak", icon: Home },
  { label: "📚 Eğitim & Sınavlar", value: "Eğitim", icon: GraduationCap },
  { label: "✈️ Turizm & Seyahat", value: "Turizm", icon: PlaneTakeoff },
  { label: "🎬 Magazin & TV", value: "Magazin", icon: Film },
  { label: "🚀 Bilim & Uzay", value: "Bilim", icon: Rocket },
  { label: "🌍 Dünya Gündemi", value: "Dünya", icon: Globe },
];

// --- KATMAN 4: ALT ETİKETLER (Ulusal Hype, Bölgeler & Trendler - 50 Etiket) ---
const SUB_TOPICS = [
  { label: "Tümü", value: null },
  
  // Siyaset, Ekonomi & Toplum
  { label: "Erken Seçim", value: "Erken Seçim" },
  { label: "Asgari Ücret", value: "Asgari" },
  { label: "Emekli Zammı", value: "Emekli" },
  { label: "TCMB Faiz", value: "TCMB" },
  { label: "Dolar/TL", value: "Dolar" },
  { label: "Euro/TL", value: "Euro" },
  { label: "Altın (Gram/ONS)", value: "Altın" },
  { label: "BIST 100", value: "BIST" },
  { label: "Konut Fiyatları", value: "Konut" },
  { label: "Kira Düzenlemesi", value: "Kira" },
  { label: "Vergi Afları", value: "Vergi" },
  { label: "Sokak Hayvanları", value: "Sokak Hayvanları" },
  
  // 🏙️ Şehirler, Bölgeler & Sokak
  { label: "İstanbul Depremi", value: "İstanbul Deprem" },
  { label: "İstanbul Trafiği", value: "İstanbul Trafik" },
  { label: "İstanbul Taksicileri", value: "İBB Taksi" },
  { label: "Ankara Gündemi", value: "Ankara" },
  { label: "İzmir Körfezi", value: "İzmir Körfez" },
  { label: "İzmir Trafiği", value: "İzmir Trafik" },
  { label: "İzmir Taksi Plakası", value: "İzmir Taksi" },
  { label: "Çeşme & Alaçatı Turizmi", value: "Çeşme" },
  { label: "Antalya Turizm", value: "Antalya" },
  { label: "Karadeniz", value: "Karadeniz" },
  { label: "Güneydoğu & Tarım", value: "Güneydoğu" },
  { label: "Ege Sanayisi", value: "Ege Sanayi" },
  { label: "Kentsel Dönüşüm", value: "Kentsel Dönüşüm" },
  
  // ⚽ Spor & 🎮 E-Spor
  { label: "Süper Lig", value: "Super Lig" },
  { label: "TFF Kararları", value: "TFF" },
  { label: "Galatasaray", value: "Galatasaray" },
  { label: "Fenerbahçe", value: "Fenerbahçe" },
  { label: "Beşiktaş", value: "Beşiktaş" },
  { label: "Karşıyaka & Göztepe", value: "İzmir Derbisi" },
  { label: "A Milli Takım", value: "Milli Takım" },
  { label: "EuroLeague", value: "EuroLeague" },
  { label: "Formula 1", value: "F1" },
  { label: "Yerli MMORPG", value: "MMORPG" },
  { label: "Valorant VCT", value: "Valorant" },
  { label: "CS2 Major", value: "CS2" },
  { label: "League of Legends (TCL)", value: "LoL" },
  { label: "Minecraft Sunucuları", value: "Minecraft" },
  
  // Savunma, Teknoloji & Otomotiv
  { label: "Kaan Savaş Uçağı", value: "Kaan" },
  { label: "Togg Yeni Model", value: "Togg" },
  { label: "Bayraktar TB3 / Kızılelma", value: "Bayraktar" },
  { label: "Türksat Uyduları", value: "Türksat" },
  { label: "Sosyal Medya Yasakları", value: "Yasak" },
  { label: "GPT-5 Çıkışı", value: "GPT-5" },
  { label: "Elektrikli Araçlar (EV)", value: "Elektrikli Araç" },
  
  // Eğitim & Sınavlar
  { label: "YKS 2026", value: "YKS" },
  { label: "KPSS Atamaları", value: "KPSS" },
  { label: "Okulların Açılışı", value: "Okul" },
  
  // 🎬 TV, Magazin & Pop Kültür
  { label: "Survivor 2026", value: "Survivor" },
  { label: "MasterChef", value: "MasterChef" },
  { label: "Gibi Yeni Sezon", value: "Gibi" },
  { label: "Yerli Diziler (Reyting)", value: "Reyting" },
  { label: "Exxen & BluTV", value: "Dijital Platform" },
  { label: "Türkçe Rap & Hip-Hop", value: "Türkçe Rap" },
  { label: "Global Hip-Hop", value: "Global Hip-Hop" },
  { label: "Konser & Festivaller", value: "Konser" },
  { label: "Oscar Ödülleri", value: "Oscar" },
  { label: "Gişe Rekorları", value: "Gişe" },
  { label: "Influencer Gündemi", value: "Influencer" },
  { label: "Sokak Modası (Streetwear)", value: "Streetwear" },
  
  // Kripto & Global
  { label: "Bitcoin Rekoru", value: "Bitcoin" },
  { label: "Altcoin Rallisi", value: "Altcoin" },
  { label: "ABD Siyaseti", value: "ABD" },
  { label: "FED Kararları", value: "FED" },
  { label: "Avrupa Birliği", value: "Avrupa" },
  { label: "İklim Krizleri", value: "İklim" }
];

export function Navbar() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, balance, isLoading } = useBalance(); 
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [tagSearchQuery, setTagSearchQuery] = useState("");
  const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false);
  
  // 1. AVATAR STATE YÖNETİMİ
  const [avatarUrl, setAvatarUrl] = useState("");

  const categoriesScrollRef = useRef<HTMLDivElement>(null);
  const tagsScrollRef = useRef<HTMLDivElement>(null);

  // User yüklendiğinde avatarı set et
  useEffect(() => {
    if (user?.user_metadata?.avatar_url) {
      setAvatarUrl(user.user_metadata.avatar_url);
    }
  }, [user]);

  // "avatar-update" sinyalini dinle ve resmi anında değiştir
  useEffect(() => {
    const handleAvatarUpdate = (e: CustomEvent) => {
      setAvatarUrl(e.detail);
    };
    
    window.addEventListener('avatar-update', handleAvatarUpdate as EventListener);
    return () => window.removeEventListener('avatar-update', handleAvatarUpdate as EventListener);
  }, []);

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback` }});
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category"); 
    if (searchQuery) params.set("q", searchQuery); else params.delete("q");
    router.push(`/?${params.toString()}`);
  };

  const handleTagSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsTagPopoverOpen(false);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    if (tagSearchQuery) params.set("q", tagSearchQuery); else params.delete("q");
    router.push(`/?${params.toString()}`);
    setTagSearchQuery("");
  };

  const updateParams = (updates: { key: string, value: string | null }[]) => {
    const params = new URLSearchParams(searchParams.toString());
    updates.forEach(({ key, value }) => { if (value) params.set(key, value); else params.delete(key); });
    router.push(`/?${params.toString()}`);
  };

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoriesScrollRef.current) {
      categoriesScrollRef.current.scrollBy({ left: direction === 'left' ? -200 : 200, behavior: 'smooth' });
    }
  };

  const scrollTags = (direction: 'left' | 'right') => {
    if (tagsScrollRef.current) {
      tagsScrollRef.current.scrollBy({ left: direction === 'left' ? -200 : 200, behavior: 'smooth' });
    }
  };

  return (
    <div className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-md border-b border-border/40 shadow-sm supports-[backdrop-filter]:bg-background/80">
      
      {/* --- KATMAN 1: TOP BAR --- */}
      <div className="flex h-16 items-center justify-between px-4 max-w-[1800px] mx-auto gap-4">
        <div className="flex items-center gap-4 md:gap-6 flex-1">
          <Link href="/" className="flex items-center space-x-1 sm:space-x-2 font-black text-[16px] sm:text-xl tracking-tighter shrink-0 hover:opacity-80 transition-opacity">
            <span className="text-xl sm:text-2xl">📉</span>
            <span>NOLYMARKET</span>
          </Link>
          
          <form onSubmit={handleSearch} className="hidden md:flex relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Piyasalarda ara..." className="w-full pl-10 h-10 bg-secondary/50 border-none focus-visible:ring-1 focus-visible:ring-primary rounded-xl" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </form>
          
          <div className="hidden md:block"><HowItWorks isFloating={false} /></div>
        </div>

        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {isLoading ? (
            <div className="flex items-center gap-2"><div className="h-9 w-24 bg-secondary animate-pulse rounded-full hidden sm:block" /><div className="h-9 w-9 bg-secondary animate-pulse rounded-full" /></div>
          ) : user ? (
            <div className="flex items-center gap-3">
              
              <NavbarBalance initialBalance={balance || 0} />
              <NotificationCenter userId={user.id} />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  {/* ÖNEMLİ DÜZELTME: 'p-0' eklendi. Button'un kendi padding'i resmi sıkıştırıyordu. */}
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full border border-border overflow-hidden p-0">
                    <Avatar className="h-full w-full">
                      <AvatarImage 
                        src={avatarUrl} 
                        className="object-cover h-full w-full aspect-square"
                      />
                      <AvatarFallback className="font-bold">{user.email?.[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl">
                  <DropdownMenuItem className="md:hidden flex items-center justify-center text-primary font-black bg-primary/5 mb-1 py-3 rounded-lg">
                    <Wallet className="mr-2 h-4 w-4" /> {Math.round(balance).toLocaleString()} TP
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild><Link href="/profile" className="cursor-pointer font-bold py-2"><UserIcon className="mr-2 h-4 w-4" /> Profilim</Link></DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { supabase.auth.signOut(); window.location.reload(); }} className="text-red-500 focus:text-red-600 focus:bg-red-50 py-2 font-bold cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" /> Çıkış Yap
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Button onClick={handleGoogleLogin} className="font-bold rounded-full px-5 shadow-lg shadow-primary/20">Giriş Yap</Button>
          )}

          <div className="flex items-center">
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground rounded-full h-9 w-9 ml-1">
                    <Menu className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 rounded-xl p-2">
                      <DropdownMenuLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-wider pl-2">Platform</DropdownMenuLabel>
                      <DropdownMenuItem asChild><Link href="/" className="cursor-pointer font-bold py-2"><TrendingUp size={16} className="mr-3 text-primary"/> Piyasalar</Link></DropdownMenuItem>
                      <DropdownMenuItem asChild><Link href="/leaderboard" className="cursor-pointer font-bold py-2"><Trophy size={16} className="mr-3 text-yellow-500"/> Liderlik Tablosu</Link></DropdownMenuItem>
                      <DropdownMenuItem asChild><Link href="/rewards" className="cursor-pointer font-bold py-2"><Gift size={16} className="mr-3 text-pink-500"/> Ödüller</Link></DropdownMenuItem>
                      <DropdownMenuItem asChild><Link href="/accuracy" className="cursor-pointer font-bold py-2"><ShieldCheck size={16} className="mr-3 text-green-500"/> Doğruluk Oranı</Link></DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-wider pl-2">Sistem & Bilgi</DropdownMenuLabel>
                      <DropdownMenuItem asChild><Link href="/help" className="cursor-pointer font-bold py-2"><HelpCircle size={16} className="mr-3 text-blue-500"/> Yardım Merkezi</Link></DropdownMenuItem>
                      <DropdownMenuItem asChild><Link href="/api-docs" className="cursor-pointer font-bold py-2"><Code size={16} className="mr-3 text-muted-foreground"/> API Dokümanı</Link></DropdownMenuItem>
                      <DropdownMenuItem asChild><Link href="/terms" className="cursor-pointer font-bold py-2"><FileCheck size={16} className="mr-3 text-muted-foreground"/> Kullanım Koşulları</Link></DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      <div className="p-2 flex items-center justify-between pl-3 pr-1">
                        <span className="text-sm font-bold text-muted-foreground">Tema Değiştir</span>
                        <ThemeToggle />
                      </div>
                </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="border-b border-border/40 bg-background/95 relative group">
        <button onClick={() => scrollCategories('left')} className="absolute left-0 z-10 p-2 bg-background/90 shadow-md md:hidden rounded-r-xl top-1/2 -translate-y-1/2"><ChevronLeft className="h-4 w-4" /></button>
        <div className="container mx-auto px-4 max-w-[1800px]">
          <div ref={categoriesScrollRef} className="flex items-center h-11 overflow-x-auto no-scrollbar gap-6 md:gap-8 text-sm font-medium select-none scroll-smooth">
            {MAIN_CATEGORIES.map((cat) => {
              const isActive = (cat.value === searchParams.get("category")) || (!searchParams.get("category") && cat.value === "popular" && !searchParams.get("q"));
              return (
                <button
                  key={cat.label}
                  onClick={() => updateParams([{ key: "category", value: cat.value === "popular" ? null : cat.value }, { key: "q", value: null }])}
                  className={cn("whitespace-nowrap flex items-center gap-1.5 transition-all h-full border-b-[2px] px-1", isActive ? "text-foreground font-bold border-foreground" : "text-muted-foreground hover:text-foreground border-transparent")}
                >
                  {cat.icon && <cat.icon size={14} className={cn(isActive ? "text-foreground" : "text-muted-foreground/70")} />}
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
        <button onClick={() => scrollCategories('right')} className="absolute right-0 z-10 p-2 bg-background/90 shadow-md md:hidden rounded-l-xl top-1/2 -translate-y-1/2"><ChevronRight className="h-4 w-4" /></button>
      </div>

      <div className="md:hidden py-2 px-4 border-b border-border/40 bg-secondary/10">
         <form onSubmit={handleSearch} className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Piyasalarda ara..." className="w-full pl-10 h-10 bg-background border-border/50 focus:border-primary/50 transition-all rounded-xl text-sm shadow-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </form>
      </div>

      <div className="bg-secondary/5 py-2">
        <div className="container mx-auto px-4 max-w-[1800px] flex items-center relative">
           
           <div ref={tagsScrollRef} className="flex items-center overflow-x-auto no-scrollbar gap-2 text-xs font-medium flex-1 scroll-smooth mask-gradient-right pr-12">
             
             <Popover open={isTagPopoverOpen} onOpenChange={setIsTagPopoverOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0 rounded-full shrink-0 border-border/50 bg-background text-muted-foreground hover:text-foreground">
                        <Search size={12} />
                    </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-[300px] p-0 shadow-2xl rounded-2xl border-border/50" sideOffset={8}>
                    <form onSubmit={handleTagSearch} className="p-3 border-b border-border/50 bg-secondary/20">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input autoFocus placeholder="Etiket veya soru ara..." className="pl-9 h-10 bg-background border-border/50 rounded-xl focus-visible:ring-1 focus-visible:ring-primary shadow-sm" value={tagSearchQuery} onChange={(e) => setTagSearchQuery(e.target.value)} />
                        </div>
                    </form>
                    <div className="p-4 max-h-[300px] overflow-y-auto no-scrollbar">
                        <h4 className="text-[10px] font-black text-muted-foreground uppercase mb-3 tracking-widest flex items-center gap-1"><TrendingUp size={10} /> Trend Etiketler</h4>
                        <div className="flex flex-wrap gap-2">
                            {SUB_TOPICS.filter(t => t.value !== null).map(t => (
                                <Button 
                                  key={t.label} variant="secondary" size="sm" className="h-7 text-[11px] px-3 font-bold rounded-lg bg-secondary/50 hover:bg-secondary border border-transparent hover:border-border/50 transition-all" 
                                  onClick={() => { setTagSearchQuery(t.value!); setIsTagPopoverOpen(false); updateParams([{ key: "q", value: t.value }, { key: "category", value: null }]); }}
                                >
                                    <Hash size={12} className="mr-1 opacity-50 text-primary"/> {t.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                </PopoverContent>
             </Popover>

             <button onClick={() => { if(!user) return handleGoogleLogin(); updateParams([{ key: "watchlist", value: searchParams.get("watchlist") ? null : "true" }]); }} className={cn("px-3 py-1.5 rounded-full transition-colors whitespace-nowrap flex items-center gap-1.5 border shrink-0 ml-1 font-bold", searchParams.get("watchlist") ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/30" : "bg-background border-border/50 text-muted-foreground hover:bg-secondary")}>
                <Bookmark size={12} className={cn(searchParams.get("watchlist") && "fill-current")} /> Kaydettiklerim
             </button>

             <div className="w-[1px] h-4 bg-border/50 mx-1 shrink-0" />

             {SUB_TOPICS.map((topic) => {
                 const isActive = searchParams.get("q") === topic.value;
                 return (
                    <button key={topic.label} onClick={() => updateParams([{ key: "q", value: topic.value }, { key: "category", value: null }])} className={cn("px-3.5 py-1.5 rounded-full transition-colors whitespace-nowrap border shrink-0 font-bold", isActive || (topic.value === null && !searchParams.get("q")) ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-background border-border/50 text-muted-foreground hover:bg-secondary")}>
                      {topic.label}
                    </button>
                 );
             })}
          </div>
          
          <div className="absolute right-0 top-0 bottom-0 flex items-center px-2 bg-gradient-to-l from-background via-background to-transparent w-20 justify-end z-10">
            <Button variant="ghost" size="icon" className="h-8 w-8 bg-background shadow-md rounded-full border border-border/50 text-foreground hover:text-primary" onClick={() => scrollTags('right')}><ChevronRight size={14} /></Button>
          </div>
        </div>
      </div>

    </div>
  );
}