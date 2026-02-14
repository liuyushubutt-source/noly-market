"use server";

import { createServerSideClient } from "@/lib/server-utils";
import { revalidatePath } from "next/cache";

export async function getMarketComments(marketId: number) {
  const supabase = await createServerSideClient();
  
  const { data, error } = await supabase
    .from("comments")
    .select(`
      id, content, created_at,
      profiles ( full_name, avatar_url )
    `)
    .eq("market_id", marketId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data;
}

export async function addComment(marketId: number, content: string) {
  const supabase = await createServerSideClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Yorum yapmak için giriş yapmalısınız.");
  if (!content.trim()) throw new Error("Yorum boş olamaz.");

  const { error } = await supabase.from("comments").insert({
    market_id: marketId,
    user_id: user.id,
    content: content.trim()
  });

  if (error) throw new Error("Yorum gönderilemedi.");
  
  revalidatePath(`/market/[slug]`, 'page'); // Yorum eklenince sayfayı yenile
}