"use server";

import { createServerSideClient } from "@/lib/server-utils";
import { revalidatePath } from "next/cache";

export async function claimQuestReward(questId: string, rewardAmount: number) {
  try {
    const supabase = await createServerSideClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Giriş yapmalısınız." };

    // 1. ADIM: Zaten almış mı? (Kesin Kontrol)
    const { data: alreadyClaimed } = await supabase
      .from("user_quests")
      .select("id")
      .eq("user_id", user.id)
      .eq("quest_id", questId)
      .maybeSingle();

    if (alreadyClaimed) {
      return { error: "Bu ödülü zaten aldınız." };
    }

    // 2. ADIM: Tabloya kayıt at (Bu adım başarısız olursa para yatmayacak)
    const { error: insertError } = await supabase
      .from("user_quests")
      .insert({
        user_id: user.id,
        quest_id: questId,
        reward_tp: rewardAmount
      });

    // Eğer tabloya yazamazsa (Örn: Tablo yoksa veya bağlantı hatası varsa) işlemi durdur!
    if (insertError) {
      console.error("GÖREV KAYIT HATASI:", insertError.message);
      return { error: "Sistem şu an meşgul, lütfen az sonra tekrar deneyin." };
    }

    // 3. ADIM: Sadece kayıt başarılıysa parayı yatır
    const { error: rpcError } = await supabase.rpc('add_tp', {
      p_user_id: user.id,
      p_amount: Math.floor(rewardAmount) // Tam sayı olduğundan emin olalım
    });

    if (rpcError) {
      // Eğer para yatmazsa, yukarıda attığımız kaydı geri silmeliyiz (opsiyonel ama güvenli)
      await supabase.from("user_quests").delete().eq("user_id", user.id).eq("quest_id", questId);
      console.error("TP YATIRMA HATASI:", rpcError.message);
      return { error: "Bakiye güncellenirken bir hata oluştu." };
    }

    // 4. ADIM: Başarı bildirimi ve sayfa yenileme
    revalidatePath("/rewards");
    revalidatePath("/portfolio");
    
    return { success: true };

  } catch (err) {
    console.error("BEKLENMEYEN HATA:", err);
    return { error: "Sunucu bağlantısı koptu." };
  }
}