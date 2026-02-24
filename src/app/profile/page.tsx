import { createServerSideClient } from "@/lib/server-utils";
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bookmark, Calendar, Target, Activity, CheckCircle2, XCircle, TrendingUp, Award, Zap, ShieldCheck } from "lucide-react";
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

  // DİNAMİK RÜTBE SİSTEMİ (Gamification)
  let rank = { title: "Çaylak Tahminci", icon: Activity, color: "text-muted-foreground", bg: "bg-secondary" };
  if (totalVolume > 1000) rank = { title: "Yükselen Yıldız", icon: Zap, color: "text-blue-500", bg: "bg-blue-500/10" };
  if (totalVolume > 10000) rank = { title: "Piyasa Uzmanı", icon: Target, color: "text-purple-500", bg: "bg-purple-500/10" };
  if (totalVolume > 50000) rank = { title: "Kâhin", icon: ShieldCheck, color: "text-yellow-500", bg: "bg-yellow-500/10" };
  if (totalVolume > 100000) rank = { title: "Balina", icon: Award, color: "text-emerald-500", bg: "bg-emerald-500/10" };

  const joinDate = new Date(user.created_at).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

  return (
    <div className="container mx-auto px-0 sm:px-4 py-0 sm:py-8 max-w-[800px] animate-in fade-in duration-500">
      
      {/* TWITTER / X TARZI HEADER */}
      <div className="bg-card sm:rounded-[2rem] border-x border-b sm:border border-border/50 overflow-hidden shadow-sm mb-6 relative pb-6 sm:pb-8">
        
        {/* Kapak Fotoğrafı (Banner) */}
        <div className="h-32 sm:h-48 w-full bg-gradient-to-r from-primary/30 via-purple-500/30 to-blue-500/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent"></div>
        </div>

        {/* Profil Detayları */}
        <div className="px-4 sm:px-8 relative z-10">
          
          <div className="flex justify-between items-end -mt-12 sm:-mt-16 mb-4">
            <div className="relative">
                <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-card shadow-xl bg-card">
                <AvatarImage src={profile?.avatar_url || ""} className="object-cover" />
                <AvatarFallback className="text-3xl font-black bg-secondary text-primary">{profile?.full_name?.[0]?.toUpperCase() || "?"}</AvatarFallback>
                </Avatar>
                {/* Onay Rozeti (Eğer accuracy yüksekse avatarın köşesine iliştir) */}
                {(accuracyRate !== null && accuracyRate >= 60) && (
                    <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-background rounded-full p-0.5">
                        <CheckCircle2 size={24} className="text-blue-500 fill-blue-500/20" />
                    </div>
                )}
            </div>
            
            <div className="mb-2 sm:mb-4">
              <EditProfileDialog currentName={profile?.full_name || ""} currentAvatar={profile?.avatar_url || ""} />
            </div>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
              {profile?.full_name || "İsimsiz Tahminci"}
            </h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm font-medium text-muted-foreground mt-2">
               <Badge variant="secondary" className={`${rank.bg} ${rank.color} hover:${rank.bg} border-none font-black px-2 py-0.5 rounded-lg flex items-center gap-1`}>
                  <rank.icon size={12} /> {rank.title}
               </Badge>
               <span className="flex items-center gap-1 opacity-70"><Calendar size={12}/> {joinDate} katıldı</span>
            </div>
          </div>

          {/* İstatistikler Grid'i (Mobile First - 3'lü Yan Yana Kompakt) */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-6">
            <div className="bg-secondary/40 border border-border/50 rounded-2xl p-3 sm:p-4 flex flex-col items-center text-center">
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Doğruluk</span>
              <span className={`text-lg sm:text-2xl font-black ${accuracyRate === null ? 'text-foreground' : accuracyRate >= 50 ? 'text-green-500' : 'text-red-500'}`}>
                {accuracyRate !== null ? `%${accuracyRate}` : '-%'}
              </span>
            </div>
            <div className="bg-secondary/40 border border-border/50 rounded-2xl p-3 sm:p-4 flex flex-col items-center text-center">
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Hacim</span>
              <span className="text-lg sm:text-2xl font-black text-foreground">{totalVolume >= 1000 ? `${(totalVolume/1000).toFixed(1)}k` : totalVolume} <span className="text-[10px] text-muted-foreground">TP</span></span>
            </div>
            <div className="bg-secondary/40 border border-border/50 rounded-2xl p-3 sm:p-4 flex flex-col items-center text-center">
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">İşlem</span>
              <span className="text-lg sm:text-2xl font-black text-foreground">{predictions.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-0">
        <Tabs defaultValue="feed" className="w-full">
          <TabsList className="w-full h-auto bg-transparent border-b border-border/50 p-0 mb-6 rounded-none flex justify-start gap-4 sm:gap-6 overflow-x-auto no-scrollbar">
            <TabsTrigger value="feed" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3 font-black text-xs sm:text-sm bg-transparent data-[state=active]:shadow-none whitespace-nowrap">
              Zaman Tüneli
            </TabsTrigger>
            <TabsTrigger value="bookmarks" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-3 font-black text-xs sm:text-sm bg-transparent data-[state=active]:shadow-none whitespace-nowrap">
              İzleme Listesi <Badge variant="secondary" className="ml-1.5 sm:ml-2 text-[9px] bg-primary/10 text-primary">{bookmarks.length}</Badge>
            </TabsTrigger>
          </TabsList>

          {/* 1. SEKME: ZAMAN TÜNELİ (Sosyal Medya Akışı Tarzı) */}
          <TabsContent value="feed" className="space-y-0">
            {predictions.length > 0 ? (
              <div className="relative border-l-2 border-border/50 ml-3 sm:ml-6 space-y-6 sm:space-y-8 pb-8 mt-2">
                {predictions.map((pred) => {
                  const isBinary = pred.market?.market_type === 'binary';
                  const isYes = isBinary && (pred.side === 'YES' || pred.side === 'yes');
                  const optionLabel = isBinary ? (isYes ? 'EVET' : 'HAYIR') : (pred.market_option?.name || `Seçenek`);
                  const isWon = pred.is_winner === true;
                  const isLost = pred.is_winner === false;
                  const isActive = pred.is_winner === null;

                  return (
                    <div key={pred.id} className="relative pl-5 sm:pl-8 group">
                      {/* Timeline Noktası */}
                      <div className={`absolute -left-[9px] sm:-left-[11px] top-1 sm:top-1.5 h-4 w-4 sm:h-5 sm:w-5 rounded-full border-4 border-background flex items-center justify-center
                        ${isActive ? 'bg-blue-500' : isWon ? 'bg-green-500' : 'bg-red-500'}
                      `}></div>

                      {/* Aksiyon Başlığı */}
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
                        {isActive ? (
                            <Badge variant="outline" className="text-[9px] font-black uppercase text-blue-500 border-none bg-blue-500/10 px-1.5 py-0">Tahmin Yaptı</Badge>
                        ) : isWon ? (
                            <Badge variant="outline" className="text-[9px] font-black uppercase text-green-500 border-none bg-green-500/10 px-1.5 py-0">Kazandı</Badge>
                        ) : (
                            <Badge variant="outline" className="text-[9px] font-black uppercase text-red-500 border-none bg-red-500/10 px-1.5 py-0">Kaybetti</Badge>
                        )}
                        <span className="text-[10px] font-medium text-muted-foreground lowercase">• {formatDistanceToNow(new Date(pred.created_at), { addSuffix: true, locale: tr })}</span>
                      </div>

                      {/* Akış Kartı */}
                      <Link href={`/market/${pred.market?.slug}`} className="block">
                        <Card className="rounded-2xl border border-border/50 hover:border-primary/40 transition-all bg-card/50 px-4 py-3 sm:px-5 sm:py-4 shadow-sm">
                          <h3 className="text-xs sm:text-sm font-bold leading-snug group-hover:text-primary transition-colors pr-2 mb-3">
                            {pred.market?.question}
                          </h3>
                          <div className="flex items-center justify-between border-t border-border/50 pt-2.5 sm:pt-3">
                             <div className="flex items-center gap-2">
                                <span className="text-[9px] sm:text-[10px] font-black uppercase text-muted-foreground">Seçim</span>
                                <Badge variant="secondary" className={`text-[10px] sm:text-xs font-black ${isBinary ? (isYes ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10') : 'text-primary bg-primary/10'}`}>
                                    {optionLabel}
                                </Badge>
                             </div>
                             <div className="text-right">
                                <span className="text-[9px] sm:text-[10px] font-black uppercase text-muted-foreground block mb-0.5">Yatırım</span>
                                <span className="font-black text-xs sm:text-sm text-foreground">{Math.round(getAmount(pred)).toLocaleString()} TP</span>
                             </div>
                          </div>
                        </Card>
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-secondary/10 rounded-3xl border border-dashed border-border/50 mt-4">
                <Activity className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">Henüz bir aktivite yok.</p>
              </div>
            )}
          </TabsContent>

          {/* 2. SEKME: İZLEME LİSTESİ */}
          <TabsContent value="bookmarks" className="space-y-3 mt-4">
             {bookmarks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {bookmarks.map((bookmark) => (
                  <Link key={bookmark.id} href={`/market/${bookmark.market?.slug}`}>
                    <Card className="rounded-2xl border border-border/50 hover:border-yellow-500/50 transition-all bg-card/50 px-4 py-3 sm:px-5 sm:py-4 flex flex-col gap-2 relative group">
                      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 opacity-50 group-hover:opacity-100 transition-opacity">
                         <Bookmark className="text-yellow-500" size={16} />
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold group-hover:text-yellow-600 transition-colors line-clamp-2 pr-6">{bookmark.market?.question}</h3>
                      <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">
                        <Calendar size={12} className="text-yellow-600" />
                        <span>Bitiş: {new Date(bookmark.market?.end_date).toLocaleDateString('tr-TR')}</span>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-secondary/10 rounded-3xl border border-dashed border-border/50">
                <Bookmark className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">İzleme listeniz şu an boş.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}