import { createServerSideClient } from "@/lib/server-utils";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  PieChart, Wallet, Briefcase, TrendingUp, History, 
  ArrowRight, Activity, CheckCircle2, XCircle, Clock
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

export const dynamic = "force-dynamic";

export default async function PortfolioPage() {
  const supabase = await createServerSideClient();
  
  // 1. Kullanıcı Kontrolü
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/"); // Giriş yapmamışsa anasayfaya at
  }

  // 2. Profil (Bakiye) Verisini Çek
  const { data: profile } = await supabase
    .from("profiles")
    .select("tp_balance")
    .eq("id", user.id)
    .single();

  // 3. Kullanıcının Tüm Tahminlerini Çek
  const { data: predictionsData } = await supabase
    .from("predictions")
    .select("*, market:markets(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const predictions = predictionsData || [];

  // 4. İşlemleri Filtrele
  const activePredictions = predictions.filter(p => p.market?.status === "active");
  const pastPredictions = predictions.filter(p => p.market?.status !== "active");

  // 5. FİNANSAL MATEMATİK (CÜZDAN HESAPLAMALARI)
  const availableBalance = Number(profile?.tp_balance || 0);
  
  // İşlemdeki (Kilitli) Para: Sadece aktif piyasalardaki yatırımların toplamı
  const lockedBalance = activePredictions.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  
  // Toplam Varlık = Boştaki Para + İşlemdeki Para
  const totalPortfolioValue = availableBalance + lockedBalance;

  // Portfolyo Yüzdeleri (Görsel bar için)
  const availablePercentage = totalPortfolioValue > 0 ? (availableBalance / totalPortfolioValue) * 100 : 0;
  const lockedPercentage = totalPortfolioValue > 0 ? (lockedBalance / totalPortfolioValue) * 100 : 0;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-[1000px] animate-in fade-in duration-500">
      
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-primary/10 p-3 rounded-2xl">
          <PieChart className="text-primary h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Portfolyom</h1>
          <p className="text-muted-foreground font-medium">Varlıklarını ve açık pozisyonlarını yönet.</p>
        </div>
      </div>

      {/* DEVASA FİNANSAL ÖZET KARTI */}
      <div className="bg-card border-2 border-border/50 rounded-[2.5rem] p-6 md:p-10 mb-10 shadow-xl relative overflow-hidden">
        {/* Cam efekti yansıması */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4">
          
          {/* Toplam Varlık (Büyük Sol Kısım) */}
          <div className="md:col-span-1 flex flex-col justify-center border-b md:border-b-0 md:border-r border-border/50 pb-8 md:pb-0 md:pr-8">
            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
              <Activity size={14} /> Toplam Varlık Değeri
            </span>
            <div className="text-5xl font-black tracking-tighter text-foreground flex items-baseline gap-2">
              {Math.round(totalPortfolioValue).toLocaleString()} <span className="text-xl text-muted-foreground font-bold">TP</span>
            </div>
          </div>

          {/* Dağılım (Sağ Kısım) */}
          <div className="md:col-span-2 flex flex-col justify-center space-y-6">
            
            <div className="flex items-center justify-between md:justify-start md:gap-12">
              {/* Boştaki Bakiye */}
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <Wallet size={12} className="text-green-500" /> Kullanılabilir Bakiye
                </span>
                <div className="text-2xl font-black text-foreground">
                  {Math.round(availableBalance).toLocaleString()} <span className="text-xs text-muted-foreground">TP</span>
                </div>
              </div>

              {/* İşlemdeki (Kilitli) Bakiye */}
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <Briefcase size={12} className="text-orange-500" /> İşlemdeki (Kilitli) TP
                </span>
                <div className="text-2xl font-black text-foreground">
                  {Math.round(lockedBalance).toLocaleString()} <span className="text-xs text-muted-foreground">TP</span>
                </div>
              </div>
            </div>

            {/* Renkli Dağılım Barı (Görsel Zenginlik) */}
            <div className="space-y-2">
              <div className="h-3 w-full bg-secondary rounded-full overflow-hidden flex">
                <div className="bg-green-500 h-full transition-all duration-1000" style={{ width: `${availablePercentage}%` }} />
                <div className="bg-orange-500 h-full transition-all duration-1000" style={{ width: `${lockedPercentage}%` }} />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                <span>% {Math.round(availablePercentage)} Nakit</span>
                <span>% {Math.round(lockedPercentage)} Pozisyonda</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* SEKMELER: AÇIK POZİSYONLAR VE GEÇMİŞ */}
      <Tabs defaultValue="positions" className="w-full">
        <TabsList className="w-full md:w-auto h-auto bg-secondary/30 border border-border/50 p-1.5 mb-6 rounded-2xl flex flex-col sm:flex-row gap-1">
          <TabsTrigger value="positions" className="h-12 rounded-xl px-8 font-black text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary flex-1 sm:flex-none transition-all">
            <TrendingUp size={18} className="mr-2" /> 
            Açık Pozisyonlar <span className="ml-2 bg-primary/10 text-primary px-2.5 py-1 rounded-lg text-xs">{activePredictions.length}</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="h-12 rounded-xl px-8 font-black text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary flex-1 sm:flex-none transition-all">
            <History size={18} className="mr-2" /> 
            İşlem Geçmişi
          </TabsTrigger>
        </TabsList>

        {/* 1. SEKME: AÇIK POZİSYONLAR */}
        <TabsContent value="positions" className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          {activePredictions.length > 0 ? (
            <div className="space-y-4">
              {activePredictions.map((pred) => {
                const isBinary = pred.market?.market_type === 'binary';
                const isYes = pred.option_id === 'yes' || pred.option_id === 'YES';

                return (
                  <Link key={pred.id} href={`/market/${pred.market?.slug}`} className="block group">
                    <Card className="rounded-[2rem] border-2 border-border/50 hover:border-primary/50 transition-all hover:shadow-lg bg-card overflow-hidden">
                      <div className="flex flex-col md:flex-row md:items-center">
                        
                        {/* Sol Taraf: Piyasa Bilgisi */}
                        <div className="flex-1 p-5 md:p-6 border-b md:border-b-0 md:border-r border-border/50 bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest bg-background">
                              {pred.market?.category}
                            </Badge>
                            <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                              <Clock size={12}/> Bitiş: {new Date(pred.market?.end_date).toLocaleDateString('tr-TR')}
                            </span>
                          </div>
                          <CardTitle className="text-base md:text-lg font-bold leading-snug group-hover:text-primary transition-colors pr-4">
                            {pred.market?.question}
                          </CardTitle>
                        </div>

                        {/* Sağ Taraf: Kullanıcının Pozisyonu ve Parası */}
                        <div className="shrink-0 w-full md:w-64 p-5 md:p-6 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 bg-background">
                          
                          <div className="space-y-1.5 md:text-right">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Satın Alınan Hisse</span>
                            {isBinary ? (
                              <Badge variant="outline" className={`font-black border-2 px-3 py-1 text-sm ${isYes ? 'border-green-500 text-green-600 bg-green-500/10' : 'border-red-500 text-red-600 bg-red-500/10'}`}>
                                {isYes ? 'EVET' : 'HAYIR'}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="font-black border-2 border-primary text-primary bg-primary/10 px-3 py-1 text-sm">
                                {pred.option_id}
                              </Badge>
                            )}
                          </div>

                          <div className="space-y-1 text-right">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Yatırılan (Kilitli)</span>
                            <div className="font-black text-xl text-foreground">
                              {pred.amount} <span className="text-xs text-muted-foreground">TP</span>
                            </div>
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
              <p className="text-muted-foreground font-medium mb-6">Piyasalardaki fırsatları değerlendir ve tahminlerini yapmaya başla.</p>
              <Link href="/">
                <Button className="h-12 px-8 font-black rounded-xl shadow-lg shadow-primary/20">
                  Piyasalara Göz At <ArrowRight size={18} className="ml-2" />
                </Button>
              </Link>
            </div>
          )}
        </TabsContent>

        {/* 2. SEKME: GEÇMİŞ İŞLEMLER */}
        <TabsContent value="history" className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          {pastPredictions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pastPredictions.map((pred) => {
                const isWon = pred.status === "won" || pred.is_winner === true;
                const isLost = pred.status === "lost" || pred.is_winner === false;

                return (
                  <Card key={pred.id} className="rounded-3xl border border-border/50 overflow-hidden opacity-90 hover:opacity-100 transition-opacity">
                     <CardHeader className="pb-3 border-b border-border/30 bg-secondary/20">
                        <div className="flex justify-between items-start gap-4">
                          <CardTitle className="text-sm font-bold leading-snug text-foreground/80 line-clamp-2">
                            {pred.market?.question}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 bg-background">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sonuç</span>
                            {isWon ? (
                              <span className="flex items-center gap-1.5 text-xs font-black text-green-500 bg-green-500/10 px-2 py-1 rounded-md w-fit"><CheckCircle2 size={14}/> KAZANDI</span>
                            ) : isLost ? (
                              <span className="flex items-center gap-1.5 text-xs font-black text-red-500 bg-red-500/10 px-2 py-1 rounded-md w-fit"><XCircle size={14}/> KAYBETTİ</span>
                            ) : (
                              <span className="flex items-center gap-1.5 text-xs font-black text-muted-foreground bg-secondary px-2 py-1 rounded-md w-fit">İADE / SONUÇLANDI</span>
                            )}
                          </div>

                          <div className="space-y-1 text-right">
                             <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                              {formatDistanceToNow(new Date(pred.created_at), { addSuffix: true, locale: tr })}
                             </span>
                            <div className="font-black text-base text-foreground bg-secondary/50 px-3 py-1 rounded-lg">
                              {pred.amount} TP
                            </div>
                          </div>
                        </div>
                      </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-secondary/10 rounded-[2.5rem] border border-dashed border-border/50">
              <History className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground font-medium">Geçmiş işlem kaydı bulunamadı.</p>
            </div>
          )}
        </TabsContent>

      </Tabs>
    </div>
  );
}