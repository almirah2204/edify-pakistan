import { supabase } from "./supabase"

export const login = async (email: string, password: string) => {
  return supabase.auth.signInWithPassword({ email, password })
}

export const logout = async () => {
  return supabase.auth.signOut()
}
