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
  Gamepad2, Car, Home, MapPin, GraduationCap, Flame, PlaneTakeoff, ShieldAlert,
  ArrowRight, PieChart
} from "lucide-react";

import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, 
  DropdownMenuSeparator, DropdownMenuLabel 
} from "@/components/ui/dropdown-menu";
import {
  Popover, PopoverContent, PopoverTrigger
} from "@/components/ui/popover";

const MAIN_CATEGORIES = [
  { label: "Popüler", value: "popular", icon: Flame },
  { label: "Yeni", value: "new", icon: Zap },
  { label: "Türkiye Gündemi", value: "Türkiye", icon: MapPin },
  { label: "Siyaset & Seçim", value: "Siyaset", icon: Landmark },
  { label: "Ekonomi & Finans", value: "Ekonomi", icon: Briefcase },
  { label: "Spor", value: "Spor", icon: Trophy },
  { label: "Savunma Sanayii", value: "Savunma", icon: ShieldAlert },
  { label: "Kripto Varlıklar", value: "Kripto", icon: Coins },
  { label: "Teknoloji & Yapay Zeka", value: "Teknoloji", icon: Cpu },
  { label: "Otomotiv & Ulaşım", value: "Otomotiv", icon: Car },
  { label: "Emlak & Konut", value: "Emlak", icon: Home },
  { label: "Eğitim & Sınavlar", value: "Eğitim", icon: GraduationCap },
  { label: "Turizm & Seyahat", value: "Turizm", icon: PlaneTakeoff },
  { label: "Magazin & TV", value: "Magazin", icon: Film },
  { label: "Bilim & Uzay", value: "Bilim", icon: Rocket },
  { label: "Dünya Gündemi", value: "Dünya", icon: Globe },
];

const SUB_TOPICS = [
  { label: "Tümü", value: null },
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
  { label: "Sokak Hayvanları", value: "Sokak Hayvanları" },
  { label: "İstanbul Depremi", value: "İstanbul Deprem" },
  { label: "İstanbul Trafiği", value: "İstanbul Trafik" },
  { label: "İzmir Körfezi", value: "İzmir Körfez" },
  { label: "Süper Lig", value: "Super Lig" },
  { label: "Galatasaray", value: "Galatasaray" },
  { label: "Fenerbahçe", value: "Fenerbahçe" },
  { label: "A Milli Takım", value: "Milli Takım" },
  { label: "Kaan Savaş Uçağı", value: "Kaan" },
  { label: "Togg Yeni Model", value: "Togg" },
  { label: "YKS 2026", value: "YKS" },
  { label: "Survivor 2026", value: "Survivor" },
  { label: "Bitcoin Rekoru", value: "Bitcoin" },
];

export function Navbar() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, balance, isLoading } = useBalance(); 
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [tagSearchQuery, setTagSearchQuery] = useState("");
  const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");

  const categoriesScrollRef = useRef<HTMLDivElement>(null);
  const tagsScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.user_metadata?.avatar_url) {
      setAvatarUrl(user.user_metadata.avatar_url);
    }
  }, [user]);

  useEffect(() => {
    const handleAvatarUpdate = (e: CustomEvent) => { setAvatarUrl(e.detail); };
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
      categoriesScrollRef.current.scrollBy({ left: direction === 'left' ? -250 : 250, behavior: 'smooth' });
    }
  };

  const scrollTags = (direction: 'left' | 'right') => {
    if (tagsScrollRef.current) {
      tagsScrollRef.current.scrollBy({ left: direction === 'left' ? -250 : 250, behavior: 'smooth' });
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
            <Input type="search" placeholder="Piyasalarda ara..." className="w-full pl-10 h-10 bg-secondary/50 border-none focus-visible:ring-1 focus-visible:ring-primary rounded-xl text-[16px]" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
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
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full border-2 border-border/50 overflow-hidden p-0 hover:border-primary/50 transition-colors hidden md:flex">
                    <Avatar className="h-full w-full">
                      <AvatarImage src={avatarUrl} className="object-cover h-full w-full aspect-square" />
                      <AvatarFallback className="font-bold bg-primary text-primary-foreground">
                        {user.email?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent align="end" className="w-64 mt-2 rounded-[1.5rem] border-border/50 shadow-2xl p-2 bg-background/95 backdrop-blur-xl hidden md:block">
                  <div className="flex items-center gap-3 p-3 mb-2 bg-secondary/30 rounded-xl border border-border/50">
                     <Avatar className="h-10 w-10 border-2 border-background shadow-sm shrink-0">
                       <AvatarImage src={avatarUrl} className="object-cover h-full w-full aspect-square" />
                       <AvatarFallback className="font-bold bg-primary text-primary-foreground">{user.email?.[0]?.toUpperCase()}</AvatarFallback>
                     </Avatar>
                     <div className="flex flex-col overflow-hidden">
                       <span className="font-black text-sm truncate">{user.user_metadata?.full_name || "Kullanıcı"}</span>
                       <span className="text-[10px] font-medium text-muted-foreground truncate">{user.email}</span>
                     </div>
                  </div>
                  
                  <DropdownMenuLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-2 mb-1">Hesap İşlemleri</DropdownMenuLabel>
                  
                  <DropdownMenuItem asChild className="p-0 mb-1">
                    <Link href="/profile" className="flex items-center w-full cursor-pointer font-bold px-3 py-2.5 rounded-xl hover:bg-secondary transition-colors text-foreground/80 hover:text-foreground">
                      <UserIcon className="mr-3 h-4 w-4 text-primary/70" /> Profilim
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild className="p-0 mb-1">
                    <Link href="/portfolio" className="flex items-center w-full cursor-pointer font-bold px-3 py-2.5 rounded-xl hover:bg-secondary transition-colors text-foreground/80 hover:text-foreground">
                      <PieChart className="mr-3 h-4 w-4 text-blue-500/70" /> Portfolyom
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator className="my-2 border-border/50" />
                  
                  <DropdownMenuItem 
                    onClick={() => { supabase.auth.signOut(); window.location.reload(); }} 
                    className="flex items-center w-full cursor-pointer font-bold px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-500/10 hover:text-red-600 transition-colors focus:bg-red-500/10 focus:text-red-600"
                  >
                    <LogOut className="mr-3 h-4 w-4" /> Çıkış Yap
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 md:gap-2 hidden md:flex">
              <Button onClick={handleGoogleLogin} variant="ghost" className="font-bold text-sm rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground px-4 h-10">Giriş</Button>
              <Button onClick={handleGoogleLogin} className="font-black text-sm rounded-full px-5 h-10 shadow-lg shadow-primary/20 bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all">
                ÜYE OL <ArrowRight size={14} className="ml-1.5" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* --- KATMAN 2: ANA KATEGORİLER --- */}
      <div className="border-b border-border/40 bg-background/95 relative group">
        <div className="absolute left-0 top-0 bottom-0 items-center px-2 bg-gradient-to-r from-background via-background to-transparent w-20 justify-start z-10 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex">
          <Button variant="ghost" size="icon" className="h-8 w-8 bg-background shadow-md rounded-full border border-border/50 text-foreground hover:text-primary" onClick={() => scrollCategories('left')}><ChevronLeft size={14} /></Button>
        </div>

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
        
        <div className="absolute right-0 top-0 bottom-0 items-center px-2 bg-gradient-to-l from-background via-background to-transparent w-20 justify-end z-10 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex">
          <Button variant="ghost" size="icon" className="h-8 w-8 bg-background shadow-md rounded-full border border-border/50 text-foreground hover:text-primary" onClick={() => scrollCategories('right')}><ChevronRight size={14} /></Button>
        </div>
      </div>

      {/* MOBİL ANA ARAMA (INPUT ZOOM ENGELLENDİ) */}
      <div className="md:hidden py-2 px-4 border-b border-border/40 bg-secondary/10">
         <form onSubmit={handleSearch} className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input type="search" placeholder="Piyasalarda ara..." className="w-full pl-10 h-12 bg-background border-border/50 focus:border-primary/50 transition-all rounded-xl text-[16px] shadow-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </form>
      </div>

      {/* --- KATMAN 4: ALT ETİKETLER (MOBİLDE GÖRÜNÜR, ARAMA GİZLİ) --- */}
      <div className="bg-secondary/5 border-b border-border/40">
        <div className="container mx-auto px-4 max-w-[1800px] flex items-center justify-between gap-2 py-2">
           
           <div className="flex items-center gap-2 flex-1 overflow-hidden pr-2">
             <button onClick={() => { if(!user) return handleGoogleLogin(); updateParams([{ key: "watchlist", value: searchParams.get("watchlist") ? null : "true" }]); }} className={cn("h-8 px-3 rounded-full transition-colors whitespace-nowrap flex items-center gap-1.5 border text-xs font-bold shrink-0", searchParams.get("watchlist") ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/30" : "bg-background border-border/50 text-muted-foreground hover:bg-secondary")}>
                <Bookmark size={14} className={cn(searchParams.get("watchlist") && "fill-current")} /> <span className="hidden sm:inline-block">Kaydettiklerim</span>
             </button>
             
             <div className="w-[1px] h-5 bg-border/50 mx-1 shrink-0" />

             <div className="relative flex-1 overflow-hidden flex items-center group">
               <div className="absolute left-0 top-0 bottom-0 items-center pr-2 bg-gradient-to-r from-background via-background/90 to-transparent w-12 justify-start z-10 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex">
                  <Button variant="ghost" size="icon" className="h-7 w-7 bg-background shadow-sm rounded-full border border-border/50 text-foreground hover:text-primary" onClick={() => scrollTags('left')}><ChevronLeft size={14} /></Button>
               </div>

               <div ref={tagsScrollRef} className="flex items-center overflow-x-auto no-scrollbar gap-2 text-xs font-medium w-full scroll-smooth px-1 mask-gradient-x">
                 {SUB_TOPICS.map((topic) => {
                     const isActive = searchParams.get("q") === topic.value;
                     return (
                        <button key={topic.label} onClick={() => updateParams([{ key: "q", value: topic.value }, { key: "category", value: null }])} className={cn("px-3.5 py-1.5 rounded-full transition-colors whitespace-nowrap border shrink-0 font-bold", isActive || (topic.value === null && !searchParams.get("q")) ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-background border-border/50 text-muted-foreground hover:bg-secondary")}>
                          {topic.label}
                        </button>
                     );
                 })}
               </div>

               <div className="absolute right-0 top-0 bottom-0 items-center pl-2 bg-gradient-to-l from-background via-background/90 to-transparent w-12 justify-end z-10 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex">
                  <Button variant="ghost" size="icon" className="h-7 w-7 bg-background shadow-sm rounded-full border border-border/50 text-foreground hover:text-primary" onClick={() => scrollTags('right')}><ChevronRight size={14} /></Button>
               </div>
             </div>
           </div>

           {/* SAĞ KISIM: Trendler Butonu (SADECE MASAÜSTÜ) */}
           <div className="shrink-0 border-l border-border/50 pl-2 hidden md:block">
             <Popover open={isTagPopoverOpen} onOpenChange={setIsTagPopoverOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 px-3 rounded-full border-border/50 bg-background text-muted-foreground hover:text-foreground font-bold text-xs gap-2">
                        <Search size={14} /> <span>Trendler</span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-[300px] p-0 shadow-2xl rounded-2xl border-border/50" sideOffset={8}>
                    <form onSubmit={handleTagSearch} className="p-3 border-b border-border/50 bg-secondary/20">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input autoFocus placeholder="Etiket veya soru ara..." className="pl-9 h-10 bg-background border-border/50 rounded-xl focus-visible:ring-1 focus-visible:ring-primary shadow-sm text-[16px]" value={tagSearchQuery} onChange={(e) => setTagSearchQuery(e.target.value)} />
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
           </div>

        </div>
      </div>

    </div>
  );
}