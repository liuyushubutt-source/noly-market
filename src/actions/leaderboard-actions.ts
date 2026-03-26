"use server";
import { createServerSideClient } from "@/lib/server-utils";

// 1. İlk 50 Lideri Getir
export async function getLeaderboard() {
  const supabase = await createServerSideClient();
  
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, tp_balance")
    .order("tp_balance", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Liderlik tablosu çekilirken hata:", error);
    return [];
  }
  return data;
}

// 2. YENİ: İlk 50'de Olmayan Kullanıcının Tam Sırasını Hesapla
export async function getCurrentUserRank(userId: string) {
  const supabase = await createServerSideClient();
  
  // Önce kullanıcının kendi bakiyesini al
  const { data: userProfile } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, tp_balance")
    .eq("id", userId)
    .single();
    
  if (!userProfile) return null;

  // Hızlı Matematik: Bu bakiyeden "daha yüksek" bakiyesi olan kaç kişi var?
  const { count, error } = await supabase
    .from("profiles")
    .select("*", { count: 'exact', head: true })
    .gt("tp_balance", userProfile.tp_balance);

  if (error) return null;

  // Sıralama = Kendisinden fazla puanı olanların sayısı + 1
  return {
    ...userProfile,
    rank: (count || 0) + 1
  };
}
