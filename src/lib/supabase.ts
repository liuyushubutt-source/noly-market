import { createBrowserClient } from '@supabase/ssr'

// İstemci tarafında (Client Component) kullanılacak client
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}