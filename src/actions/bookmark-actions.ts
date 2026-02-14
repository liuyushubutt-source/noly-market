"use server";

import { createServerSideClient } from "@/lib/server-utils";
import { revalidatePath } from "next/cache";

export async function toggleBookmark(marketId: number) {
  const supabase = await createServerSideClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Giriş yapmalısınız");

  // Önce bu piyasa zaten kaydedilmiş mi diye bakıyoruz
  const { data: existing } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", user.id)
    .eq("market_id", marketId)
    .single();

  if (existing) {
    // Varsa sil (Favorilerden çıkar)
    await supabase.from("bookmarks").delete().eq("id", existing.id);
  } else {
    // Yoksa ekle (Favorilere al)
    await supabase.from("bookmarks").insert({ user_id: user.id, market_id: marketId });
  }

  // Arayüzü güncelle
  revalidatePath("/");
  return !existing; // True dönerse eklendi, False dönerse çıkarıldı demek
}

// Kullanıcının kaydettiği tüm market ID'lerini çeker (Kartlardaki yıldızların dolu/boş olması için)
export async function getUserBookmarks() {
  const supabase = await createServerSideClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("bookmarks")
    .select("market_id")
    .eq("user_id", user.id);

  return data?.map(b => b.market_id) || [];
}