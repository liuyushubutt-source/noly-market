import { Code, Terminal, Zap, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default function ApiDocsPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-[900px] animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-2 border border-primary/20 shadow-[0_0_30px_-5px_rgba(var(--primary),0.3)]">
          <Code className="text-primary h-12 w-12" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter">API & GELİŞTİRİCİLER</h1>
        <p className="text-muted-foreground font-medium text-lg max-w-2xl mx-auto">
          N'olcak Market'in gerçek zamanlı oranlarını ve piyasa verilerini kendi uygulamalarına entegre et.
        </p>
      </div>

      <div className="space-y-8">
        
        {/* API Durumu */}
        <div className="bg-card border border-border/50 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
             <span className="font-bold text-lg">API Durumu: Aktif</span>
          </div>
          <Badge variant="outline" className="text-xs font-black uppercase bg-secondary/50">v1.0.0</Badge>
        </div>

        {/* Uç Noktalar (Endpoints) */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black flex items-center gap-2">
            <Zap className="text-yellow-500" /> Uç Noktalar (Endpoints)
          </h2>

          <div className="bg-secondary/20 border border-border/50 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-border/50 bg-secondary/30 flex items-center gap-3">
              <Badge className="bg-blue-500 hover:bg-blue-600 font-bold uppercase tracking-widest text-[10px]">GET</Badge>
              <code className="text-sm font-bold font-mono text-foreground">/api/v1/markets</code>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground font-medium">Aktif piyasaların listesini ve anlık oranlarını döndürür.</p>
              
              <div className="bg-background rounded-xl p-4 border border-border/50 font-mono text-xs overflow-x-auto">
                <div className="text-muted-foreground mb-2">// Örnek Yanıt (Response)</div>
                <pre className="text-green-500/90 dark:text-green-400">
{`{
  "status": "success",
  "data": [
    {
      "id": 1042,
      "slug": "merkez-bankasi-faiz-karari",
      "question": "MB faiz artıracak mı?",
      "type": "binary",
      "probabilities": {
        "yes": 0.65,
        "no": 0.35
      },
      "volume_tp": 1450000
    }
  ]
}`}
                </pre>
              </div>
            </div>
          </div>
          
          <div className="bg-secondary/20 border border-border/50 rounded-2xl p-6 flex items-start gap-4">
             <div className="bg-primary/10 p-2 rounded-lg"><Terminal className="text-primary h-6 w-6" /></div>
             <div>
               <h3 className="font-bold mb-1">API Anahtarı (API Key)</h3>
               <p className="text-sm text-muted-foreground font-medium leading-relaxed">Şu an için API uç noktalarımız herkese açıktır (Public). Ancak rate-limit (istek sınırı) dakikada 60 istek olarak belirlenmiştir. Daha yüksek limitler için profil sayfanızdan API Key oluşturabilirsiniz.</p>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}