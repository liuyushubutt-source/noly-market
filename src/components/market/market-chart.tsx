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
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

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
  
  const currentProb = isBinary ? Number(market.yes_probability) : 0;
  const binaryColor = currentProb >= 0.5 ? "#10b981" : "#ef4444"; // Yeşil veya Kırmızı

  // --- KUSURSUZ GRAFİK İŞLEME MOTORU ---
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const now = new Date();
    let cutoff = new Date(0); 

    if (range === "1H") cutoff = subHours(now, 1);
    else if (range === "1D") cutoff = subDays(now, 1);
    else if (range === "1W") cutoff = subWeeks(now, 1);

    // Filtrelenmiş veri
    let filteredData = data.filter((d) => isAfter(new Date(d.created_at), cutoff));

    // Eğer filtre sonucu veri kalmadıysa ama geçmişte veri varsa (Örn: Son 1 saatte işlem yok ama dün vardı)
    // O zaman en son bilinen oranı alıp grafiğe yatay bir çizgi çizmeliyiz.
    if (filteredData.length === 0 && data.length > 0) {
      filteredData = [data[data.length - 1]]; // Son veriyi al
    }

    if (isBinary) {
      // BINARY FORMATLAMA
      const result = filteredData.map((d) => ({
        timestamp: new Date(d.created_at).getTime(),
        dateStr: d.created_at,
        probability: Number(d.probability)
      }));

      // Eğer grafik çok kısaysa, mevcut anı (NOW) temsil eden bir nokta ekleyelim ki çizgi sağa dayansın
      if (result.length > 0) {
        result.push({
          timestamp: now.getTime(),
          dateStr: now.toISOString(),
          probability: result[result.length - 1].probability // Son oranı devam ettir
        });
      }
      return result;
    } else {
      // ÇOKLU SEÇENEK FORMATLAMA VE FILL-FORWARD
      const groupedMap = new Map();
      const lastKnownValues: Record<string, number> = {};

      // Önce seçeneklerin başlangıç değerlerini 0 (veya kendi probability'si) olarak ata
      options.forEach((opt: any) => { lastKnownValues[opt.name] = opt.probability || 0; });

      filteredData.forEach((item) => {
        const timeKey = new Date(item.created_at).setMilliseconds(0);
        
        if (!groupedMap.has(timeKey)) {
          // Yeni bir tarih noktası oluştururken, O ANKİ bilinen tüm değerleri kopyala
          groupedMap.set(timeKey, { 
            timestamp: timeKey, 
            dateStr: item.created_at,
            ...lastKnownValues 
          });
        }
        
        const entry = groupedMap.get(timeKey);
        if (item.option_name) {
          entry[item.option_name] = Number(item.probability);
          lastKnownValues[item.option_name] = Number(item.probability); // Güncel bilinen değeri yenile
        }
      });

      const sortedData = Array.from(groupedMap.values()).sort((a, b) => a.timestamp - b.timestamp);
      
      // Son anı ekle
      if (sortedData.length > 0) {
         sortedData.push({
            timestamp: now.getTime(),
            dateStr: now.toISOString(),
            ...lastKnownValues
         });
      }

      return sortedData;
    }
  }, [data, range, isBinary, currentProb, options]);

  // Eğer Veri Yoksa Şık Bir Loading/Empty State Göster
  if (chartData.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 bg-secondary/10 rounded-2xl border border-dashed border-border/50">
         <Activity size={32} className="mb-2" />
         <p className="text-sm font-bold">Grafik verisi bekleniyor...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col select-none relative">
      
      {/* ÜST PANEL: Oran ve Zaman Filtreleri */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6 px-1 sm:px-2 z-10">
        
        {/* SOL: Canlı Oran */}
        <div className="flex items-center gap-3">
          {isBinary ? (
            <div className="flex flex-col">
              <span className="text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">CANLI ORAN</span>
              <div className="flex items-center gap-2">
                <span className={`text-3xl sm:text-5xl font-black tracking-tighter transition-colors`} style={{ color: binaryColor }}>
                  %{Math.round(currentProb * 100)}
                </span>
                {currentProb >= 0.5 ? <TrendingUp size={24} className="text-green-500" /> : <TrendingDown size={24} className="text-red-500" />}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-x-3 gap-y-1.5 max-w-[200px] sm:max-w-none">
              {options.slice(0, 4).map((opt: any) => (
                <div key={opt.id} className="flex items-center gap-1.5 bg-background/50 px-2 py-1 rounded-md border border-border/50">
                  <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: opt.color || '#3b82f6' }} />
                  <span className="text-[10px] sm:text-xs font-bold text-muted-foreground max-w-[60px] sm:max-w-[100px] truncate">{opt.name}</span>
                  <span className="text-xs sm:text-sm font-black text-foreground">%{Math.round((opt.probability || 0) * 100)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SAĞ: Polymarket Tarzı Şık Zaman Seçici */}
        <div className="flex bg-secondary/40 p-1 rounded-xl gap-0.5 border border-border/50 shadow-inner w-full sm:w-auto">
          {RANGES.map((r) => (
            <Button 
              key={r.value} 
              variant="ghost"
              size="sm" 
              className={`flex-1 sm:flex-none h-8 px-2 sm:px-4 text-[10px] sm:text-xs font-black rounded-lg transition-all ${range === r.value ? 'bg-background shadow-md text-primary scale-[1.02]' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}
              onClick={() => setRange(r.value)}
            >
              {r.label}
            </Button>
          ))}
        </div>
      </div>

      {/* GRAFİK ALANI (Aşağı ve Sağa Yaslanmış) */}
      <div className="flex-1 w-full relative -mx-2 sm:-mx-4 -mb-2 sm:-mb-6">
        <ResponsiveContainer width="100%" height="100%">
          {isBinary ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorProb" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={binaryColor} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={binaryColor} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--border)" opacity={0.4} />
              
              <XAxis dataKey="timestamp" hide type="number" domain={['dataMin', 'dataMax']} />
              <YAxis domain={[0, 1]} hide />
              
              {/* Animasyonlu Custom Tooltip */}
              <Tooltip 
                content={<CustomTooltip />} 
                cursor={{ stroke: 'var(--muted-foreground)', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                isAnimationActive={true}
                animationDuration={200}
              />
              
              <Area 
                type="stepAfter" // Polymarket tarzı borsa keskinliği (monotone yerine)
                dataKey="probability" 
                stroke={binaryColor} 
                strokeWidth={3.5} 
                fillOpacity={1} 
                fill="url(#colorProb)" 
                isAnimationActive={true}
                animationDuration={800}
              />
            </AreaChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--border)" opacity={0.4} />
              <XAxis dataKey="timestamp" hide type="number" domain={['dataMin', 'dataMax']} />
              <YAxis domain={[0, 1]} hide />
              
              <Tooltip 
                content={<CustomTooltip options={options} />} 
                cursor={{ stroke: 'var(--muted-foreground)', strokeWidth: 1.5, strokeDasharray: '4 4' }} 
                isAnimationActive={true}
                animationDuration={200}
              />
              
              {options.map((opt: any) => (
                <Line 
                  key={opt.name} 
                  type="stepAfter" 
                  dataKey={opt.name} 
                  stroke={opt.color || '#3b82f6'} 
                  strokeWidth={3} 
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  isAnimationActive={true}
                  animationDuration={800}
                />
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ŞIK, BORSADAN ÇIKMA TOOLTIP
function CustomTooltip({ active, payload, options }: any) {
  if (active && payload && payload.length) {
    const dateStr = payload[0].payload.dateStr;
    
    // Değere göre büyükten küçüğe sırala (Çoklu seçenekler için)
    const sortedPayload = [...payload].sort((a, b) => b.value - a.value);
    
    return (
      <div className="bg-background/95 backdrop-blur-md border border-border/50 p-3 sm:p-4 rounded-xl shadow-2xl text-xs min-w-[160px] sm:min-w-[200px] z-50 animate-in fade-in zoom-in-95 duration-200">
        <p className="text-muted-foreground font-black text-[10px] sm:text-xs uppercase tracking-widest border-b border-border/50 pb-2 mb-2">
          {format(new Date(dateStr), "d MMM yyyy • HH:mm", { locale: tr })}
        </p>
        
        <div className="space-y-2">
          {sortedPayload.map((entry: any) => {
             const color = options ? options.find((o: any) => o.name === entry.name)?.color : entry.stroke;
             const isBinary = entry.name === 'probability';
             
             return (
              <div key={entry.name} className="flex justify-between items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: color || '#3b82f6' }} />
                  <span className="font-bold text-muted-foreground text-xs sm:text-sm">
                    {isBinary ? 'Evet' : entry.name}
                  </span>
                </div>
                <span className="font-black text-foreground text-sm">
                  %{Math.round(entry.value * 100)}
                </span>
              </div>
            );
          })}
          {/* Binary İse Altına HAYIR oranını da otomatik ekle */}
          {sortedPayload.length === 1 && sortedPayload[0].name === 'probability' && (
            <div className="flex justify-between items-center gap-6 opacity-60">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full shadow-sm bg-red-500" />
                <span className="font-bold text-muted-foreground text-xs sm:text-sm">Hayır</span>
              </div>
              <span className="font-black text-foreground text-sm">
                %{100 - Math.round(sortedPayload[0].value * 100)}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
}