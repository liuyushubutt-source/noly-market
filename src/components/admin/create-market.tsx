"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function CreateMarketForm() {
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState("Siyaset");
  const [endDate, setEndDate] = useState("");
  const supabase = createClient();

  const createMarket = async () => {
    const slug = question.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    
    const { error } = await supabase.from("markets").insert({
      question,
      slug,
      category,
      end_date: new Date(endDate).toISOString(),
      market_type: 'binary', // Şimdilik hızlıca binary
      yes_probability: 0.5
    });

    if (error) toast.error(error.message);
    else {
      toast.success("Piyasa oluşturuldu!");
      setQuestion("");
    }
  };

  return (
    <div className="bg-card p-6 rounded-2xl border space-y-4 max-w-xl">
      <h2 className="text-xl font-black">Yeni Piyasa Oluştur</h2>
      <Input placeholder="Piyasa Sorusu?" value={question} onChange={(e) => setQuestion(e.target.value)} />
      <Input placeholder="Kategori" value={category} onChange={(e) => setCategory(e.target.value)} />
      <Input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      <Button onClick={createMarket} className="w-full font-bold">PİYASAYI AÇ</Button>
    </div>
  );
}