"use server";

import { createServerSideClient } from "@/lib/server-utils";
import { revalidatePath } from "next/cache";

// 1. Piyasayı Sonuçlandırır, Ödül Dağıtır ve BİLDİRİM Gönderir
export async function resolveMarketAction(formData: FormData) {
  const marketId = Number(formData.get("marketId"));
  const side = formData.get("side") as string | null; // Binary için (YES/NO)
  const optionId = formData.get("optionId"); // Çoklu piyasa için ID

  const supabase = await createServerSideClient();

  // 1. Adım: SQL fonksiyonunu (Bakiye dağıtımı vs.) 
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
      const isWin = (side && pred.side === side) || (optionId && pred.option_id === Number(optionId));

      await supabase.from("predictions").update({ is_winner: isWin }).eq("id", pred.id);

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

  const { error } = await supabase.rpc('cancel_market_and_refund', {
    p_market_id: marketId
  });

  if (error) throw new Error(error.message);

  const { data: predictions } = await supabase.from("predictions").select("user_id").eq("market_id", marketId);
  const { data: market } = await supabase.from("markets").select("question").eq("id", marketId).single();
  
  if (predictions && predictions.length > 0) {
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

// ---------------------------------------------------------
// 🔥 BEKLEYEN PİYASALAR İÇİN ONAY VE SİLME SİSTEMİ
// (Yapay Zeka Taslakları ve Elle Eklenen Piyasalar İçin Ortak)
// ---------------------------------------------------------

// 3. Bekleyen Piyasayı (Taslak/Manuel) Onaylar ve Canlıya Alır
// 3. Bekleyen Piyasayı (Taslak/Manuel) Onaylar, Canlıya Alır ve MAKE.COM'u Tetikler
export async function approvePendingMarketAction(formData: FormData) {
  const marketId = Number(formData.get("marketId"));
  const supabase = await createServerSideClient();

  // 1. Adım: Önce piyasanın statüsünü 'active' yap
  const { error } = await supabase
    .from("markets")
    .update({ status: "active" })
    .eq("id", marketId);

  if (error) throw new Error(error.message);

  // 2. Adım: Onaylanan piyasanın detaylarını çek (Make.com'a göndermek için)
  const { data: market } = await supabase
    .from("markets")
    .select("*")
    .eq("id", marketId)
    .single();

  // 3. Adım: Make.com Webhook'una veriyi gönder (Kurye)
  if (market) {
    try {
      
      const MAKE_WEBHOOK_URL = "";

      await fetch(MAKE_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event: "market_approved",
          marketId: market.id,
          question: market.question,
          category: market.category,
          endDate: market.end_date,
          url: `https://nolymarket.com/market/${market.id}` // Kullanıcıları yönlendirmek için link
        }),
      });
      console.log("Make.com'a veri başarıyla gönderildi!");
    } catch (err) {
      console.error("Make.com'a veri gönderilirken hata oluştu:", err);
      // Try-catch içine aldık ki, webhook çökse veya internet gitse bile 
      // admin panelin hata vermesin, piyasa başarıyla yayınlanmaya devam etsin.
    }
  }

  revalidatePath("/");
  revalidatePath("/admin");
}

// 4. Bekleyen Piyasayı (Taslak/Manuel) Çöpe Atar
export async function deletePendingMarketAction(formData: FormData) {
  const marketId = Number(formData.get("marketId"));
  const supabase = await createServerSideClient();

  // Opsiyonel Güvenlik: Sadece "draft" veya "pending" statüsündeki piyasaları sildirtmek isteyebilirsin.
  // Yanlışlıkla yayındaki (active) bir piyasayı silmeyi engeller.
  const { error } = await supabase
    .from("markets")
    .delete()
    .match({ id: marketId, status: "draft" }); // Statüsü taslak/bekliyor olanları siler

  if (error) throw new Error(error.message);

  revalidatePath("/admin");
}
