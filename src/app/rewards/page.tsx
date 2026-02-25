import { createServerSideClient } from "@/lib/server-utils";
import { QuestButton } from "@/components/rewards/quest-button";
import { Gift, Wallet, TrendingUp, Zap, Crown, CheckCircle2, Flame, Target, MessageSquare, Lock, ArrowRight, BookmarkPlus, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function RewardsPage() {
  const supabase = await createServerSideClient();
  const { data: { user } } = await supabase.auth.getUser();

  let tpBalance = 0;
  let completedQuests: string[] = []; 
  
  // GÖREV DOĞRULAMA (VERIFICATION) DEĞİŞKENLERİ
  let hasPrediction = false;
  let hasComment = false;
  let isProfileComplete = false;
  let hasBookmark = false;
  let hasWin = false;
  let hasHighRoller = false;

  if (user) {
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    tpBalance = profile?.tp_balance ?? 0;
    
    // Profil tam mı? (İsim ve Avatar girilmiş mi?)
    isProfileComplete = !!(profile?.full_name && profile?.avatar_url && profile?.avatar_url !== "");

    // Alınmış ödüller
    const { data: userQuests } = await supabase.from("user_quests").select("quest_id").eq("user_id", user.id);
    completedQuests = Array.isArray(userQuests) ? userQuests.map(q => q.quest_id) : [];

    // TAHMİN KONTROLÜ (En az 1 tahmini var mı?)
    const { count: predCount } = await supabase.from('predictions').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
    hasPrediction = (predCount || 0) > 0;

    // YORUM KONTROLÜ (En az 1 yorumu var mı?)
    const { count: commentCount } = await supabase.from('comments').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
    hasComment = (commentCount || 0) > 0;

    // FAVORİ KONTROLÜ (En az 1 favorisi var mı?)
    const { count: bookmarkCount } = await supabase.from('bookmarks').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
    hasBookmark = (bookmarkCount || 0) > 0;

    // İLK ZAFER KONTROLÜ (Kazandığı tahmin var mı?)
    const { count: winCount } = await supabase.from('predictions').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_winner', true);
    hasWin = (winCount || 0) > 0;

    // CESUR YÜREK KONTROLÜ (1000 TP ve üzeri yatırımı var mı?)
    const { count: highRollerCount } = await supabase.from('predictions').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('amount_tp', 1000);
    hasHighRoller = (highRollerCount || 0) > 0;
  }

  // GERÇEK DOĞRULAMALI GÖREV LİSTESİ
  const quests = [
    { id: "first_prediction", title: "İlk Öngörünü Yap", desc: "Herhangi bir piyasada pozisyon al.", reward: 500, icon: Target, isEligible: hasPrediction, isCompleted: completedQuests.includes("first_prediction"), link: "/" },
    { id: "first_comment", title: "Tartışmaya Katıl", desc: "Bir piyasanın panosunda yorum bırak.", reward: 150, icon: MessageSquare, isEligible: hasComment, isCompleted: completedQuests.includes("first_comment"), link: "/" },
    { id: "profile_complete", title: "Profilini Tamamla", desc: "İsim ve dikkat çekici bir avatar seç.", reward: 300, icon: Crown, isEligible: isProfileComplete, isCompleted: completedQuests.includes("profile_complete"), link: "/profile" },
    { id: "first_bookmark", title: "Yakın Takip", desc: "İlgini çeken bir piyasayı favorilerine ekle.", reward: 100, icon: BookmarkPlus, isEligible: hasBookmark, isCompleted: completedQuests.includes("first_bookmark"), link: "/" },
    { id: "first_win", title: "İlk Zafer", desc: "Yaptığın bir tahmin doğru çıksın.", reward: 1000, icon: Trophy, isEligible: hasWin, isCompleted: completedQuests.includes("first_win"), link: "/portfolio" },
    { id: "high_roller", title: "Cesur Yürek", desc: "Tek bir öngörüye en az 1.000 TP yatır.", reward: 1500, icon: Zap, isEligible: hasHighRoller, isCompleted: completedQuests.includes("high_roller"), link: "/" },
  ];

  const rewards = [
    { title: "Noly Özel Avatar Çerçevesi", cost: 5000, icon: Crown, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { title: "Koyu Tema 'Pro' Rozeti", cost: 15000, icon: Zap, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Noly Market Özel Tasarım T-shirt", cost: 50000, icon: Gift, color: "text-pink-500", bg: "bg-pink-500/10" },
    { title: "Piyasa Açma İsteği Hakkı", cost: 100000, icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10" },
  ];

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-[1200px] animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="bg-gradient-to-br from-card to-secondary/30 border border-border/50 rounded-[2.5rem] p-6 md:p-10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 mb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div className="space-y-4 flex-1 text-center md:text-left z-10">
          <Badge variant="outline" className="bg-pink-500/10 text-pink-500 border-pink-500/20 font-black tracking-widest uppercase mb-2">
            Ödül Merkezi
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter">
            TP KAZAN, <br className="hidden md:block"/> SİSTEMİ YÖNET.
          </h1>
          <p className="text-muted-foreground font-medium text-sm sm:text-lg max-w-md mx-auto md:mx-0">
            Görevleri tamamla, isabetli öngörüler yap ve platformdaki otoriteni kanıtla.
          </p>
        </div>

        {user ? (
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto z-10">
            {/* SAHTE GÜNLÜK SERİ YERİNE GERÇEK GÖREV İSTATİSTİĞİ */}
            <div className="bg-background/80 backdrop-blur border border-border/50 p-4 rounded-3xl flex items-center justify-between gap-6 shadow-sm flex-1">
              <div className="flex items-center gap-3">
                <div className="bg-green-500/20 p-2.5 rounded-xl">
                  <Target className="text-green-500 h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Tamamlanan Görev</p>
                  <p className="font-black text-lg">{completedQuests.length} / {quests.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-background/80 backdrop-blur border border-border/50 p-6 rounded-3xl text-center shadow-xl flex-1">
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Mevcut Bakiyen</p>
              <div className="flex items-center justify-center gap-2 text-primary font-black text-3xl sm:text-4xl mb-2">
                <Wallet size={24} />
                <span>{Math.round(tpBalance).toLocaleString()} <span className="text-base">TP</span></span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-background/80 backdrop-blur border border-border/50 p-8 rounded-[2rem] w-full md:w-auto text-center shrink-0 space-y-4 z-10 shadow-xl">
            <Gift className="h-12 w-12 text-primary mx-auto mb-2 opacity-80" />
            <h3 className="font-black text-xl">Sisteme Katıl</h3>
            <p className="text-xs text-muted-foreground font-medium max-w-[200px] mx-auto">Görevleri tamamlayıp binlerce TP kazanmak için giriş yap.</p>
            <Button asChild className="w-full h-12 font-black shadow-lg shadow-primary/20"><Link href="/">GİRİŞ YAP</Link></Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="quests" className="w-full">
        <TabsList className="w-full md:w-auto h-auto bg-secondary/30 border border-border/50 p-1.5 mb-8 rounded-2xl flex flex-col sm:flex-row gap-1">
          <TabsTrigger value="quests" className="h-12 rounded-xl px-8 font-black text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary flex-1 sm:flex-none transition-all">
            <Target size={18} className="mr-2" /> Görevler <Badge variant="secondary" className="ml-2 text-[10px]">{quests.filter(q => !q.isCompleted).length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="store" className="h-12 rounded-xl px-8 font-black text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary flex-1 sm:flex-none transition-all">
            <Gift size={18} className="mr-2" /> Mağaza
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quests" className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quests.map((quest) => {
              const QuestIcon = quest.icon;
              
              return (
              <div key={quest.id} className={`p-5 sm:p-6 rounded-[2rem] border-2 transition-all flex flex-col justify-between h-full ${quest.isCompleted ? 'bg-secondary/10 border-border/30 opacity-70' : 'bg-card border-border/50 hover:border-primary/40 shadow-sm'}`}>
                
                <div className="flex items-start gap-4 mb-6">
                  <div className={`p-3 rounded-2xl shrink-0 ${quest.isCompleted ? 'bg-secondary text-muted-foreground' : 'bg-primary/10 text-primary'}`}>
                    <QuestIcon size={24} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-base sm:text-lg leading-tight">{quest.title}</h3>
                    <p className="text-[11px] sm:text-xs text-muted-foreground font-medium line-clamp-2">{quest.desc}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                  <div className="flex items-center gap-1.5 font-black text-base sm:text-lg text-foreground">
                    +{quest.reward} <span className="text-[10px] uppercase text-muted-foreground">TP</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* YENİ NESİL BUTON ENTEGRASYONU */}
                    <QuestButton questId={quest.id} reward={quest.reward} isCompleted={quest.isCompleted} isEligible={quest.isEligible} link={quest.link} />
                  </div>
                </div>

              </div>
            )})}
          </div>
        </TabsContent>

        <TabsContent value="store" className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {rewards.map((reward, i) => {
              const progress = user ? Math.min((tpBalance / reward.cost) * 100, 100) : 0;
              const canAfford = progress === 100;
              const RewardIcon = reward.icon;

              return (
                <div key={i} className="bg-card border-2 border-border/50 rounded-[2rem] p-5 sm:p-6 shadow-sm hover:border-primary/30 transition-all flex flex-col h-full relative overflow-hidden group">
                  {!canAfford && (
                     <div className="absolute top-4 right-4 p-2 bg-secondary/50 rounded-full text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity">
                       <Lock size={14} />
                     </div>
                  )}
                  <div className="flex items-start gap-4 mb-5">
                    <div className={`p-3 sm:p-4 rounded-2xl shrink-0 ${reward.bg} border border-border/10`}>
                       <RewardIcon className={`${reward.color} h-6 w-6 sm:h-8 sm:w-8`} />
                    </div>
                    <div className="space-y-1 pt-1">
                      <p className="text-[9px] sm:text-[10px] font-black uppercase text-muted-foreground tracking-widest">Gereken</p>
                      <p className="font-black text-lg sm:text-xl leading-none">{reward.cost.toLocaleString()} <span className="text-[10px] sm:text-xs text-muted-foreground">TP</span></p>
                    </div>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold mb-auto leading-tight pr-4">{reward.title}</h3>
                  <div className="mt-6 sm:mt-8 space-y-3">
                    <div className="flex justify-between text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase">
                      <span>İlerleme</span>
                      <span className={canAfford ? 'text-green-500 font-black' : ''}>%{Math.floor(progress)}</span>
                    </div>
                    <Progress value={progress} className={`h-2 sm:h-2.5 ${canAfford ? 'bg-green-500/20' : ''}`} indicatorColor={canAfford ? 'bg-green-500' : ''} />
                    <Button variant={canAfford ? "default" : "secondary"} className={`w-full mt-2 font-black h-10 sm:h-12 text-xs sm:text-sm ${canAfford ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-muted-foreground'}`} disabled={!canAfford}>
                      {canAfford ? <><CheckCircle2 size={16} className="mr-2"/> HEMEN TALEP ET</> : "YETERSİZ TP"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}