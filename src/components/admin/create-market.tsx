"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, Settings2, CheckCircle2, List } from "lucide-react";
import { useRouter } from "next/navigation";

export function CreateMarketForm() {
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState("Siyaset");
  const [endDate, setEndDate] = useState("");
  const [marketType, setMarketType] = useState<"binary" | "multiple">("binary");
  
  // Çoklu Seçenekler için State
  const [options, setOptions] = useState([{ name: "", probability: 20 }, { name: "", probability: 20 }]);
  
  const supabase = createClient();
  const router = useRouter();

  const addOption = () => setOptions([...options, { name: "", probability: 10 }]);
  const removeOption = (index: number) => setOptions(options.filter((_, i) => i !== index));
  
  const updateOption = (index: number, field: string, value: string | number) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptions(newOptions);
  };

  const createMarket = async () => {
    if (!question || !endDate) return toast.error("Soru ve Bitiş Tarihi zorunludur!");
    setLoading(true);

    try {
      // Türkçe karakterleri ve boşlukları temizleyerek SEO uyumlu link (slug) üret
      let slug = question.toLowerCase()
        .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-').trim() + "-" + Math.floor(Math.random() * 1000);

      // 1. Piyasayı Ana Tabloya Ekle
      const { data: marketData, error: marketError } = await supabase.from("markets").insert({
        question,
        slug,
        category,
        end_date: new Date(endDate).toISOString(),
        market_type: marketType,
        yes_probability: marketType === 'binary' ? 0.5 : null,
        status: 'active'
      }).select().single();

      if (marketError) throw marketError;

      // 2. Eğer Çoklu Seçenekse, Alt Seçenekleri (Options) Ekle
      if (marketType === 'multiple' && marketData) {
        // Yüzdeleri 1.0 (0.20, 0.40 vb) formatına çevir
        const optionsToInsert = options.map(opt => ({
          market_id: marketData.id,
          name: opt.name,
          probability: Number(opt.probability) / 100,
          color: `#${Math.floor(Math.random()*16777215).toString(16)}` // Rastgele renk
        }));

        const { error: optionsError } = await supabase.from("market_options").insert(optionsToInsert);
        if (optionsError) throw optionsError;
      }

      toast.success("Piyasa başarıyla oluşturuldu ve işleme açıldı!");
      setQuestion("");
      setOptions([{ name: "", probability: 20 }, { name: "", probability: 20 }]);
      router.refresh(); // Sayfayı yenileyip listeye düşmesini sağla

    } catch (error: any) {
      toast.error("Hata: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card p-6 md:p-8 rounded-[2rem] border border-border/50 shadow-xl space-y-6">
      <div className="flex items-center gap-3 border-b border-border/50 pb-4">
        <div className="bg-primary/10 p-2 rounded-xl"><Settings2 className="text-primary h-6 w-6" /></div>
        <div>
          <h2 className="text-xl font-black tracking-tight">Yeni Piyasa Oluştur</h2>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Sisteme yeni tahmin ekle</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 md:col-span-2">
          <label className="text-[11px] font-black text-muted-foreground uppercase">Tahmin Sorusu</label>
          <Input placeholder="Örn: Galatasaray - Fenerbahçe maçını kim kazanır?" value={question} onChange={(e) => setQuestion(e.target.value)} className="h-12 font-bold text-lg bg-secondary/30" />
        </div>
        
        <div className="space-y-2">
          <label className="text-[11px] font-black text-muted-foreground uppercase">Kategori</label>
          <Input placeholder="Siyaset, Spor, Kripto..." value={category} onChange={(e) => setCategory(e.target.value)} className="h-12 bg-secondary/30 font-bold" />
        </div>
        
        <div className="space-y-2">
          <label className="text-[11px] font-black text-muted-foreground uppercase">Bitiş Tarihi</label>
          <Input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-12 bg-secondary/30 font-bold" />
        </div>
      </div>

      {/* PİYASA TİPİ SEÇİMİ */}
      <div className="space-y-3 pt-2 border-t border-border/50">
        <label className="text-[11px] font-black text-muted-foreground uppercase">Piyasa Tipi</label>
        <div className="flex gap-2">
          <Button type="button" variant={marketType === 'binary' ? 'default' : 'outline'} onClick={() => setMarketType('binary')} className="flex-1 h-12 font-black">
             <CheckCircle2 className="mr-2 h-5 w-5" /> Evet / Hayır (Binary)
          </Button>
          <Button type="button" variant={marketType === 'multiple' ? 'default' : 'outline'} onClick={() => setMarketType('multiple')} className="flex-1 h-12 font-black">
             <List className="mr-2 h-5 w-5" /> Çoklu Seçenek (Multiple)
          </Button>
        </div>
      </div>

      {/* ÇOKLU SEÇENEK GİRİŞ ALANI */}
      {marketType === 'multiple' && (
        <div className="bg-secondary/20 p-4 rounded-2xl border border-border/50 space-y-3">
          <label className="text-[11px] font-black text-muted-foreground uppercase">Seçenekler ve Başlangıç Oranları (%)</label>
          {options.map((opt, index) => (
            <div key={index} className="flex gap-2 animate-in fade-in slide-in-from-left-2">
              <Input placeholder={`Seçenek ${index + 1}`} value={opt.name} onChange={(e) => updateOption(index, 'name', e.target.value)} className="flex-1 bg-background" />
              <div className="relative w-24">
                <Input type="number" placeholder="Oran" value={opt.probability} onChange={(e) => updateOption(index, 'probability', e.target.value)} className="bg-background pr-6" />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">%</span>
              </div>
              <Button type="button" variant="destructive" size="icon" onClick={() => removeOption(index)} disabled={options.length <= 2}><Trash2 size={16}/></Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addOption} className="w-full border-dashed border-2 mt-2"><Plus size={16} className="mr-1"/> Yeni Seçenek Ekle</Button>
        </div>
      )}

      <Button onClick={createMarket} disabled={loading} className="w-full h-14 font-black text-lg shadow-lg shadow-primary/20">
        {loading ? <Loader2 className="animate-spin mr-2" /> : null} PİYASAYI CANLIYA AL 🚀
      </Button>
    </div>
  );
}