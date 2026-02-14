"use server";

import { createServerSideClient } from "@/lib/server-utils";

export async function getMarkets({ 
  category, 
  q, 
  watchlist, 
  limit = 16, 
  offset = 0 
}: { 
  category?: string; 
  q?: string; 
  watchlist?: string; 
  limit?: number; 
  offset?: number 
} = {}) {
  const supabase = await createServerSideClient();
  
  let query = supabase.from("markets").select("*, market_options(*)").eq("status", "active");

  // EĞER "KAYDETTİKLERİM" SEÇİLİYSE:
  if (watchlist === "true") {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: bookmarks } = await supabase.from("bookmarks").select("market_id").eq("user_id", user.id);
      const bookmarkedIds = bookmarks?.map(b => b.market_id) || [];
      
      if (bookmarkedIds.length > 0) {
        query = query.in("id", bookmarkedIds);
      } else {
        return []; // Hiç kaydettiği piyasa yoksa boş liste döndür
      }
    } else {
      return []; // Giriş yapmamışsa boş liste döndür
    }
  }

  // Kategori Filtresi
  if (category && category !== "popular" && category !== "new") {
    query = query.ilike("category", `%${category}%`);
  }

  // Arama / Etiket Filtresi
  if (q) {
    query = query.ilike("question", `%${q}%`);
  }

  // Sıralama ve Çift Kayıt (Duplicate) Önleme Sistemi
  if (category === "popular") {
    query = query
      .order("total_volume_tp", { ascending: false })
      .order("id", { ascending: false }); // Hacim aynıysa ID'ye göre diz
  } else {
    query = query
      .order("created_at", { ascending: false })
      .order("id", { ascending: false }); // Tarih aynıysa ID'ye göre diz (HATA ÇÖZÜMÜ)
  }

  // Sayfalama (Pagination) Limitleri
  query = query.range(offset, offset + limit - 1);

  const { data, error } = await query;
  if (error) {
    console.error("Piyasalar çekilirken hata:", error);
    return [];
  }
  return data;
}

// PİYASA DETAYI ÇEKME (Market Detay Sayfası için)
export async function getMarketDetail(slug: string) {
  const supabase = await createServerSideClient();
  const { data, error } = await supabase
    .from("markets")
    .select("*, market_options(*)")
    .eq("slug", slug)
    .single();
  
  if (error) return null;
  return data;
}

// PİYASA FİYAT GEÇMİŞİNİ ÇEKME (Grafik için)
export async function getMarketPrices(marketId: number, marketType: string) {
  const supabase = await createServerSideClient();
  
  if (marketType === 'binary') {
    const { data } = await supabase
      .from("prices")
      .select("probability, created_at")
      .eq("market_id", marketId)
      .order("created_at", { ascending: true });
    return data || [];
  } else {
    const { data } = await supabase
      .from("prices")
      .select("option_id, probability, created_at, market_options(name, color)")
      .eq("market_id", marketId)
      .order("created_at", { ascending: true });
    return data || [];
  }
}