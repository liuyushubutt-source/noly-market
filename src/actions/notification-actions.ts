"use server";

import { createServerSideClient } from "@/lib/server-utils";
import { revalidatePath } from "next/cache";

// 1. Kullanıcının Bildirimlerini Çeker
export async function getUserNotifications() {
  const supabase = await createServerSideClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { notifications: [], lastClaim: null };

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: profile } = await supabase
    .from("profiles")
    .select("last_hourly_claim")
    .eq("id", user.id)
    .single();

  return { 
    notifications: notifications || [], 
    lastClaim: profile?.last_hourly_claim || null 
  };
}

// 2. Bildirimleri Okundu İşaretler
export async function markNotificationsAsRead() {
  const supabase = await createServerSideClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id);
  revalidatePath("/");
}

// 3. Saatlik 100 TP Ödülünü Talep Etme
export async function claimHourlyReward() {
  const supabase = await createServerSideClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Giriş yapmalısınız.");

  const { data: profile } = await supabase.from("profiles").select("last_hourly_claim, tp_balance").eq("id", user.id).single();

  if (!profile) throw new Error("Profil bulunamadı.");

  const lastClaimTime = new Date(profile.last_hourly_claim).getTime();
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;

  // Güvenlik: Gerçekten 1 saat geçmiş mi?
  if (now - lastClaimTime < oneHour) {
    throw new Error("Henüz 1 saat dolmadı.");
  }

  // 100 TP Ekle ve Zamanı Güncelle
  const { error } = await supabase.from("profiles").update({
    tp_balance: profile.tp_balance + 100,
    last_hourly_claim: new Date().toISOString()
  }).eq("id", user.id);

  if (error) throw new Error("Ödül alınamadı.");

  // Bildirim Gönder
  await supabase.from("notifications").insert({
    user_id: user.id,
    title: "Saatlik Ödül Alındı 🎁",
    message: "Hesabınıza başarıyla 100 TP eklendi. Bir saat sonra tekrar gelin!",
    type: "reward"
  });

  revalidatePath("/"); // Tüm siteyi (Bakiyeyi vb.) yenile
  return { success: true };
}