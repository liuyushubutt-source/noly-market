"use server";

import { createServerSideClient } from "@/lib/server-utils";
import { revalidatePath } from "next/cache";

export async function resolveMarketAction(formData: FormData) {
  const marketId = Number(formData.get("marketId"));
  const side = formData.get("side") as string | null; 
  const optionId = formData.get("optionId"); 

  const supabase = await createServerSideClient();

  // 1. SQL Fonksiyonunu (Ödül Dağıtımını) Çalıştır
  const { error } = await supabase.rpc('resolve_market', {
    p_market_id: marketId,
    p_winning_side: side || null,
    p_winning_option_id: optionId ? Number(optionId) : null
  });

  if (error) throw new Error(error.message);

  // 2. Tahminleri bul, KAZANDI/KAYBETTİ durumunu kaydet ve Bildirim at
  const { data: predictions } = await supabase.from("predictions").select("*").eq("market_id", marketId);
  const { data: market } = await supabase.from("markets").select("question").eq("id", marketId).single();
  const marketTitle = market?.question || "Bir piyasa";

  if (predictions && predictions.length > 0) {
    for (const pred of predictions) {
      
      // KUSURSUZ EŞLEŞME KONTROLÜ (Büyük/Küçük harf duyarlılığını ortadan kaldırdık)
      let isWin = false;
      if (side && pred.side) {
        isWin = pred.side.toUpperCase() === side.toUpperCase();
      } else if (optionId && pred.option_id) {
        isWin = Number(pred.option_id) === Number(optionId);
      }

      // 🚨 UI için is_winner GÜNCELLEMESİ
      const { error: updateError } = await supabase.from("predictions").update({ is_winner: isWin }).eq("id", pred.id);
      
      // EĞER RLS (Güvenlik) ENGELLİYORSA TERMİNALDE GÖRECEĞİZ:
      if (updateError) {
        console.error(`❌ TAHMİN GÜNCELLENEMEDİ (ID: ${pred.id}):`, updateError.message);
      }

      // Bildirim Gönder
      if (isWin) {
        await supabase.from("notifications").insert({
          user_id: pred.user_id,
          title: "Tahminin Kazandı! 🎉",
          message: `"${marketTitle}" sonuçlandı ve kazanan taraftasın!`,
          type: "reward"
        });
      } else {
        await supabase.from("notifications").insert({
          user_id: pred.user_id,
          title: "Tahminin Kaybetti 😔",
          message: `"${marketTitle}" sonuçlandı ancak tahminin tutmadı.`,
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

export async function cancelMarketAction(formData: FormData) {
  const marketId = Number(formData.get("marketId"));
  const supabase = await createServerSideClient();

  const { error } = await supabase.rpc('cancel_market_and_refund', { p_market_id: marketId });
  if (error) throw new Error(error.message);

  const { data: predictions } = await supabase.from("predictions").select("user_id").eq("market_id", marketId);
  const { data: market } = await supabase.from("markets").select("question").eq("id", marketId).single();
  
  if (predictions && predictions.length > 0) {
    const uniqueUsers = Array.from(new Set(predictions.map(p => p.user_id)));
    for (const userId of uniqueUsers) {
      await supabase.from("notifications").insert({
        user_id: userId,
        title: "Piyasa İptal Edildi 🔄",
        message: `"${market?.question || 'Yatırım yaptığınız piyasa'}" iptal edildi ve TP'ler iade edildi.`,
        type: "system"
      });
    }
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/profile");
  revalidatePath("/portfolio");
}