"use client";

import { useState, useMemo } from "react";
import { 
  LineChart, Line, AreaChart, Area, 
  XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid 
} from "recharts";
import { format, subHours, subDays, subWeeks, isAfter } from "date-fns";
import { tr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown } from "lucide-react";

// Zaman Filtreleri
const RANGES = [
  { label: "1S", value: "1H" },
  { label: "1G", value: "1D" },
  { label: "1H", value: "1W" },
  { label: "TÜMÜ", value: "ALL" },
];

export function MarketChart({ data, market }: { data: any[]; market: any }) {
  const [range, setRange] = useState("ALL");

  const isBinary = market.market_type === 'binary';
  const options = market.market_options || [];
  
  // Binary Market için Güncel Oran ve Renk
  const currentProb = isBinary ? Number(market.yes_probability) : 0;
  const binaryColor = currentProb >= 0.5 ? "#10b981" : "#ef4444"; // Yeşil veya Kırmızı

  // --- GRAFİK VERİSİNİ İŞLEME MOTORU ---
  const chartData = useMemo(() => {
    if (!data) return [];

    const now = new Date();
    let cutoff = new Date(0); // Varsayılan: Başlangıçtan itibaren

    // 1. Zaman Aralığını Belirle
    if (range === "1H") cutoff = subHours(now, 1);
    else if (range === "1D") cutoff = subDays(now, 1);
    else if (range === "1W") cutoff = subWeeks(now, 1);

    // 2. Verileri Filtrele
    let filteredData = data.filter((d) => 
      isAfter(new Date(d.created_at), cutoff)
    );

    // 3. EĞER VERİ YOKSA VEYA AZSA (Düz Çizgi Sorunu Çözümü)
    // Hiç veri yoksa, grafiğin başı ve sonu için yapay bir "düz çizgi" verisi oluştur.
    if (filteredData.length === 0) {
      if (isBinary) {
        return [
          { date: cutoff.getTime(), probability: currentProb, originalDate: cutoff.toISOString() },
          { date: now.getTime(), probability: currentProb, originalDate: now.toISOString() }
        ];
      } else {
        // Çoklu seçenek için tüm opsiyonları düz çizgi yap
        const startPoint: any = { date: cutoff.getTime(), originalDate: cutoff.toISOString() };
        const endPoint: any = { date: now.getTime(), originalDate: now.toISOString() };
        
        options.forEach((opt: any) => {
          // Eğer option verisi yoksa 0 varsay veya options tablosundaki başlangıç oranını al
          startPoint[opt.name] = 0; 
          endPoint[opt.name] = 0;
        });
        return [startPoint, endPoint];
      }
    }

    // 4. VERİLERİ GRAFİK FORMATINA ÇEVİR
    if (isBinary) {
      // Binary (Tek Çizgi)
      return filteredData.map((d) => ({
        date: new Date(d.created_at).getTime(),
        probability: d.probability,
        originalDate: d.created_at
      }));
    } else {
      // Çoklu Seçenek (Pivot İşlemi: {tarih, GS: 0.5, FB: 0.3})
      // Tarihe göre grupla
      const groupedMap = new Map();

      filteredData.forEach((item) => {
        // Tarihi biraz yuvarla ki aynı saniyedeki işlemler gruplansın
        const timeKey = new Date(item.created_at).setMilliseconds(0);
        
        if (!groupedMap.has(timeKey)) {
          groupedMap.set(timeKey, { 
            date: timeKey, 
            originalDate: item.created_at 
          });
        }
        
        const entry = groupedMap.get(timeKey);
        // Hangi seçeneğe ait olduğunu bul
        const optionName = options.find((o: any) => o.id === item.option_id)?.name;
        if (optionName) {
          entry[optionName] = item.probability;
        }
      });

      // Boşlukları doldur (Bir önceki değeri taşı - Fill Forward)
      const sortedData = Array.from(groupedMap.values()).sort((a, b) => a.date - b.date);
      return sortedData;
    }
  }, [data, range, isBinary, currentProb, options]);


  return (
    <div className="w-full h-full flex flex-col select-none">
      
      {/* ÜST PANEL: Özet Bilgi ve Butonlar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 px-2">
        
        {/* SOL: Oran Göstergesi */}
        <div className="flex items-center gap-3">
          {isBinary ? (
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">GÜNCEL ORAN</span>
              <div className="flex items-center gap-2">
                <span className={`text-4xl font-black tracking-tighter`} style={{ color: binaryColor }}>
                  %{Math.round(currentProb * 100)}
                </span>
                {/* Trend İkonu */}
                {currentProb >= 0.5 ? <TrendingUp className="text-green-500" /> : <TrendingDown className="text-red-500" />}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {options.map((opt: any) => (
                <div key={opt.id} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: opt.color }} />
                  <span className="text-xs font-bold text-muted-foreground">{opt.name}</span>
                  <span className="text-sm font-black">%{Math.round((data?.findLast(d => d.option_id === opt.id)?.probability || 0) * 100)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SAĞ: Zaman Filtreleri */}
        <div className="flex bg-secondary/30 p-1 rounded-xl gap-1 border border-border/50">
          {RANGES.map((r) => (
            <Button 
              key={r.value} 
              variant={range === r.value ? "secondary" : "ghost"} 
              size="sm" 
              className={`h-7 px-3 text-[10px] font-black rounded-lg transition-all ${range === r.value ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setRange(r.value)}
            >
              {r.label}
            </Button>
          ))}
        </div>
      </div>

      {/* GRAFİK ALANI */}
      <div className="flex-1 min-h-[300px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          {isBinary ? (
            // BINARY (EVET/HAYIR) GRAFİĞİ
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorProb" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={binaryColor} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={binaryColor} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
              
              <XAxis 
                dataKey="date" 
                hide 
                type="number" 
                domain={['dataMin', 'dataMax']} 
              />
              <YAxis domain={[0, 1]} hide />
              
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--muted-foreground)', strokeWidth: 1, strokeDasharray: '4 4' }} />
              
              <Area 
                type="monotone" // Çizgiyi yumuşatır
                dataKey="probability" 
                stroke={binaryColor} 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorProb)" 
                animationDuration={1000}
              />
            </AreaChart>
          ) : (
            // ÇOKLU SEÇENEK GRAFİĞİ
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
              <XAxis dataKey="date" hide type="number" domain={['dataMin', 'dataMax']} />
              <YAxis domain={[0, 1]} hide />
              <Tooltip content={<CustomTooltip options={options} />} cursor={{ stroke: 'var(--muted-foreground)', strokeWidth: 1 }} />
              
              {options.map((opt: any) => (
                <Line 
                  key={opt.name} 
                  type="monotone" 
                  dataKey={opt.name} 
                  stroke={opt.color} 
                  strokeWidth={3} 
                  dot={false}
                  connectNulls // Veri boşluklarını birleştir
                  animationDuration={1000}
                />
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ÖZEL TOOLTIP BİLEŞENİ
function CustomTooltip({ active, payload, label, options }: any) {
  if (active && payload && payload.length) {
    const dateStr = payload[0].payload.originalDate;
    
    return (
      <div className="bg-background/90 backdrop-blur-xl border border-border/50 p-3 rounded-xl shadow-2xl text-xs min-w-[150px] z-50">
        <p className="text-muted-foreground font-medium border-b border-border/50 pb-2 mb-2">
          {format(new Date(dateStr), "d MMMM yyyy, HH:mm", { locale: tr })}
        </p>
        
        <div className="space-y-1">
          {payload.map((entry: any) => {
             // Çoklu seçenek için rengi bul
             const color = options 
               ? options.find((o: any) => o.name === entry.name)?.color 
               : entry.stroke;
             
             return (
              <div key={entry.name} className="flex justify-between items-center gap-6">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                  <span className="font-bold text-muted-foreground">
                    {entry.name === 'probability' ? 'Evet' : entry.name}
                  </span>
                </div>
                <span className="font-black text-foreground">
                  %{Math.round(entry.value * 100)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
}