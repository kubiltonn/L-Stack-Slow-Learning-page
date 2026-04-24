import { createServerSupabaseClient } from './supabase-server'

export async function adminKontrol() {
  const supabase = await createServerSupabaseClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { supabase, user: null, admin: false }
  }

  const { data: profil } = await supabase
    .from('profiller')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  return {
    supabase,
    user,
    admin: profil?.is_admin === true,
  }
}
