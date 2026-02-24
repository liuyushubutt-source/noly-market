import { createServerSideClient } from "@/lib/server-utils";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PieChart, Wallet, Briefcase, TrendingUp, History, ArrowRight, Activity, CheckCircle2, XCircle, Clock } from "lucide-react";
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

  const availablePercentage = totalPortfolioValue > 0 ? (availableBalance / totalPortfolioValue) * 100 : 0;
  const lockedPercentage = totalPortfolioValue > 0 ? (lockedBalance / totalPortfolioValue) * 100 : 0;

  return (
    <div className="container mx-auto px-4 py-6 md:py-12 max-w-[1000px] animate-in fade-in duration-500">
      
      <div className="flex items-center gap-3 mb-6 md:mb-8">
        <div className="bg-primary/10 p-3 rounded-2xl hidden md:block"><PieChart className="text-primary h-8 w-8" /></div>
        <div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight">Portfolyom</h1>
          <p className="text-xs md:text-sm text-muted-foreground font-medium mt-1">Varlıklarını ve açık pozisyonlarını yönet.</p>
        </div>
      </div>

      <div className="bg-card border border-border/50 rounded-3xl md:rounded-[2.5rem] p-5 md:p-10 mb-8 shadow-sm md:shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row gap-6 md:gap-8">
          <div className="flex flex-col justify-center border-b md:border-b-0 md:border-r border-border/50 pb-6 md:pb-0 md:pr-8 w-full md:w-auto shrink-0">
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-muted-foreground mb-1 md:mb-2 flex items-center gap-1.5"><Activity size={14} /> Toplam Varlık Değeri</span>
            <div className="text-4xl md:text-5xl font-black tracking-tighter text-foreground flex items-baseline gap-2">
              {Math.round(totalPortfolioValue).toLocaleString()} <span className="text-lg md:text-xl text-muted-foreground font-bold">TP</span>
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-center space-y-5 w-full">
            <div className="flex flex-row items-center justify-between md:justify-start gap-4 md:gap-12">
              <div className="space-y-1">
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><Wallet size={12} className="text-green-500" /> Kullanılabilir</span>
                <div className="text-xl md:text-2xl font-black text-foreground">{Math.round(availableBalance).toLocaleString()} <span className="text-[10px] text-muted-foreground">TP</span></div>
              </div>
              <div className="space-y-1 text-right md:text-left">
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center justify-end md:justify-start gap-1.5"><Briefcase size={12} className="text-orange-500" /> İşlemde (Kilitli)</span>
                <div className="text-xl md:text-2xl font-black text-foreground">{Math.round(lockedBalance).toLocaleString()} <span className="text-[10px] text-muted-foreground">TP</span></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-2.5 md:h-3 w-full bg-secondary rounded-full overflow-hidden flex">
                <div className="bg-green-500 h-full transition-all duration-1000" style={{ width: `${availablePercentage}%` }} />
                <div className="bg-orange-500 h-full transition-all duration-1000" style={{ width: `${lockedPercentage}%` }} />
              </div>
              <div className="flex justify-between text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                <span>% {Math.round(availablePercentage)} Kullanılabilir</span>
                <span>% {Math.round(lockedPercentage)} İşlemde</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="positions" className="w-full">
        <TabsList className="w-full h-auto bg-secondary/30 border border-border/50 p-1.5 mb-6 rounded-xl md:rounded-2xl flex">
          <TabsTrigger value="positions" className="flex-1 h-10 md:h-12 rounded-lg md:rounded-xl font-black text-xs md:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all">
            Açık Pozisyonlar <span className="ml-1.5 bg-primary/10 text-primary px-2 py-0.5 rounded-md text-[10px]">{activePredictions.length}</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex-1 h-10 md:h-12 rounded-lg md:rounded-xl font-black text-xs md:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all">
            İşlem Geçmişi
          </TabsTrigger>
        </TabsList>

        <TabsContent value="positions" className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          {activePredictions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activePredictions.map((pred) => {
                const isBinary = pred.market?.market_type === 'binary';
                const isYes = isBinary && (pred.side === 'YES' || pred.side === 'yes');
                const optionLabel = isBinary ? (isYes ? 'EVET' : 'HAYIR') : (pred.market_option?.name || `Seçenek`);
                const amount = getAmount(pred); 

                return (
                  <Link key={pred.id} href={`/market/${pred.market?.slug}`} className="block group">
                    <Card className="rounded-3xl border border-border/50 hover:border-primary/50 transition-all hover:shadow-md bg-card overflow-hidden h-full flex flex-col">
                      <div className="p-4 md:p-5 flex-1 space-y-3">
                        <div>
                          <div className="flex items-center gap-2 mb-2"><Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest bg-secondary/50 border-none">{pred.market?.category}</Badge></div>
                          <h3 className="text-sm md:text-base font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2 pr-2">{pred.market?.question}</h3>
                        </div>
                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50 bg-background">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Öngörün</span>
                            {isBinary ? <span className={`text-xs font-black ${isYes ? 'text-green-500' : 'text-red-500'}`}>{optionLabel}</span> : <span className="text-xs font-black text-primary line-clamp-1 max-w-[120px]">{optionLabel}</span>}
                          </div>
                          <div className="flex flex-col items-end gap-0.5">
                            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Yatırım</span>
                            <div className="font-black text-sm md:text-base text-foreground bg-secondary/30 px-2 py-0.5 rounded-lg">{Math.round(amount).toLocaleString()} TP</div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
             <div className="text-center py-24 bg-secondary/10 rounded-[2.5rem] border-2 border-dashed border-border/50">
               <Briefcase className="mx-auto h-16 w-16 text-muted-foreground/30 mb-4" />
               <h3 className="text-xl font-black mb-2">Açık Pozisyonun Yok</h3>
               <Link href="/"><Button className="h-12 px-8 font-black rounded-xl shadow-lg shadow-primary/20 mt-4">Piyasalara Göz At</Button></Link>
             </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          {pastPredictions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pastPredictions.map((pred) => {
                const amount = getAmount(pred);
                const isWon = pred.is_winner === true;
                const isLost = pred.is_winner === false;
                
                // KULLANICININ SEÇİMİNİ BULUYORUZ (YENİ EKLENDİ)
                const isBinary = pred.market?.market_type === 'binary';
                const isYes = isBinary && (pred.side === 'YES' || pred.side === 'yes');
                const optionLabel = isBinary ? (isYes ? 'EVET' : 'HAYIR') : (pred.market_option?.name || `Seçenek`);

                return (
                  <Card key={pred.id} className="rounded-3xl border border-border/50 opacity-90 hover:opacity-100 transition-opacity bg-secondary/5">
                      <div className="p-4 md:p-5 flex flex-col h-full">
                         <div className="flex justify-between items-start gap-3 mb-3">
                            <h3 className="text-xs md:text-sm font-bold leading-snug text-muted-foreground line-clamp-2">{pred.market?.question}</h3>
                            {isWon ? (
                              <Badge className="bg-green-500 hover:bg-green-600 text-[9px] font-black shrink-0 px-2 py-0.5 flex items-center gap-1"><CheckCircle2 size={12}/> KAZANDI</Badge>
                            ) : isLost ? (
                              <Badge variant="destructive" className="text-[9px] font-black shrink-0 px-2 py-0.5 flex items-center gap-1"><XCircle size={12}/> KAYBETTİ</Badge>
                            ) : (
                              <Badge variant="outline" className="text-[9px] font-black shrink-0 px-2 py-0.5 bg-background">SONUÇLANDI</Badge>
                            )}
                         </div>

                         {/* SEÇİLEN TAHMİN KISMI (YENİ EKLENDİ) */}
                         <div className="bg-background rounded-xl p-2.5 mb-3 border border-border/50 flex items-center justify-between">
                            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">Senin Tahminin</span>
                            <span className={`text-xs font-black ${isBinary ? (isYes ? 'text-green-500' : 'text-red-500') : 'text-primary'}`}>{optionLabel}</span>
                         </div>
                         
                         <div className="flex items-center justify-between pt-2 border-t border-border/50 mt-auto">
                            <span className="text-[10px] font-medium text-muted-foreground">{formatDistanceToNow(new Date(pred.created_at), { addSuffix: true, locale: tr })}</span>
                            <span className={`font-black text-sm px-2 py-1 rounded-lg border shadow-sm transition-colors ${
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
            <div className="text-center py-20 bg-secondary/10 rounded-[2.5rem] border border-dashed border-border/50">
              <History className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-sm text-muted-foreground font-medium">Geçmiş işlem kaydı bulunamadı.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}