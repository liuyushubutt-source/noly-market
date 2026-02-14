"use server";
import { createServerSideClient } from "@/lib/server-utils";

export async function getLeaderboard() {
  const supabase = await createServerSideClient();
  
  // Bakiyesi en yüksek olan ilk 50 kişiyi getir
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