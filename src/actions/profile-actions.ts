"use server";

import { createServerSideClient } from "@/lib/server-utils";
import { revalidatePath } from "next/cache";

// 1. Kullanıcı Profil Verisini Getir
export async function getUserProfileData() {
  const supabase = await createServerSideClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile;
}

// 2. Profili Güncelle (İsim ve Avatar)
export async function updateProfile(formData: FormData) {
  const supabase = await createServerSideClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Oturum bulunamadı.");

  const fullName = formData.get("fullName") as string;
  const avatarUrl = formData.get("avatarUrl") as string;

  if (!fullName || fullName.trim().length < 3) {
    throw new Error("İsim en az 3 karakter olmalıdır.");
  }

  // A. Veritabanındaki Profili Güncelle
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ 
      full_name: fullName.trim(), 
      avatar_url: avatarUrl 
    })
    .eq("id", user.id);

  if (profileError) throw new Error("Profil güncellenemedi.");

  // B. Auth Meta Verisini Güncelle (Navbar ve oturum için kritik)
  const { error: authError } = await supabase.auth.updateUser({
    data: { 
      full_name: fullName.trim(), 
      avatar_url: avatarUrl 
    }
  });

  if (authError) console.error("Auth update hatası:", authError);

  // C. Sayfaları Yenile (Değişiklik anında görünsün)
  revalidatePath("/profile");
  revalidatePath("/");
  
  return { success: true };
}
