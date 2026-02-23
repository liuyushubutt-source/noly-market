"use server";

import { createServerSideClient } from "@/lib/server-utils";
import { revalidatePath } from "next/cache";

export async function getMarketComments(marketId: number) {
  const supabase = await createServerSideClient();
  
  // 1. Önce giriş yapmış kullanıcıyı alıyoruz (Kim beğendi kontrolü için)
  const { data: { user } } = await supabase.auth.getUser();
  
  // 2. Yorumları, profilleri ve o yoruma ait TÜM beğenileri çekiyoruz
  const { data, error } = await supabase
    .from("comments")
    .select(`
      id, content, created_at,
      profiles ( full_name, avatar_url ),
      comment_likes ( user_id )
    `)
    .eq("market_id", marketId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Yorumlar çekilirken hata:", error);
    return [];
  }

  // 3. Veriyi UI'ın beklediği formata çeviriyoruz (Map)
  const formattedComments = data.map((comment: any) => {
    const likes = comment.comment_likes || [];
    
    return {
      ...comment,
      likes_count: likes.length, // Toplam beğeni sayısı
      user_has_liked: user ? likes.some((like: any) => like.user_id === user.id) : false, // Bu kullanıcı beğenmiş mi?
      comment_likes: undefined // Gereksiz veri kalabalığı yapmamak için siliyoruz
    };
  });

  return formattedComments;
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

export async function toggleCommentLike(commentId: string) {
  const supabase = await createServerSideClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Beğenmek için giriş yapmalısınız.");

  // Kullanıcı bu yorumu daha önce beğenmiş mi kontrol et
  const { data: existingLike } = await supabase
    .from("comment_likes")
    .select("id")
    .eq("user_id", user.id)
    .eq("comment_id", commentId)
    .single();

  if (existingLike) {
    // Zaten beğenmişse -> Beğeniyi Kaldır (Unlike)
    const { error } = await supabase
      .from("comment_likes")
      .delete()
      .eq("id", existingLike.id);
      
    if (error) throw new Error("Beğeni kaldırılamadı.");
    return { liked: false };
  } else {
    // Beğenmemişse -> Yeni Beğeni Ekle (Like)
    const { error } = await supabase
      .from("comment_likes")
      .insert({ user_id: user.id, comment_id: commentId });
      
    if (error) throw new Error("Beğeni eklenemedi.");
    return { liked: true };
  }
}