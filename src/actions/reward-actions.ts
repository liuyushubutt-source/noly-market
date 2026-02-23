"use server";

import { createServerSideClient } from "@/lib/server-utils";
import { revalidatePath } from "next/cache";

export async function claimQuestReward(questId: string, rewardAmount: number) {
  const supabase = await createServerSideClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Giriş yapmalısınız.");

  // 1. Görev daha önce alınmış mı kontrol et
  const { data: existing } = await supabase.from("user_quests").select("id").eq("user_id", user.id).eq("quest_id", questId).single();
  if (existing) throw new Error("Bu görevin ödülünü zaten aldınız.");

  // 2. GÖREV DOĞRULAMA (Kullanıcı gerçekten yaptı mı?)
  if (questId === "first_prediction") {
    const { count } = await supabase.from("predictions").select("*", { count: 'exact', head: true }).eq("user_id", user.id);
    if (!count || count === 0) throw new Error("Henüz hiçbir piyasaya tahmin yapmamışsınız.");
  } 
  else if (questId === "profile_complete") {
    const { data: profile } = await supabase.from("profiles").select("avatar_url, full_name").eq("id", user.id).single();
    if (!profile?.avatar_url || !profile?.full_name || profile.full_name.includes("Bilinmeyen")) {
      throw new Error("Profilinizi henüz düzenlememişsiniz.");
    }
  }
  else if (questId === "first_comment") {
    const { count } = await supabase.from("comments").select("*", { count: 'exact', head: true }).eq("user_id", user.id);
    if (!count || count === 0) throw new Error("Henüz tartışma panosunda hiç yorum yapmamışsınız.");
  }

  // 3. Görevi "Alındı" olarak işaretle
  const { error: insertError } = await supabase.from("user_quests").insert({ user_id: user.id, quest_id: questId });
  if (insertError) throw new Error("Görev kaydedilemedi.");

  // 4. Parayı (TP) cüzdana yatır
  await supabase.rpc('add_tp', { p_user_id: user.id, p_amount: rewardAmount });

  revalidatePath("/rewards");
  return { success: true };
}