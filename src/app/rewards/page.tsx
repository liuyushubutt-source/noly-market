import { createServerSideClient } from "@/lib/server-utils";
import { useBalance } from "@/context/balance-context"; // Bu sunucu tarafında çalışmaz, yüzden doğrudan profili çekeceğiz
import { Gift, Wallet, TrendingUp, Zap, Crown, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";

export const dynamic = "force-dynamic";

export default async function RewardsPage() {
  const supabase = await createServerSideClient();
  const { data: { user } } = await supabase.auth.getUser();

  let tpBalance = 0;
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("tp_balance").eq("id", user.id).single();
    tpBalance = profile?.tp_balance || 0;
  }

  // Örnek Ödüller (İleride DB'den çekilebilir)
  const rewards = [
    { title: "Noly Özel Avatar Çerçevesi", cost: 5000, icon: Crown, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { title: "Koyu Tema 'Pro' Rozeti", cost: 15000, icon: Zap, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Noly Market Özel Tasarım T-shirt", cost: 50000, icon: Gift, color: "text-pink-500", bg: "bg-pink-500/10" },
    { title: "Piyasa Açma İsteği Hakkı", cost: 100000, icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10" },
  ];

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-[1000px] animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* BAŞLIK & BAKİYE */}
      <div className="bg-gradient-to-r from-primary/10 to-pink-500/10 border border-primary/20 rounded-[2rem] p-8 md:p-12 shadow-sm text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
        <div className="space-y-4 flex-1">
          <div className="inline-flex items-center justify-center p-3 bg-pink-500/10 rounded-2xl mb-2 border border-pink-500/20 text-pink-500">
            <Gift className="h-8 w-8" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">ÖDÜL MERKEZİ</h1>
          <p className="text-muted-foreground font-medium text-lg max-w-md mx-auto md:mx-0">
            Yaptığın isabetli tahminlerle biriktirdiğin TP'leri gerçek ödüllere ve platform ayrıcalıklarına dönüştür.
          </p>
        </div>

        {user ? (
          <div className="bg-background/80 backdrop-blur border border-border/50 p-6 rounded-3xl w-full md:w-auto text-center shrink-0 shadow-lg">
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Mevcut Bakiyen</p>
            <div className="flex items-center justify-center gap-2 text-primary font-black text-4xl mb-4">
              <Wallet size={24} />
              <span>{Math.round(tpBalance).toLocaleString()} <span className="text-base">TP</span></span>
            </div>
            <Button className="w-full font-bold h-10 shadow-primary/20 shadow-lg">TP Kazanmaya Devam Et</Button>
          </div>
        ) : (
          <div className="bg-background/80 backdrop-blur border border-border/50 p-6 rounded-3xl w-full md:w-auto text-center shrink-0 space-y-4">
            <h3 className="font-bold">Henüz giriş yapmadın.</h3>
            <p className="text-xs text-muted-foreground">TP kazanmak ve ödülleri almak için hemen hesap oluştur.</p>
            <Button asChild className="w-full font-bold shadow-sm"><Link href="/">Giriş Yap</Link></Button>
          </div>
        )}
      </div>

      {/* ÖDÜL MAĞAZASI */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black flex items-center gap-2">
          <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span></span>
          Mağaza (Çok Yakında)
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {rewards.map((reward, i) => {
            const progress = user ? Math.min((tpBalance / reward.cost) * 100, 100) : 0;
            const canAfford = progress === 100;

            return (
              <div key={i} className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm hover:border-primary/30 transition-all flex flex-col h-full">
                <div className="flex items-start justify-between mb-6">
                  <div className={`p-4 rounded-2xl ${reward.bg} border border-border/10`}>
                     <reward.icon className={`${reward.color} h-8 w-8`} />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Gereken</p>
                    <p className="font-black text-lg">{reward.cost.toLocaleString()} TP</p>
                  </div>
                </div>
                
                <h3 className="text-lg font-bold mb-auto leading-tight pr-4">{reward.title}</h3>
                
                {/* İlerleme Çubuğu */}
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase">
                    <span>İlerleme</span>
                    <span>%{Math.floor(progress)}</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  
                  <Button 
                    variant={canAfford ? "default" : "secondary"} 
                    className="w-full mt-4 font-bold h-10" 
                    disabled={!canAfford}
                  >
                    {canAfford ? <><CheckCircle2 size={16} className="mr-2"/> Talep Et</> : "Yetersiz TP"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}