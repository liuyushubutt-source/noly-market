import { createServerSideClient } from "@/lib/server-utils";
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bookmark, Calendar, Target, Activity, CheckCircle2, XCircle, TrendingUp, MapPin, Link as LinkIcon, Award } from "lucide-react";
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

  // İSTATİSTİKLER
  const totalVolume = predictions.reduce((sum, p) => sum + getAmount(p), 0);
  const wonPredictions = predictions.filter(p => p.is_winner === true); 
  const resolvedPredictions = predictions.filter(p => p.is_winner !== null);
  const accuracyRate = resolvedPredictions.length > 0 ? Math.round((wonPredictions.length / resolvedPredictions.length) * 100) : null;

  // OYUNLAŞTIRMA (Rütbe Sistemi)
  let userRank = "Çaylak Tahminci";
  let rankColor = "text-muted-foreground";
  if (totalVolume > 1000) { userRank = "Yükselen Yıldız"; rankColor = "text-blue-500"; }
  if (totalVolume > 10000) { userRank = "Piyasa Uzmanı"; rankColor = "text-purple-500"; }
  if (totalVolume > 50000) { userRank = "Kâhin 🔮"; rankColor = "text-yellow-500"; }
  if (totalVolume > 100000) { userRank = "Balina 🐳"; rankColor = "text-emerald-500"; }

  const joinDate = new Date(user.created_at).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

  return (
    <div className="container mx-auto px-0 sm:px-4 py-0 sm:py-8 max-w-[800px] animate-in fade-in duration-500">
      
      {/* TWITTER/X TARZI PROFİL HEADER */}
      <div className="bg-card sm:rounded-3xl border-x border-b sm:border border-border/50 overflow-hidden shadow-sm mb-6 relative">
        
        {/* Kapak Fotoğrafı (Banner) */}
        <div className="h-32 sm:h-48 w-full bg-gradient-to-r from-primary/40 via-purple-500/20 to-blue-500/40 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
          <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-background/80 to-transparent"></div>
        </div>

        {/* Profil Detayları */}
        <div className="px-5 sm:px-8 pb-6 relative">
          
          <div className="flex justify-between items-end -mt-12 sm:-mt-16 mb-4">
            <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-card shadow-xl bg-card">
              <AvatarImage src={profile?.avatar_url || ""} className="object-cover" />
              <AvatarFallback className="text-3xl font-black bg-secondary text-primary">{profile?.full_name?.[0]?.toUpperCase() || "?"}</AvatarFallback>
            </Avatar>
            
            {/* Düzenle Butonu Kompakt Hale Geldi */}
            <div className="mb-2">
              <EditProfileDialog currentName={profile?.full_name || ""} currentAvatar={profile?.avatar_url || ""} />
            </div>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
              {profile?.full_name || "Kullanıcı"}
              {(accuracyRate !== null && accuracyRate >= 60) && <CheckCircle2 size={20} className="text-blue-500 fill-blue-500/20" />}
            </h1>
            <div className="flex items-center gap-3 text-xs sm:text-sm font-medium text-muted-foreground mt-2">
               <span className={`flex items-center gap-1 font-bold ${rankColor}`}><Award size={14}/> {userRank}</span>
               <span>•</span>
               <span className="flex items-center gap-1"><Calendar size={14}/> {joinDate} katıldı</span>
            </div>
          </div>

          {/* İstatistikler (Satır İçi Kompakt) */}
          <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t border-border/50">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Toplam İşlem</span>
              <span className="text-xl font-black text-foreground">{predictions.length}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Hacim</span>
              <span className="text-xl font-black text-foreground">{totalVolume.toLocaleString()} <span className="text-xs text-muted-foreground">TP</span></span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Doğruluk</span>
              <span className={`text-xl font-black ${accuracyRate === null ? 'text-foreground' : accuracyRate >= 50 ? 'text-green-500' : 'text-red-500'}`}>
                {accuracyRate !== null ? `%${accuracyRate}` : '-%'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-0">
        <Tabs defaultValue="feed" className="w-full">
          <TabsList className="w-full h-auto bg-transparent border-b border-border/50 p-0 mb-6 rounded-none flex justify-start gap-6 overflow-x-auto no-scrollbar">
            <TabsTrigger value="feed" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3 font-bold text-sm bg-transparent data-[state=active]:shadow-none">
              Zaman Tüneli
            </TabsTrigger>
            <TabsTrigger value="bookmarks" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3 font-bold text-sm bg-transparent data-[state=active]:shadow-none">
              İzleme Listesi <Badge variant="secondary" className="ml-2 text-[10px]">{bookmarks.length}</Badge>
            </TabsTrigger>
          </TabsList>

          {/* 1. SEKME: ZAMAN TÜNELİ (Timeline Tasarımı) */}
          <TabsContent value="feed" className="space-y-0">
            {predictions.length > 0 ? (
              <div className="relative border-l-2 border-border/50 ml-4 sm:ml-6 space-y-8 pb-8">
                {predictions.map((pred) => {
                  const isBinary = pred.market?.market_type === 'binary';
                  const isYes = isBinary && (pred.side === 'YES' || pred.side === 'yes');
                  const optionLabel = isBinary ? (isYes ? 'EVET' : 'HAYIR') : (pred.market_option?.name || `Seçenek`);
                  const isWon = pred.is_winner === true;
                  const isLost = pred.is_winner === false;
                  const isActive = pred.is_winner === null;

                  return (
                    <div key={pred.id} className="relative pl-6 sm:pl-8 group">
                      {/* Timeline Noktası */}
                      <div className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-background flex items-center justify-center
                        ${isActive ? 'bg-blue-500' : isWon ? 'bg-green-500' : 'bg-red-500'}
                      `}></div>

                      <div className="flex flex-col gap-1.5 mb-2">
                        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          {isActive ? <span className="text-blue-500">Tahmin Yaptı</span> : isWon ? <span className="text-green-500">Kazandı</span> : <span className="text-red-500">Kaybetti</span>}
                          <span>•</span>
                          <span className="font-medium lowercase">{formatDistanceToNow(new Date(pred.created_at), { addSuffix: true, locale: tr })}</span>
                        </div>
                      </div>

                      <Link href={`/market/${pred.market?.slug}`} className="block">
                        <Card className="rounded-2xl border border-border/50 hover:border-primary/40 transition-all bg-card/50 px-4 py-3 sm:px-5 sm:py-4">
                          <h3 className="text-sm font-bold leading-snug group-hover:text-primary transition-colors pr-2 mb-3">
                            {pred.market?.question}
                          </h3>
                          <div className="flex items-center gap-2 text-xs">
                             <span className="text-muted-foreground">Seçimi:</span>
                             <Badge variant="secondary" className={`font-black ${isBinary ? (isYes ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10') : 'text-primary bg-primary/10'}`}>
                                {optionLabel}
                             </Badge>
                             <span className="ml-auto font-black text-foreground">{Math.round(getAmount(pred)).toLocaleString()} TP</span>
                          </div>
                        </Card>
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <Activity className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-sm text-muted-foreground font-medium">Henüz bir aktivite yok.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="bookmarks" className="space-y-4">
            {/* Eski İzleme Listesi Kutuları aynı kalabilir, burası zaten iyiydi */}
             {bookmarks.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {bookmarks.map((bookmark) => (
                  <Link key={bookmark.id} href={`/market/${bookmark.market?.slug}`}>
                    <Card className="rounded-2xl border border-border/50 hover:border-yellow-500/50 transition-all bg-card/50 px-5 py-4 flex items-center justify-between">
                      <h3 className="text-sm font-bold group-hover:text-yellow-600 transition-colors line-clamp-2 pr-4">{bookmark.market?.question}</h3>
                      <Bookmark className="text-yellow-500 shrink-0" size={18} />
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Bookmark className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-sm text-muted-foreground font-medium">İzleme listeniz şu an boş.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}