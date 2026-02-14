import { createServerSideClient } from "@/lib/server-utils";
import { CreateMarketForm } from "@/components/admin/create-market";
import { Button } from "@/components/ui/button";
import { resolveMarketAction, cancelMarketAction } from "@/actions/admin-actions";
import { redirect } from "next/navigation";
import { AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

// Güvenlik: Sadece senin e-postana izin ver
const ADMIN_EMAILS = ["ersozberk@gmail.com"]; 

export default async function AdminPage() {
  const supabase = await createServerSideClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !ADMIN_EMAILS.includes(user.email!)) {
    redirect("/"); // Admin değilse kov
  }

  // Sadece aktif piyasaları seçenekleriyle birlikte çekiyoruz
  const { data: markets } = await supabase
    .from("markets")
    .select("*, market_options(*)")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-6xl mx-auto space-y-12 py-10 px-4">
      
      {/* Yönetim Özeti */}
      <div className="flex items-center gap-4 border-b border-border/50 pb-6">
        <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
          <TrendingUp className="text-primary h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight">Kontrol Merkezi</h1>
          <p className="text-muted-foreground font-medium">Sistemdeki aktif {markets?.length || 0} piyasayı yönetiyorsun.</p>
        </div>
      </div>

      <CreateMarketForm />

      <div className="space-y-6">
        <h2 className="text-2xl font-black flex items-center gap-2">
          <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span></span>
          Açık Piyasalar
        </h2>
        
        <div className="grid grid-cols-1 gap-4">
          {markets?.length === 0 && (
            <div className="p-10 text-center border border-dashed rounded-3xl text-muted-foreground font-medium">Aktif piyasa bulunmuyor.</div>
          )}
          
          {markets?.map((m) => (
            <div key={m.id} className="p-5 border border-border/50 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card shadow-sm hover:border-primary/30 transition-colors">
              
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase text-muted-foreground bg-secondary px-2 py-0.5 rounded">{m.market_type}</span>
                  <span className="text-[10px] font-black uppercase text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded">{Number(m.total_volume_tp).toLocaleString()} TP Hacim</span>
                </div>
                <p className="font-bold text-base leading-tight">{m.question}</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                {/* SONUÇLANDIRMA ALANI */}
                <div className="bg-secondary/30 p-2 rounded-xl border border-border/50 flex items-center gap-2">
                  {m.market_type === 'binary' ? (
                    <>
                      <form action={resolveMarketAction} className="flex">
                          <input type="hidden" name="marketId" value={m.id} />
                          <input type="hidden" name="side" value="YES" />
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 font-bold h-8"><CheckCircle2 size={14} className="mr-1"/> EVET KAZANDI</Button>
                      </form>
                      <form action={resolveMarketAction} className="flex">
                          <input type="hidden" name="marketId" value={m.id} />
                          <input type="hidden" name="side" value="NO" />
                          <Button size="sm" variant="destructive" className="font-bold h-8">HAYIR KAZANDI</Button>
                      </form>
                    </>
                  ) : (
                    <form action={resolveMarketAction} className="flex items-center gap-2">
                       <input type="hidden" name="marketId" value={m.id} />
                       <select name="optionId" className="bg-background border border-border rounded-lg px-3 py-1.5 text-xs font-bold w-[180px] outline-none" required>
                          <option value="">Kazanan Seçeneği Belirle</option>
                          {m.market_options.map((opt: any) => (
                            <option key={opt.id} value={opt.id}>{opt.name}</option>
                          ))}
                       </select>
                       <Button type="submit" size="sm" className="bg-green-600 hover:bg-green-700 font-bold h-8">BİTİR</Button>
                    </form>
                  )}
                </div>

                {/* İPTAL VE İADE (DANGER ZONE) */}
                <form action={cancelMarketAction}>
                  <input type="hidden" name="marketId" value={m.id} />
                  <Button size="sm" variant="outline" className="border-red-500/30 text-red-500 hover:bg-red-500/10 font-bold h-8">
                    <AlertTriangle size={14} className="mr-1"/> İptal Et & İade
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