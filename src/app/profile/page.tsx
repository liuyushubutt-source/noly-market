import { createServerSideClient } from "@/lib/server-utils";
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bookmark, Calendar, Target, Activity, CheckCircle2, XCircle, TrendingUp } from "lucide-react";
import Link from "next/link";
import { EditProfileDialog } from "@/components/profile/edit-profile-dialog";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

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

  const getAmount = (p: any) => Number(p.amount_tp || p.amount || 0);

  // İSTATİSTİKLER (Cüzdan detayları yerine Kariyer detayları)
  const totalVolume = predictions.reduce((sum, p) => sum + getAmount(p), 0);
  const wonPredictions = predictions.filter(p => p.is_winner === true); 
  const resolvedPredictions = predictions.filter(p => p.is_winner !== null);
  const accuracyRate = resolvedPredictions.length > 0 ? Math.round((wonPredictions.length / resolvedPredictions.length) * 100) : null;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-[900px] animate-in fade-in duration-500">
      
      {/* VİTRİN KARTI */}
      <div className="bg-card border-2 border-border/50 rounded-[2.5rem] p-8 md:p-12 mb-8 shadow-xl relative overflow-hidden flex flex-col items-center text-center">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center gap-5 w-full">
          <div className="relative">
            <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-background shadow-2xl">
              <AvatarImage src={profile?.avatar_url || ""} className="object-cover" />
              <AvatarFallback className="text-5xl font-black bg-secondary/80 text-primary">{profile?.full_name?.[0]?.toUpperCase() || "?"}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 -right-2">
              <EditProfileDialog currentName={profile?.full_name || ""} currentAvatar={profile?.avatar_url || ""} />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center justify-center gap-3">
              {profile?.full_name || "Tahminci"}
            </h1>
            {(accuracyRate !== null && accuracyRate >= 60) && <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white font-black uppercase tracking-widest text-xs px-3 py-1 mt-2">⭐ Top Tahminci</Badge>}
          </div>

          {/* İSTATİSTİKLER (Daha şık, cüzdandan uzak) */}
          <div className="flex flex-wrap justify-center gap-3 md:gap-6 mt-4 w-full">
            <div className="bg-secondary/40 border border-border/50 rounded-2xl p-4 flex flex-col items-center flex-1 min-w-[120px] max-w-[180px]">
              <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 mb-1"><Target size={14} /> Doğruluk</span>
              <div className={`text-2xl font-black ${accuracyRate === null ? 'text-foreground' : accuracyRate >= 60 ? 'text-green-500' : accuracyRate < 40 ? 'text-red-500' : 'text-yellow-500'}`}>
                {accuracyRate !== null ? `%${accuracyRate}` : '-%'}
              </div>
            </div>
            <div className="bg-secondary/40 border border-border/50 rounded-2xl p-4 flex flex-col items-center flex-1 min-w-[120px] max-w-[180px]">
              <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 mb-1"><TrendingUp size={14} /> Hacim</span>
              <div className="text-2xl font-black text-foreground">{totalVolume >= 1000 ? `${(totalVolume/1000).toFixed(1)}k` : totalVolume} <span className="text-xs text-muted-foreground">TP</span></div>
            </div>
            <div className="bg-secondary/40 border border-border/50 rounded-2xl p-4 flex flex-col items-center flex-1 min-w-[120px] max-w-[180px]">
              <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 mb-1"><Activity size={14} /> İşlem</span>
              <div className="text-2xl font-black text-foreground">{predictions.length}</div>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="feed" className="w-full">
        <TabsList className="w-full h-auto bg-secondary/30 border border-border/50 p-1 mb-6 rounded-2xl grid grid-cols-2">
          <TabsTrigger value="feed" className="h-12 rounded-xl font-black text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all">
            <Activity size={16} className="mr-2" /> Zaman Tüneli
          </TabsTrigger>
          <TabsTrigger value="bookmarks" className="h-12 rounded-xl font-black text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all">
            <Bookmark size={16} className="mr-2" /> İzleme Listesi <span className="ml-2 bg-secondary/50 text-muted-foreground px-2 py-0.5 rounded-lg text-[10px]">{bookmarks.length}</span>
          </TabsTrigger>
        </TabsList>

        {/* 1. SEKME: ZAMAN TÜNELİ (Tüm işlemler, Sosyal Medya akışı gibi) */}
        <TabsContent value="feed" className="space-y-4">
          {predictions.length > 0 ? (
            <div className="flex flex-col gap-4">
              {predictions.map((pred) => {
                const isBinary = pred.market?.market_type === 'binary';
                const isYes = isBinary && (pred.side === 'YES' || pred.side === 'yes');
                const optionLabel = isBinary ? (isYes ? 'EVET' : 'HAYIR') : (pred.market_option?.name || `Seçenek`);
                const isWon = pred.is_winner === true;
                const isLost = pred.is_winner === false;
                const isActive = pred.is_winner === null;

                return (
                  <Link key={pred.id} href={`/market/${pred.market?.slug}`} className="block group">
                    <Card className="rounded-[2rem] border border-border/50 hover:border-primary/50 transition-all hover:shadow-md bg-card/50 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          {isActive ? (
                            <Badge variant="outline" className="text-[9px] font-black uppercase text-primary border-primary/30 bg-primary/5">AÇIK</Badge>
                          ) : isWon ? (
                            <Badge className="text-[9px] font-black uppercase bg-green-500 hover:bg-green-600"><CheckCircle2 size={10} className="mr-1"/> KAZANDI</Badge>
                          ) : (
                            <Badge variant="destructive" className="text-[9px] font-black uppercase"><XCircle size={10} className="mr-1"/> KAYBETTİ</Badge>
                          )}
                          <span className="text-[10px] font-medium text-muted-foreground">{formatDistanceToNow(new Date(pred.created_at), { addSuffix: true, locale: tr })}</span>
                        </div>
                        <h3 className="text-sm font-bold leading-snug group-hover:text-primary transition-colors pr-2">
                          {pred.market?.question} piyasasında <span className={`font-black ${isBinary ? (isYes ? 'text-green-500' : 'text-red-500') : 'text-primary'}`}>"{optionLabel}"</span> tahmini yaptı.
                        </h3>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-secondary/10 rounded-[2rem] border border-dashed border-border/50">
              <Activity className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-sm text-muted-foreground font-medium">Henüz bir aktiviteniz bulunmuyor.</p>
            </div>
          )}
        </TabsContent>

        {/* 2. SEKME: İZLEME LİSTESİ */}
        <TabsContent value="bookmarks" className="space-y-4">
          {bookmarks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookmarks.map((bookmark) => (
                <Link key={bookmark.id} href={`/market/${bookmark.market?.slug}`} className="block group">
                  <Card className="rounded-[2rem] border border-border/50 hover:border-yellow-500/50 transition-all hover:shadow-lg bg-card/50 overflow-hidden px-5 py-4">
                      <h3 className="text-sm font-bold leading-snug group-hover:text-yellow-600 transition-colors">
                        {bookmark.market?.question}
                      </h3>
                      <div className="flex items-center gap-2 text-[10px] md:text-xs font-black text-muted-foreground uppercase tracking-widest pt-3">
                        <Calendar size={14} className="text-yellow-600" />
                        <span>Bitiş: {new Date(bookmark.market?.end_date).toLocaleDateString('tr-TR')}</span>
                      </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-secondary/10 rounded-[2rem] border border-dashed border-border/50">
              <Bookmark className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-sm text-muted-foreground font-medium">İzleme listeniz şu an boş.</p>
            </div>
          )}
        </TabsContent>

      </Tabs>
    </div>
  );
}