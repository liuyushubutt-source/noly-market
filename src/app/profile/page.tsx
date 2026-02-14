import { createServerSideClient } from "@/lib/server-utils";
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, TrendingUp, History, Bookmark, Calendar, AlertCircle } from "lucide-react";
import Link from "next/link";
import { EditProfileDialog } from "@/components/profile/edit-profile-dialog";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

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

  // 3. Tahminleri (Predictions) Çek
  const { data: predictionsData } = await supabase
    .from("predictions")
    .select("*, market:markets(*)") // İlişkili market verisini de al
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // 4. Kaydedilenleri (Bookmarks) Çek
  const { data: bookmarksData } = await supabase
    .from("bookmarks")
    .select("*, market:markets(*)")
    .eq("user_id", user.id);

  // --- GÜVENLİK DUVARI: Veri null gelse bile boş dizi ([]) olarak kabul et ---
  const predictions = predictionsData || [];
  const bookmarks = bookmarksData || [];

  // 5. Aktif ve Geçmiş İşlemleri Ayır (Filter işlemi güvenli dizi üzerinde yapılır)
  const activePredictions = predictions.filter(p => p.market?.status === "active");
  const pastPredictions = predictions.filter(p => p.market?.status !== "active");

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-[1000px] animate-in fade-in duration-500">
      
      {/* ÜST PROFİL KARTI */}
      <div className="relative bg-gradient-to-br from-secondary/50 to-background border border-border/50 rounded-[2.5rem] p-6 md:p-10 mb-10 overflow-hidden shadow-sm">
        {/* Arkaplan Efekti */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10">
          
          {/* Avatar */}
          <Avatar className="h-28 w-28 md:h-36 md:w-36 border-4 border-background shadow-2xl z-10 shrink-0">
            <AvatarImage src={profile?.avatar_url || ""} className="object-cover" />
            <AvatarFallback className="text-4xl font-black bg-secondary/80">
              {profile?.full_name?.[0]?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          
          {/* İsim ve İstatistikler */}
          <div className="flex-1 text-center md:text-left z-10 space-y-3 mt-2">
            <div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2">
                {profile?.full_name || "Bilinmeyen Kullanıcı"}
              </h1>
              
              {/* Profil Düzenle Butonu */}
              <EditProfileDialog 
                currentName={profile?.full_name || ""} 
                currentAvatar={profile?.avatar_url || ""} 
              />
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
              {/* Bakiye */}
              <div className="flex items-center gap-2 bg-primary/10 px-5 py-2.5 rounded-2xl text-primary border border-primary/20 shadow-sm">
                <Wallet size={20} />
                <span className="font-black text-xl md:text-2xl">
                  {Math.round(profile?.tp_balance || 0).toLocaleString()} <span className="text-sm opacity-80">TP</span>
                </span>
              </div>

              {/* Toplam İşlem Sayısı (Güvenli Hesaplama) */}
              <div className="flex items-center gap-2 bg-secondary/80 px-5 py-2.5 rounded-2xl text-foreground/80 font-bold border border-border/50">
                <span className="text-xs uppercase tracking-widest opacity-70">İşlem</span>
                <span className="text-xl">
                  {(activePredictions?.length || 0) + (pastPredictions?.length || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SEKMELER (Açık, Geçmiş, Kaydedilenler) */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="w-full md:w-auto h-auto bg-secondary/30 border border-border/50 p-1.5 mb-8 rounded-2xl flex flex-col sm:flex-row gap-1">
          <TabsTrigger value="active" className="h-10 rounded-xl px-6 font-bold text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary flex-1 sm:flex-none">
            <TrendingUp size={16} className="mr-2" /> 
            Açık İşlemler ({activePredictions?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="past" className="h-10 rounded-xl px-6 font-bold text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary flex-1 sm:flex-none">
            <History size={16} className="mr-2" /> 
            Geçmiş ({pastPredictions?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="bookmarks" className="h-10 rounded-xl px-6 font-bold text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary flex-1 sm:flex-none">
            <Bookmark size={16} className="mr-2" /> 
            Kaydedilenler ({bookmarks?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* 1. SEKME: AÇIK İŞLEMLER */}
        <TabsContent value="active" className="space-y-4">
          {activePredictions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activePredictions.map((pred) => (
                <Link key={pred.id} href={`/market/${pred.market?.slug}`} className="block group">
                  <Card className="rounded-3xl border-border/50 hover:border-primary/50 transition-all hover:shadow-md bg-card/50">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start gap-4">
                        <CardTitle className="text-base font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2">
                          {pred.market?.question}
                        </CardTitle>
                        <Badge variant="outline" className="shrink-0 bg-green-500/10 text-green-600 border-green-500/20 font-bold">
                          {pred.market?.type === 'binary' 
                            ? (pred.option_id === 'yes' ? 'EVET' : 'HAYIR') 
                            : 'SEÇENEK'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm font-medium text-muted-foreground bg-secondary/30 p-3 rounded-xl">
                        <span className="flex items-center gap-1"><Wallet size={14}/> Yatırım:</span>
                        <span className="text-foreground font-bold">{pred.amount} TP</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-secondary/10 rounded-[2rem] border border-dashed border-border/50">
              <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground font-medium">Henüz açık bir işleminiz bulunmuyor.</p>
              <Link href="/">
                <span className="text-primary font-bold hover:underline mt-2 inline-block">Piyasalara Göz At →</span>
              </Link>
            </div>
          )}
        </TabsContent>

        {/* 2. SEKME: GEÇMİŞ İŞLEMLER */}
        <TabsContent value="past" className="space-y-4">
          {pastPredictions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pastPredictions.map((pred) => (
                <Card key={pred.id} className="rounded-3xl border-border/50 opacity-75 hover:opacity-100 transition-opacity">
                   <CardHeader className="pb-3">
                      <div className="flex justify-between items-start gap-4">
                        <CardTitle className="text-base font-bold leading-snug text-muted-foreground line-clamp-2">
                          {pred.market?.question}
                        </CardTitle>
                        <Badge variant="secondary">Sonuçlandı</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm font-medium bg-secondary/30 p-3 rounded-xl">
                        <span>Yatırılan: {pred.amount} TP</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(pred.created_at), { addSuffix: true, locale: tr })}
                        </span>
                      </div>
                    </CardContent>
                </Card>
              ))}
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
                  <Card className="rounded-3xl border-border/50 hover:border-yellow-500/50 transition-all hover:shadow-md bg-card/50">
                    <CardHeader>
                      <CardTitle className="text-base font-bold leading-snug group-hover:text-yellow-600 transition-colors">
                        {bookmark.market?.question}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                        <Calendar size={12} />
                        <span>Bitiş: {new Date(bookmark.market?.end_date).toLocaleDateString('tr-TR')}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-secondary/10 rounded-[2rem] border border-dashed border-border/50">
              <Bookmark className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground font-medium">Henüz favoriye eklediğiniz bir piyasa yok.</p>
              <Link href="/">
                <span className="text-primary font-bold hover:underline mt-2 inline-block">Keşfetmeye Başla →</span>
              </Link>
            </div>
          )}
        </TabsContent>

      </Tabs>
    </div>
  );
}