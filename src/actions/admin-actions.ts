"use server";

import { createServerSideClient } from "@/lib/server-utils";
import { revalidatePath } from "next/cache";

// 1. Piyasayı Sonuçlandırır, Ödül Dağıtır ve BİLDİRİM Gönderir
export async function resolveMarketAction(formData: FormData) {
  const marketId = Number(formData.get("marketId"));
  const side = formData.get("side") as string | null; // Binary için (YES/NO)
  const optionId = formData.get("optionId"); // Çoklu piyasa için ID

  const supabase = await createServerSideClient();

  // 1. Adım: Senin mevcut SQL fonksiyonunu (Bakiye dağıtımı vs.) çalıştırıyoruz
  const { error } = await supabase.rpc('resolve_market', {
    p_market_id: marketId,
    p_winning_side: side || null,
    p_winning_option_id: optionId ? Number(optionId) : null
  });

  if (error) throw new Error(error.message);

  // 2. Adım: Piyasaya yatırım yapanları bul, "is_winner" durumunu güncelle ve BİLDİRİM at
  const { data: predictions } = await supabase.from("predictions").select("*").eq("market_id", marketId);
  const { data: market } = await supabase.from("markets").select("question").eq("id", marketId).single();
  const marketTitle = market?.question || "Bir piyasa";

  if (predictions && predictions.length > 0) {
    for (const pred of predictions) {
      // Tahmin doğru mu kontrol et
      const isWin = (side && pred.side === side) || (optionId && pred.option_id === Number(optionId));

      // UI'da (Profil/Portfolyo) yeşil/kırmızı yanması için is_winner'ı kaydet
      await supabase.from("predictions").update({ is_winner: isWin }).eq("id", pred.id);

      // Bildirim Gönder
      if (isWin) {
        await supabase.from("notifications").insert({
          user_id: pred.user_id,
          title: "Tahminin Kazandı! 🎉",
          message: `"${marketTitle}" sonuçlandı ve kazanan taraftasın! Ödülün cüzdanına eklendi.`,
          type: "reward"
        });
      } else {
        await supabase.from("notifications").insert({
          user_id: pred.user_id,
          title: "Tahminin Kaybetti 😔",
          message: `"${marketTitle}" sonuçlandı ancak tahminin tutmadı. Bir sonrakine!`,
          type: "system"
        });
      }
    }
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/profile");
  revalidatePath("/portfolio");
}

// 2. Piyasayı İptal Eder, TP'leri İade Eder ve BİLDİRİM Gönderir
export async function cancelMarketAction(formData: FormData) {
  const marketId = Number(formData.get("marketId"));
  
  const supabase = await createServerSideClient();

  // 1. Piyasayı İptal Et ve İadeleri Yap (Senin SQL fonksiyonun)
  const { error } = await supabase.rpc('cancel_market_and_refund', {
    p_market_id: marketId
  });

  if (error) throw new Error(error.message);

  // 2. İade alan kullanıcılara Bildirim at
  const { data: predictions } = await supabase.from("predictions").select("user_id").eq("market_id", marketId);
  const { data: market } = await supabase.from("markets").select("question").eq("id", marketId).single();
  
  if (predictions && predictions.length > 0) {
    // Aynı kullanıcıya birden fazla tahmin yaptıysa tek bildirim gitsin diye Set kullanıyoruz
    const uniqueUsers = Array.from(new Set(predictions.map(p => p.user_id)));
    
    for (const userId of uniqueUsers) {
      await supabase.from("notifications").insert({
        user_id: userId,
        title: "Piyasa İptal Edildi 🔄",
        message: `"${market?.question || 'Yatırım yaptığınız piyasa'}" iptal edildi ve yatırdığınız TP'ler cüzdanınıza iade edildi.`,
        type: "system"
      });
    }
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/profile");
  revalidatePath("/portfolio");
}