import { createServerSideClient } from "@/lib/server-utils";
import { CreateMarketForm } from "@/components/admin/create-market";
import { Button } from "@/components/ui/button";
import { resolveMarketAction, cancelMarketAction, approvePendingMarketAction, deletePendingMarketAction } from "@/actions/admin-actions";
import { redirect } from "next/navigation";
import { AlertTriangle, CheckCircle2, TrendingUp, ShieldAlert, BadgeInfo, Bot, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

const ADMIN_EMAILS = ["ersozberk@gmail.com"]; 

export default async function AdminPage() {
  const supabase = await createServerSideClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !ADMIN_EMAILS.includes(user.email!)) {
    redirect("/"); 
  }

  // Hem aktifleri hem de taslakları aynı anda çekiyoruz
  const [ { data: markets }, { data: drafts } ] = await Promise.all([
    supabase
      .from("markets")
      .select("*, market_options(*)")
      .eq("status", "active")
      .order("created_at", { ascending: false }),
    supabase
      .from("markets")
      .select("*")
      .eq("status", "draft")
      .order("created_at", { ascending: false })
  ]);

  return (
    <div className="max-w-6xl mx-auto space-y-12 py-10 px-4 md:px-8">
      
      {/* YÖNETİM ÖZETİ (HEADER) */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border/50 pb-8">
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20">
            <ShieldAlert className="text-red-500 h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Kontrol Merkezi</h1>
            <p className="text-muted-foreground font-medium flex items-center gap-2 mt-1">
              <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span>
              Sistemdeki aktif {markets?.length || 0} piyasayı yönetiyorsun.
            </p>
          </div>
        </div>
        <Badge variant="outline" className="border-red-500/30 text-red-500 bg-red-500/5 px-4 py-1.5 font-black uppercase tracking-widest">
          Süper Admin Yetkisi Aktif
        </Badge>
      </div>

      <CreateMarketForm />

      {/* 🔥 GÜNCELLENEN: BEKLEYEN PİYASALAR ONAY BÖLÜMÜ (AI & Manuel) */}
      {drafts && drafts.length > 0 && (
        <div className="space-y-6 pt-6 animate-in fade-in duration-500">
          <div className="flex items-center justify-between border-b border-border/50 pb-4">
            <h2 className="text-2xl font-black flex items-center gap-2">
              <Bot className="text-primary" /> Onay Bekleyen Piyasalar
            </h2>
            <Badge className="bg-primary text-primary-foreground text-sm px-3 py-1">
              {drafts.length} Bekleyen
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 gap-5">
            {drafts.map((d) => (
              <div key={d.id} className="p-5 border-2 border-primary/30 rounded-[2rem] flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-primary/5 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                
                {/* Taslak Bilgisi */}
                <div className="flex-1 space-y-2 relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground border border-border/50">
                      {d.category}
                    </span>
                    <span className="text-[10px] font-black uppercase text-orange-600 bg-orange-500/10 px-2.5 py-1 rounded-md flex items-center gap-1">
                      <AlertTriangle size={12} /> BEKLİYOR
                    </span>
                  </div>
                  <p className="font-bold text-lg leading-tight pr-4">{d.question}</p>
                  {d.end_date && (
                    <p className="text-xs font-medium text-muted-foreground">Bitiş: {new Date(d.end_date).toLocaleString('tr-TR')}</p>
                  )}
                </div>

                {/* Taslak Aksiyonları (Onayla / Sil) */}
                <div className="flex items-center gap-3 shrink-0 relative z-10">
                  <form action={deletePendingMarketAction}>
                    <input type="hidden" name="marketId" value={d.id} />
                    <Button type="submit" size="sm" variant="ghost" className="text-red-500 hover:bg-red-500/10 hover:text-red-600 font-bold h-10 rounded-xl px-4">
                      <Trash2 size={16} className="mr-2" /> Sil
                    </Button>
                  </form>

                  <form action={approvePendingMarketAction}>
                    <input type="hidden" name="marketId" value={d.id} />
                    <Button type="submit" size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-black h-10 px-5 rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                      <CheckCircle2 size={16} className="mr-2" /> Yayına Al
                    </Button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AÇIK PİYASALAR LİSTESİ (MEVCUT YAPI) */}
      <div className="space-y-6 pt-6">
        <h2 className="text-2xl font-black flex items-center gap-2 border-b border-border/50 pb-4">
          <TrendingUp className="text-primary" /> İşlemdeki Piyasalar
        </h2>
        
        <div className="grid grid-cols-1 gap-5">
          {markets?.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-border/50 rounded-[2rem] text-muted-foreground bg-secondary/10">
              <BadgeInfo size={40} className="mb-3 opacity-20" />
              <p className="font-bold">Şu an aktif hiçbir piyasa bulunmuyor.</p>
            </div>
          )}
          
          {markets?.map((m) => (
            <div key={m.id} className="p-5 border-2 border-border/50 rounded-[2rem] flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-card shadow-sm hover:border-primary/30 transition-colors">
              
              {/* Piyasa Bilgisi */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md ${m.market_type === 'binary' ? 'bg-purple-500/10 text-purple-600' : 'bg-orange-500/10 text-orange-600'}`}>
                    {m.market_type === 'binary' ? 'EVET / HAYIR' : 'ÇOKLU SEÇENEK'}
                  </span>
                  <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-500/10 px-2.5 py-1 rounded-md">
                    {Number(m.total_volume_tp).toLocaleString()} TP Hacim
                  </span>
                </div>
                <p className="font-bold text-lg leading-tight pr-4">{m.question}</p>
                <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  Bitiş: {new Date(m.end_date).toLocaleString('tr-TR')}
                </p>
              </div>

              {/* SONUÇLANDIRMA VE İPTAL ALANI */}
              <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 bg-secondary/20 p-3 rounded-2xl border border-border/50">
                
                {m.market_type === 'binary' ? (
                  <div className="flex items-center gap-2 border-r border-border/50 pr-3">
                    <form action={resolveMarketAction}>
                        <input type="hidden" name="marketId" value={m.id} />
                        <input type="hidden" name="side" value="YES" />
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white font-black h-10 px-4 rounded-xl">
                          <CheckCircle2 size={16} className="mr-1.5"/> EVET
                        </Button>
                    </form>
                    <form action={resolveMarketAction}>
                        <input type="hidden" name="marketId" value={m.id} />
                        <input type="hidden" name="side" value="NO" />
                        <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white font-black h-10 px-4 rounded-xl">
                          <CheckCircle2 size={16} className="mr-1.5"/> HAYIR
                        </Button>
                    </form>
                  </div>
                ) : (
                  <form action={resolveMarketAction} className="flex items-center gap-2 border-r border-border/50 pr-3">
                     <input type="hidden" name="marketId" value={m.id} />
                     <select name="optionId" className="bg-background border-2 border-border/50 rounded-xl px-3 h-10 text-sm font-bold w-[200px] outline-none focus:border-primary" required>
                        <option value="">🏆 Kazananı Seç...</option>
                        {m.market_options.map((opt: any) => (
                          <option key={opt.id} value={opt.id}>{opt.name}</option>
                        ))}
                     </select>
                     <Button type="submit" size="sm" className="bg-green-600 hover:bg-green-700 text-white font-black h-10 px-4 rounded-xl">
                       ONAYLA
                     </Button>
                  </form>
                )}

                {/* DANGER ZONE (İptal) */}
                <form action={cancelMarketAction}>
                  <input type="hidden" name="marketId" value={m.id} />
                  <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-500/10 hover:text-red-600 font-bold h-10 rounded-xl px-3" title="Piyasayı İptal Et ve Paraları İade Et">
                    <AlertTriangle size={18} />
                  </Button>
                </form>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
