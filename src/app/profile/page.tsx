import { createServerSideClient } from "@/lib/server-utils";
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, TrendingUp, History, Bookmark, Calendar, Target, BarChart3, Activity, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import { EditProfileDialog } from "@/components/profile/edit-profile-dialog";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createServerSideClient();
  
  // 1. Kullanıcı Kontrolü
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/");
  }

  // 2. Profil Verisini Çek
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // 3. Tahminleri Çek (GÜNCELLENDİ: market_options tablosundan isimi de alıyoruz)
  const { data: predictionsData } = await supabase
    .from("predictions")
    .select(`
      *,
      market:markets(*),
      market_option:market_options(name) 
    `) 
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // 4. Kaydedilenleri Çek
  const { data: bookmarksData } = await supabase
    .from("bookmarks")
    .select("*, market:markets(*)")
    .eq("user_id", user.id);

  const predictions = predictionsData || [];
  const bookmarks = bookmarksData || [];

  // 5. İşlemleri Filtrele
  const activePredictions = predictions.filter(p => p.market?.status === "active");
  const pastPredictions = predictions.filter(p => p.market?.status !== "active");

  // İstatistikler
  const totalVolume = predictions.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const wonPredictions = pastPredictions.filter(p => p.status === "won" || p.is_winner === true); 
  const accuracyRate = pastPredictions.length > 0 
    ? Math.round((wonPredictions.length / pastPredictions.length) * 100) 
    : 0;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-[1000px] animate-in fade-in duration-500">
      
      {/* ÜST PROFİL KARTI */}
      <div className="bg-card border-2 border-border/50 rounded-[2.5rem] p-6 md:p-10 mb-10 overflow-hidden shadow-xl relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12 z-10">
          <div className="flex flex-col items-center gap-4 shrink-0">
            <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-background shadow-2xl">
              <AvatarImage src={profile?.avatar_url || ""} className="object-cover" />
              <AvatarFallback className="text-4xl font-black bg-secondary/80 text-primary">
                {profile?.full_name?.[0]?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <EditProfileDialog currentName={profile?.full_name || ""} currentAvatar={profile?.avatar_url || ""} />
          </div>
          
          <div className="flex-1 w-full text-center md:text-left space-y-6 mt-2">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight flex items-center justify-center md:justify-start gap-3">
              {profile?.full_name || "Bilinmeyen Kullanıcı"}
              {accuracyRate >= 60 && <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white font-black uppercase tracking-widest text-[10px] hidden sm:flex">Top Tahminci</Badge>}
            </h1>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <div className="bg-secondary/40 border border-border/50 rounded-2xl p-4 flex flex-col items-center md:items-start">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                  <Wallet size={14} /> <span className="text-[11px] font-black uppercase tracking-widest">Bakiye</span>
                </div>
                <div className="text-xl md:text-2xl font-black text-foreground">
                  {Math.round(profile?.tp_balance || 0).toLocaleString()} <span className="text-xs text-muted-foreground">TP</span>
                </div>
              </div>
              <div className="bg-secondary/40 border border-border/50 rounded-2xl p-4 flex flex-col items-center md:items-start">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                  <BarChart3 size={14} /> <span className="text-[11px] font-black uppercase tracking-widest">Hacim</span>
                </div>
                <div className="text-xl md:text-2xl font-black text-foreground">
                  {totalVolume.toLocaleString()} <span className="text-xs text-muted-foreground">TP</span>
                </div>
              </div>
              <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex flex-col items-center md:items-start">
                <div className="flex items-center gap-1.5 text-primary mb-1">
                  <Target size={14} /> <span className="text-[11px] font-black uppercase tracking-widest">Doğruluk</span>
                </div>
                <div className="text-xl md:text-2xl font-black text-primary">%{accuracyRate}</div>
              </div>
              <div className="bg-secondary/40 border border-border/50 rounded-2xl p-4 flex flex-col items-center md:items-start">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                  <Activity size={14} /> <span className="text-[11px] font-black uppercase tracking-widest">İşlem</span>
                </div>
                <div className="text-xl md:text-2xl font-black text-foreground">{predictions.length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="w-full md:w-auto h-auto bg-secondary/30 border border-border/50 p-1.5 mb-8 rounded-2xl flex flex-col sm:flex-row gap-1">
          <TabsTrigger value="active" className="h-10 rounded-xl px-6 font-bold text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary flex-1 sm:flex-none">
            <TrendingUp size={16} className="mr-2" /> 
            Açık İşlemler <span className="ml-2 bg-secondary/50 text-muted-foreground px-2 py-0.5 rounded-full text-xs">{activePredictions.length}</span>
          </TabsTrigger>
          <TabsTrigger value="past" className="h-10 rounded-xl px-6 font-bold text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary flex-1 sm:flex-none">
            <History size={16} className="mr-2" /> 
            Geçmiş <span className="ml-2 bg-secondary/50 text-muted-foreground px-2 py-0.5 rounded-full text-xs">{pastPredictions.length}</span>
          </TabsTrigger>
          <TabsTrigger value="bookmarks" className="h-10 rounded-xl px-6 font-bold text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary flex-1 sm:flex-none">
            <Bookmark size={16} className="mr-2" /> 
            Favoriler <span className="ml-2 bg-secondary/50 text-muted-foreground px-2 py-0.5 rounded-full text-xs">{bookmarks.length}</span>
          </TabsTrigger>
        </TabsList>

        {/* 1. SEKME: AÇIK İŞLEMLER (YENİ TASARIM) */}
        <TabsContent value="active" className="space-y-4">
          {activePredictions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activePredictions.map((pred) => {
                const isBinary = pred.market?.market_type === 'binary';
                // Eğer binary değilse, market_option'dan gelen ismi kullan, yoksa ID'yi göster
                const optionLabel = isBinary 
                  ? (pred.option_id === 'yes' || pred.option_id === 'YES' ? 'EVET' : 'HAYIR') 
                  : (pred.market_option?.name || `Seçenek #${pred.option_id}`);
                
                const isYes = optionLabel === 'EVET';
                const isNo = optionLabel === 'HAYIR';

                return (
                  <Link key={pred.id} href={`/market/${pred.market?.slug}`} className="block group">
                    <Card className="rounded-[2rem] border border-border/50 hover:border-primary/50 transition-all hover:shadow-lg bg-card overflow-hidden h-full flex flex-col">
                      <div className="p-5 flex-1 space-y-3">
                        {/* Başlık */}
                        <h3 className="text-base font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2">
                          {pred.market?.question}
                        </h3>
                        
                        {/* Seçim ve Yatırım Satırı */}
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                          
                          {/* SEÇİLEN TARAF (İSİM) */}
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Tarafın</span>
                            {isBinary ? (
                              <Badge className={`px-3 py-1 text-xs font-black w-fit ${isYes ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}>
                                {optionLabel}
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="px-3 py-1 text-xs font-black bg-primary/10 text-primary hover:bg-primary/20 w-fit">
                                {optionLabel}
                              </Badge>
                            )}
                          </div>

                          {/* YATIRIM MİKTARI */}
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Yatırım</span>
                            <div className="font-black text-xl text-foreground">
                              {Math.round(pred.amount).toLocaleString()} <span className="text-xs text-muted-foreground">TP</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Alt Bilgi Çubuğu */}
                      <div className="bg-secondary/30 px-5 py-2 flex items-center justify-between text-[10px] font-bold text-muted-foreground">
                         <span className="flex items-center gap-1"><Clock size={12}/> {formatDistanceToNow(new Date(pred.created_at), { addSuffix: true, locale: tr })}</span>
                         <span className="flex items-center gap-1 group-hover:text-primary transition-colors">Detaya Git <ArrowRight size={12}/></span>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-secondary/10 rounded-[2rem] border border-dashed border-border/50">
              <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground font-medium">Henüz açık bir işleminiz bulunmuyor.</p>
              <Link href="/">
                <Button variant="link" className="text-primary font-bold">Piyasalara Göz At</Button>
              </Link>
            </div>
          )}
        </TabsContent>

        {/* 2. SEKME: GEÇMİŞ İŞLEMLER */}
        <TabsContent value="past" className="space-y-4">
          {pastPredictions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pastPredictions.map((pred) => {
                const isWon = pred.status === "won" || pred.is_winner === true;
                const isLost = pred.status === "lost" || pred.is_winner === false;

                return (
                  <Card key={pred.id} className="rounded-[2rem] border border-border/50 opacity-80 hover:opacity-100 transition-opacity bg-secondary/5">
                      <div className="p-5 space-y-3">
                         <div className="flex justify-between items-start gap-4">
                            <h3 className="text-sm font-bold leading-snug text-muted-foreground line-clamp-2">
                              {pred.market?.question}
                            </h3>
                            {isWon ? (
                              <Badge className="bg-green-500 hover:bg-green-600 font-bold shrink-0">KAZANDI</Badge>
                            ) : isLost ? (
                              <Badge variant="destructive" className="font-bold shrink-0">KAYBETTİ</Badge>
                            ) : (
                              <Badge variant="outline" className="font-bold shrink-0">SONUÇLANDI</Badge>
                            )}
                         </div>

                         <div className="flex items-center justify-between pt-2 border-t border-border/50">
                            <span className="text-xs font-medium text-muted-foreground">
                              {formatDistanceToNow(new Date(pred.created_at), { addSuffix: true, locale: tr })}
                            </span>
                            <span className="font-black text-foreground">{pred.amount} TP</span>
                         </div>
                      </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-secondary/10 rounded-[2rem] border border-dashed border-border/50">
              <History className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground font-medium">Geçmiş işlem kaydı bulunamadı.</p>
            </div>
          )}
        </TabsContent>

        {/* 3. SEKME: KAYDEDİLENLER */}
        <TabsContent value="bookmarks" className="space-y-4">
          {bookmarks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookmarks.map((bookmark) => (
                <Link key={bookmark.id} href={`/market/${bookmark.market?.slug}`} className="block group">
                  <Card className="rounded-[2rem] border border-border/50 hover:border-yellow-500/50 transition-all hover:shadow-lg bg-card/50 overflow-hidden">
                    <div className="p-5 space-y-2">
                      <h3 className="text-sm font-bold leading-snug group-hover:text-yellow-600 transition-colors">
                        {bookmark.market?.question}
                      </h3>
                      <div className="flex items-center gap-2 text-xs font-black text-muted-foreground uppercase tracking-widest pt-2">
                        <Calendar size={14} className="text-yellow-600" />
                        <span>Bitiş: {new Date(bookmark.market?.end_date).toLocaleDateString('tr-TR')}</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-secondary/10 rounded-[2rem] border border-dashed border-border/50">
              <Bookmark className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground font-medium">Henüz favoriye eklediğiniz bir piyasa yok.</p>
            </div>
          )}
        </TabsContent>

      </Tabs>
    </div>
  );
}