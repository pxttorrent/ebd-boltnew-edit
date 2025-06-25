import { signInWithSupabase, signUpWithSupabase, signOutFromSupabase } from './supabaseService'

export const loginUser = async (apelido: string, senha: string) => {
  return await signInWithSupabase(apelido, senha)
}

export const registerUser = async (userData: any) => {
  return await signUpWithSupabase(userData)
}

export const logoutUser = async () => {
  await signOutFromSupabase()
}