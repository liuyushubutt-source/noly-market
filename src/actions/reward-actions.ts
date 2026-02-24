"use server";

import { createServerSideClient } from "@/lib/server-utils";
import { revalidatePath } from "next/cache";

export async function claimQuestReward(questId: string, rewardAmount: number) {
  try {
    const supabase = await createServerSideClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Giriş yapmalısın." };

    // 1. Kullanıcı bu ödülü zaten almış mı kontrolü
    const { data: existing } = await supabase
      .from("user_quests")
      .select("*")
      .eq("user_id", user.id)
      .eq("quest_id", questId)
      .maybeSingle();

    if (existing) return { error: "Bu ödül zaten alınmış." };

    // 2. Ödülü user_quests tablosuna kaydet
    const { error: insertError } = await supabase.from("user_quests").insert({
      user_id: user.id,
      quest_id: questId,
      reward_tp: rewardAmount
    });

    if (insertError) {
        console.error("Ödül Kayıt Hatası:", insertError.message);
        return { error: "Ödül kaydedilemedi: " + insertError.message };
    }

    // 3. Cüzdana TP ekle (RPC fonksiyonun)
    // DİKKAT: p_amount veya p_amount_tp isimlendirmesine dikkat et!
    const { error: rpcError } = await supabase.rpc('add_tp', {
      p_user_id: user.id,
      p_amount: Number(rewardAmount)
    });

    if (rpcError) {
        console.error("TP Ekleme Hatası:", rpcError.message);
        return { error: "Bakiye eklenemedi." };
    }

    revalidatePath("/rewards");
    return { success: true };

  } catch (err: any) {
    console.error("Beklenmeyen Hata:", err);
    return { error: "Sunucu tarafında bir hata oluştu." };
  }
}