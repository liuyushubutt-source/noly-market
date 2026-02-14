"use server";

import { createServerSideClient } from "@/lib/server-utils";
import { revalidatePath } from "next/cache";

// 1. Piyasayı Sonuçlandırır ve Kazananlara Ödül Dağıtır
export async function resolveMarketAction(formData: FormData) {
  const marketId = formData.get("marketId");
  const side = formData.get("side"); // Binary için (YES/NO)
  const optionId = formData.get("optionId"); // Çoklu piyasa için ID

  const supabase = await createServerSideClient();

  const { error } = await supabase.rpc('resolve_market', {
    p_market_id: marketId,
    p_winning_side: side || null,
    p_winning_option_id: optionId ? Number(optionId) : null
  });

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/profile");
}

// 2. Piyasayı İptal Eder ve TP'leri İade Eder
export async function cancelMarketAction(formData: FormData) {
  const marketId = formData.get("marketId");
  
  const supabase = await createServerSideClient();

  const { error } = await supabase.rpc('cancel_market_and_refund', {
    p_market_id: marketId
  });

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/profile");
}