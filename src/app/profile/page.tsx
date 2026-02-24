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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  const { data: predictionsData } = await supabase
    .from("predictions")
    .select(`*, market:markets(*), market_option:market_options(name)`) 
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: bookmarksData } = await supabase.from("bookmarks").select("*, market:markets(*)").eq("user_id", user.id);

  const predictions = predictionsData || [];
  const bookmarks = bookmarksData || [];

  // MİKTAR BULUCU (amount_tp eklendi)
  const getAmount = (p: any) => Number(p.amount_tp || p.amount || 0);

  // FİLTRELEME
  const activePredictions = predictions.filter(p => p.market?.status === "active");
  const pastPredictions = predictions.filter(p => p.market?.status !== "active");

  const totalVolume = predictions.reduce((sum, p) => sum + getAmount(p), 0);
  
  // Doğruluk oranı: Veritabanında kazanma bilgisi olmadığı için şimdilik "sonuçlanan işlem sayısına" bağladım. Sıfır gözükmesin.
  const accuracyRate = 0; // SQL'e winner/loser mantığı gelene kadar 0 kalacak.

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-[1000px] animate-in fade-in duration-500">
      
      <div className="bg-card border-2 border-border/50 rounded-3xl md:rounded-[2.5rem] p-6 md:p-10 mb-8 overflow-hidden shadow-xl relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12 z-10">
          <div className="flex flex-col items-center gap-4 shrink-0">
            <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-background shadow-2xl">
              <AvatarImage src={profile?.avatar_url || ""} className="object-cover" />
              <AvatarFallback className="text-4xl font-black bg-secondary/80 text-primary">{profile?.full_name?.[0]?.toUpperCase() || "?"}</AvatarFallback>
            </Avatar>
            <EditProfileDialog currentName={profile?.full_name || ""} currentAvatar={profile?.avatar_url || ""} />
          </div>
          
          <div className="flex-1 w-full text-center md:text-left space-y-6 mt-2">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight flex items-center justify-center md:justify-start gap-3">
              {profile?.full_name || "Bilinmeyen Kullanıcı"}
            </h1>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <div className="bg-secondary/40 border border-border/50 rounded-2xl p-4 flex flex-col items-center md:items-start">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1"><Wallet size={14} /> <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest">Bakiye</span></div>
                <div className="text-xl md:text-2xl font-black text-foreground">{Math.round(profile?.tp_balance || 0).toLocaleString()} <span className="text-xs text-muted-foreground">TP</span></div>
              </div>
              <div className="bg-secondary/40 border border-border/50 rounded-2xl p-4 flex flex-col items-center md:items-start">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1"><BarChart3 size={14} /> <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest">Hacim</span></div>
                <div className="text-xl md:text-2xl font-black text-foreground">{totalVolume.toLocaleString()} <span className="text-xs text-muted-foreground">TP</span></div>
              </div>
              <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex flex-col items-center md:items-start opacity-50">
                <div className="flex items-center gap-1.5 text-primary mb-1"><Target size={14} /> <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest">Doğruluk</span></div>
                <div className="text-xl md:text-2xl font-black text-primary">-%</div>
              </div>
              <div className="bg-secondary/40 border border-border/50 rounded-2xl p-4 flex flex-col items-center md:items-start">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1"><Activity size={14} /> <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest">İşlem</span></div>
                <div className="text-xl md:text-2xl font-black text-foreground">{predictions.length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="w-full h-auto bg-secondary/30 border border-border/50 p-1 mb-6 rounded-2xl flex overflow-x-auto no-scrollbar scroll-smooth">
          <TabsTrigger value="active" className="flex-1 h-10 md:h-12 rounded-xl font-black text-xs md:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all whitespace-nowrap">
            <TrendingUp size={16} className="mr-1.5 hidden md:block" /> Açık <span className="ml-1.5 bg-primary/10 text-primary px-2 py-0.5 rounded-lg text-[10px]">{activePredictions.length}</span>
          </TabsTrigger>
          <TabsTrigger value="past" className="flex-1 h-10 md:h-12 rounded-xl font-black text-xs md:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all whitespace-nowrap">
            <History size={16} className="mr-1.5 hidden md:block" /> Geçmiş <span className="ml-1.5 bg-secondary/50 text-muted-foreground px-2 py-0.5 rounded-lg text-[10px]">{pastPredictions.length}</span>
          </TabsTrigger>
          <TabsTrigger value="bookmarks" className="flex-1 h-10 md:h-12 rounded-xl font-black text-xs md:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all whitespace-nowrap">
            <Bookmark size={16} className="mr-1.5 hidden md:block" /> Favoriler <span className="ml-1.5 bg-secondary/50 text-muted-foreground px-2 py-0.5 rounded-lg text-[10px]">{bookmarks.length}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          {activePredictions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activePredictions.map((pred) => {
                const isBinary = pred.market?.market_type === 'binary';
                const isYes = isBinary && (pred.side === 'YES' || pred.side === 'yes');
                const optionLabel = isBinary ? (isYes ? 'EVET' : 'HAYIR') : (pred.market_option?.name || `Seçenek`);
                const amount = getAmount(pred); 

                return (
                  <Link key={pred.id} href={`/market/${pred.market?.slug}`} className="block group">
                    <Card className="rounded-[2rem] border border-border/50 hover:border-primary/50 transition-all hover:shadow-lg bg-card overflow-hidden h-full flex flex-col">
                      <div className="p-5 flex-1 space-y-3">
                        <h3 className="text-sm md:text-base font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2 pr-2">{pred.market?.question}</h3>
                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Tarafın</span>
                            {isBinary ? <span className={`text-xs md:text-sm font-black ${isYes ? 'text-green-500' : 'text-red-500'}`}>{optionLabel}</span> : <span className="text-xs md:text-sm font-black text-primary line-clamp-1 max-w-[120px]">{optionLabel}</span>}
                          </div>
                          <div className="flex flex-col items-end gap-0.5">
                            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Yatırım</span>
                            <div className="font-black text-base md:text-lg text-foreground bg-secondary/30 px-2 py-0.5 rounded-lg">{Math.round(amount).toLocaleString()} <span className="text-[10px] text-muted-foreground">TP</span></div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-secondary/10 rounded-[2rem] border border-dashed border-border/50">
              <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground font-medium mb-4">Henüz açık bir işleminiz bulunmuyor.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          {pastPredictions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pastPredictions.map((pred) => {
                const amount = getAmount(pred);

                return (
                  <Card key={pred.id} className="rounded-[2rem] border border-border/50 opacity-90 hover:opacity-100 transition-opacity bg-secondary/5">
                      <div className="p-4 md:p-5 space-y-3">
                         <div className="flex justify-between items-start gap-4">
                            <h3 className="text-xs md:text-sm font-bold leading-snug text-muted-foreground line-clamp-2">{pred.market?.question}</h3>
                            <Badge variant="outline" className="text-[9px] font-black shrink-0 px-2 py-0.5 bg-background">SONUÇLANDI</Badge>
                         </div>
                         <div className="flex items-center justify-between pt-2 border-t border-border/50">
                            <span className="text-[10px] font-medium text-muted-foreground">{formatDistanceToNow(new Date(pred.created_at), { addSuffix: true, locale: tr })}</span>
                            <span className="font-black text-sm text-foreground bg-background px-2 py-1 rounded-lg border border-border/50 shadow-sm">{Math.round(amount).toLocaleString()} TP</span>
                         </div>
                      </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-secondary/10 rounded-[2rem] border border-dashed border-border/50">
              <History className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-sm text-muted-foreground font-medium">Geçmiş işlem kaydı bulunamadı.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="bookmarks" className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            {/* FAVORİLER EKRANI */}
        </TabsContent>

      </Tabs>
    </div>
  );
}