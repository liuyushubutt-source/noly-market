import { createServerSideClient } from "@/lib/server-utils";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PieChart, Wallet, Briefcase, TrendingUp, History, ArrowRight, Activity, CheckCircle2, XCircle, Clock, Plus, ArrowUpRight, Lock } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

export const dynamic = "force-dynamic";

export default async function PortfolioPage() {
  const supabase = await createServerSideClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/"); 

  const { data: profile } = await supabase.from("profiles").select("tp_balance").eq("id", user.id).single();

  const { data: predictionsData } = await supabase
    .from("predictions")
    .select(`*, market:markets(*), market_option:market_options(name)`)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const predictions = predictionsData || [];

  const activePredictions = predictions.filter(p => p.market?.status === "active" && p.is_winner === null);
  const pastPredictions = predictions.filter(p => p.market?.status !== "active" || p.is_winner !== null);

  const getAmount = (p: any) => Number(p.amount_tp || p.amount || 0);

  const availableBalance = Number(profile?.tp_balance) || 0;
  const lockedBalance = activePredictions.reduce((sum, p) => sum + getAmount(p), 0);
  const totalPortfolioValue = availableBalance + lockedBalance;
  
  // Zenginleştirme: Tahmini Getiri (Açık işlemler kazanırsa kabaca ne kadar alacak? 2x olarak varsayalım)
  const potentialReturn = lockedBalance * 2; 

  const availablePercentage = totalPortfolioValue > 0 ? (availableBalance / totalPortfolioValue) * 100 : 0;
  const lockedPercentage = totalPortfolioValue > 0 ? (lockedBalance / totalPortfolioValue) * 100 : 0;

  return (
    <div className="container mx-auto px-4 py-6 md:py-12 max-w-[1000px] animate-in fade-in duration-500">
      
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Cüzdan & Portfolyo</h1>
          <p className="text-sm text-muted-foreground font-medium mt-1">Varlıklarınızı ve yatırımlarınızı yönetin.</p>
        </div>
        <div className="hidden sm:flex gap-2">
            {/* Sahte ama zengin gösteren Hızlı İşlem Butonları */}
            <Button variant="outline" size="sm" className="font-bold rounded-xl h-10"><ArrowUpRight size={14} className="mr-2"/> Çekim</Button>
            <Button size="sm" className="font-bold rounded-xl h-10 shadow-lg shadow-primary/20"><Plus size={14} className="mr-2"/> TP Yükle</Button>
        </div>
      </div>

      {/* YENİ FİNANSAL ÖZET KARTI (Daha Derli Toplu, Borsa Tarzı) */}
      <div className="bg-gradient-to-br from-card to-card/50 border border-border/50 rounded-3xl p-6 md:p-8 mb-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row gap-8 justify-between">
          
          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><PieChart size={14} /> Toplam Varlık Değeri</span>
            <div className="text-4xl md:text-5xl font-black tracking-tighter text-foreground flex items-baseline gap-2">
              {Math.round(totalPortfolioValue).toLocaleString()} <span className="text-xl text-muted-foreground font-bold">TP</span>
            </div>
            {potentialReturn > 0 && (
                <div className="text-xs font-bold text-green-500 mt-2 flex items-center gap-1 bg-green-500/10 w-fit px-2 py-1 rounded-lg">
                    <TrendingUp size={12}/> Beklenen Getiri: +{Math.round(potentialReturn).toLocaleString()} TP
                </div>
            )}
          </div>

          <div className="flex gap-4 sm:gap-8 bg-background/50 p-4 rounded-2xl border border-border/50 backdrop-blur-sm self-start w-full md:w-auto">
             <div className="flex flex-col gap-1 pr-4 sm:pr-8 border-r border-border/50">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><Wallet size={12} className="text-green-500" /> Kullanılabilir</span>
                <div className="text-xl font-black text-foreground">{Math.round(availableBalance).toLocaleString()} <span className="text-[10px] text-muted-foreground">TP</span></div>
             </div>
             <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><Lock size={12} className="text-orange-500" /> İşlemde</span>
                <div className="text-xl font-black text-foreground">{Math.round(lockedBalance).toLocaleString()} <span className="text-[10px] text-muted-foreground">TP</span></div>
             </div>
          </div>
        </div>

        {/* Cüzdan Barı */}
        <div className="mt-8 space-y-2 relative z-10">
          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden flex">
            <div className="bg-green-500 h-full transition-all duration-1000" style={{ width: `${availablePercentage}%` }} />
            <div className="bg-orange-500 h-full transition-all duration-1000" style={{ width: `${lockedPercentage}%` }} />
          </div>
        </div>
      </div>

      <Tabs defaultValue="positions" className="w-full">
        <TabsList className="w-full h-auto bg-transparent border-b border-border/50 p-0 mb-6 rounded-none flex justify-start gap-6 overflow-x-auto no-scrollbar">
          <TabsTrigger value="positions" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3 font-bold text-sm bg-transparent data-[state=active]:shadow-none">
            Açık Pozisyonlar <Badge variant="secondary" className="ml-2 text-[10px] bg-primary/10 text-primary">{activePredictions.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3 font-bold text-sm bg-transparent data-[state=active]:shadow-none">
            İşlem Geçmişi
          </TabsTrigger>
        </TabsList>

        {/* 1. SEKME: AÇIK POZİSYONLAR (Kompakt ve Veri Odaklı Tasarım) */}
        <TabsContent value="positions" className="space-y-3">
          {activePredictions.length > 0 ? (
            <div className="flex flex-col gap-3">
              {activePredictions.map((pred) => {
                const isBinary = pred.market?.market_type === 'binary';
                const isYes = isBinary && (pred.side === 'YES' || pred.side === 'yes');
                const optionLabel = isBinary ? (isYes ? 'EVET' : 'HAYIR') : (pred.market_option?.name || `Seçenek`);
                const amount = getAmount(pred); 

                return (
                  <Link key={pred.id} href={`/market/${pred.market?.slug}`} className="block group">
                    <Card className="rounded-2xl border border-border/50 hover:border-primary/50 transition-all hover:shadow-md bg-card overflow-hidden px-4 py-4 sm:px-6 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest bg-secondary/50 border-none">{pred.market?.category}</Badge>
                          <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1"><Clock size={10}/> {new Date(pred.market?.end_date).toLocaleDateString('tr-TR')}</span>
                        </div>
                        <h3 className="text-sm font-bold leading-snug group-hover:text-primary transition-colors pr-2">{pred.market?.question}</h3>
                      </div>

                      {/* Sağ Taraf - Finansal Veriler */}
                      <div className="flex items-center gap-6 sm:gap-8 sm:pl-6 sm:border-l border-border/50">
                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Tahminin</span>
                            <Badge variant="secondary" className={`font-black ${isBinary ? (isYes ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10') : 'text-primary bg-primary/10'}`}>{optionLabel}</Badge>
                          </div>
                          <div className="flex flex-col gap-1 text-right">
                            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Yatırım</span>
                            <span className="font-black text-base text-foreground">{Math.round(amount).toLocaleString()} TP</span>
                          </div>
                      </div>

                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
             <div className="text-center py-20 bg-secondary/10 rounded-3xl border border-dashed border-border/50">
               <Briefcase className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
               <h3 className="text-lg font-black mb-2">Açık Pozisyonun Yok</h3>
               <p className="text-xs text-muted-foreground font-medium mb-4">Hemen piyasalara göz at ve yatırım yap.</p>
               <Link href="/"><Button size="sm" className="font-bold rounded-xl shadow-lg shadow-primary/20">Piyasaları Keşfet</Button></Link>
             </div>
          )}
        </TabsContent>

        {/* 2. SEKME: GEÇMİŞ İŞLEMLER */}
        <TabsContent value="history" className="space-y-3">
          {pastPredictions.length > 0 ? (
            <div className="flex flex-col gap-3">
              {pastPredictions.map((pred) => {
                const amount = getAmount(pred);
                const isWon = pred.is_winner === true;
                const isLost = pred.is_winner === false;
                
                const isBinary = pred.market?.market_type === 'binary';
                const isYes = isBinary && (pred.side === 'YES' || pred.side === 'yes');
                const optionLabel = isBinary ? (isYes ? 'EVET' : 'HAYIR') : (pred.market_option?.name || `Seçenek`);

                return (
                  <Card key={pred.id} className="rounded-2xl border border-border/50 opacity-90 hover:opacity-100 transition-opacity bg-secondary/5 px-4 py-4 sm:px-6 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                           {isWon ? <Badge className="bg-green-500 hover:bg-green-600 text-[9px] font-black uppercase"><CheckCircle2 size={10} className="mr-1"/> KAZANDI</Badge> 
                            : isLost ? <Badge variant="destructive" className="text-[9px] font-black uppercase"><XCircle size={10} className="mr-1"/> KAYBETTİ</Badge> 
                            : <Badge variant="outline" className="text-[9px] font-black uppercase bg-background">SONUÇLANDI</Badge>}
                           <span className="text-[10px] font-medium text-muted-foreground">{formatDistanceToNow(new Date(pred.created_at), { addSuffix: true, locale: tr })}</span>
                        </div>
                        <h3 className="text-sm font-bold leading-snug text-muted-foreground">{pred.market?.question}</h3>
                      </div>
                      
                      {/* Sağ Taraf - Sonuç Verileri */}
                      <div className="flex items-center gap-6 sm:gap-8 sm:pl-6 sm:border-l border-border/50">
                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Tahminin</span>
                            <span className={`text-xs font-black ${isBinary ? (isYes ? 'text-green-500' : 'text-red-500') : 'text-foreground'}`}>{optionLabel}</span>
                          </div>
                          <div className="flex flex-col gap-1 text-right">
                            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Sonuç</span>
                            <span className={`font-black text-sm px-2 py-0.5 rounded-lg border shadow-sm ${
                                isWon ? 'text-green-500 bg-green-500/10 border-green-500/20' : 
                                isLost ? 'text-red-500 bg-red-500/10 border-red-500/20' : 
                                'text-foreground bg-background border-border/50'
                                }`}>
                                {isWon ? "+" : isLost ? "-" : ""}{Math.round(amount).toLocaleString()} TP
                            </span>
                          </div>
                      </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-secondary/10 rounded-3xl border border-dashed border-border/50">
              <History className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-sm text-muted-foreground font-medium">Geçmiş işlem kaydı bulunamadı.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}