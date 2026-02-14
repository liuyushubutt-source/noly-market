"use server";

import { createClient } from "@/lib/supabase"; // Client değil, server tarafında redirect için gerekebilir ama şimdilik client yeterli

export async function handleGoogleLogin() {
  // Bu işlem client-side'da da yapılabilir, ancak yapısal olması için buraya not düşüyoruz.
  // Supabase Auth, OAuth işlemini genellikle doğrudan client'tan başlatmamızı ister.
}