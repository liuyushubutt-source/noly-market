import type { Metadata } from "next";
import { getLeaderboard, getCurrentUserRank } from "@/actions/leaderboard-actions";
import { createServerSideClient } from "@/lib/server-utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, TrendingUp, Crown, MoreVertical } from "lucide-react";

// YENİ EKLENEN: Dinamik SEO Optimizasyonu
export const metadata: Metadata = {
  title: "Liderlik Tablosu | Noly Market",
  description: "Noly Market'in en isabetli öngörü yapan devleri. Zirveye adını yazdır, öngörünü kanıtla ve büyük ödülleri topla.",
  openGraph: {
    title: "Liderlik Tablosu | Noly Market",
    description: "Türkiye'nin en iyi tahmincileri burada yarışıyor. Sen kaçıncı sıradasın?",
  }
};

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const supabase = await createServerSideClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const leaders = await getLeaderboard();
  
  // Kullanıcı ilk 50'de mi kontrol et
  let isUserInTop50 = false;
  let currentUserRankData = null;

  if (user) {
    isUserInTop50 = leaders.some((l) => l.id === user.id);
    // Eğer ilk 50'de değilse, tam sırasını arkadan hesapla
    if (!isUserInTop50) {
      currentUserRankData = await getCurrentUserRank(user.id);
    }
  }

  // Ortak satır render fonksiyonu (Kod tekrarını önlemek için)
  const renderLeaderRow = (leader: any, rank: number, isCurrentUser: boolean, isStickyBottom = false) => {
    let rowStyle = "bg-background/50 hover:bg-secondary/20 border-border/50";
    let rankColor = "text-muted-foreground";

    if (rank === 1) {
      rowStyle = "bg-yellow-500/10 hover:bg-yellow-500/20 border-yellow-500/30 shadow-[inset_0_0_20px_rgba(234,179,8,0.05)] z-10 relative";
      rankColor = "text-yellow-500";
    } else if (rank === 2) {
      rowStyle = "bg-slate-400/10 hover:bg-slate-400/20 border-slate-400/30";
      rankColor = "text-slate-400";
    } else if (rank === 3) {
      rowStyle = "bg-amber-600/10 hover:bg-amber-600/20 border-amber-600/30";
      rankColor = "text-amber-600";
    } else if (isCurrentUser) {
      rowStyle = `bg-primary/10 hover:bg-primary/20 border-primary/30 relative z-10 ${isStickyBottom ? 'border-t-2 border-primary/50' : ''}`;
      rankColor = "text-primary";
    }

    return (
      <div 
        key={leader.id} 
        className={`flex items-center justify-between p-4 md:p-5 border-b last:border-0 transition-all ${rowStyle}`}
      >
        <div className="flex items-center gap-4 md:gap-6 flex-1 overflow-hidden">
          <div className="w-8 md:w-10 flex justify-center shrink-0">
            {rank === 1 ? <Crown className={`${rankColor} h-7 w-7 fill-current`} /> : 
             rank === 2 ? <Medal className={`${rankColor} h-6 w-6 fill-current`} /> : 
             rank === 3 ? <Medal className={`${rankColor} h-6 w-6 fill-current`} /> : 
             <span className={`text-lg md:text-xl font-black ${rankColor}`}>{rank}</span>}
          </div>

          <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
            <Avatar className={`h-10 w-10 md:h-12 md:w-12 border-2 ${rank <= 3 || isCurrentUser ? `border-${rankColor.split('-')[1]}-500/50` : 'border-border'}`}>
              <AvatarImage src={leader.avatar_url} />
              <AvatarFallback className="font-bold bg-secondary">
                {leader.full_name?.[0]?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col truncate">
              <span className="font-bold text-sm md:text-base truncate flex items-center gap-2">
                {leader.full_name || "Gizli Kullanıcı"}
                {isCurrentUser && <span className="text-[9px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded uppercase tracking-wider hidden sm:inline-block">Sen</span>}
              </span>
              {rank === 1 && <span className="text-[10px] font-black text-yellow-600 dark:text-yellow-500 uppercase tracking-widest hidden sm:block">Piyasa Lideri</span>}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end shrink-0 pl-4">
          <div className={`flex items-center gap-1.5 font-black text-lg md:text-xl ${rank <= 3 ? rankColor : isCurrentUser ? 'text-primary' : 'text-foreground'}`}>
            <span>{Math.round(leader.tp_balance).toLocaleString()}</span>
            <span className="text-[10px] uppercase opacity-70">TP</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-[800px] animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="text-center space-y-4 mb-10">
        <div className="inline-flex items-center justify-center p-4 bg-yellow-500/10 rounded-full mb-2 border border-yellow-500/20 shadow-[0_0_30px_-5px_rgba(234,179,8,0.3)]">
          <Trophy className="text-yellow-500 h-12 w-12" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter">
          LİDERLİK TABLOSU
        </h1>
        <p className="text-muted-foreground font-medium text-lg max-w-md mx-auto">
          Noly Market'in en isabetli öngörü yapan devleri. Zirveye adını yazdır, ödülleri kap.
        </p>
      </div>

      <div className="bg-card border border-border/50 rounded-[2rem] overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        {/* İLK 50 LİDERİ RENDER ET */}
        {leaders.map((leader, index) => renderLeaderRow(leader, index + 1, user?.id === leader.id))}

        {/* EĞER KULLANICI İLK 50'DE DEĞİLSE, EN ALTA KENDİ SIRASINI YAPIŞTIR */}
        {currentUserRankData && (
          <>
            <div className="flex justify-center py-2 bg-secondary/5">
              <MoreVertical className="text-muted-foreground/50 h-5 w-5" />
            </div>
            {renderLeaderRow(currentUserRankData, currentUserRankData.rank, true, true)}
          </>
        )}

        {leaders.length === 0 && (
          <div className="p-20 flex flex-col items-center justify-center text-muted-foreground font-medium bg-secondary/10">
            <Trophy className="h-12 w-12 opacity-20 mb-4" />
            <p>Sistemde henüz yeterli veri bulunmuyor.</p>
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-2 text-[11px] font-bold text-muted-foreground bg-secondary/30 py-3 px-6 rounded-full border border-border/40 mx-auto w-fit">
        <TrendingUp size={14} className="text-green-500" />
        <span>Sıralama aktif piyasalardaki kazançlara göre otomatik güncellenir.</span>
      </div>
    </div>
  );
}