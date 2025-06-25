import { signInWithSupabase, signUpWithSupabase, signOutFromSupabase } from './supabaseService';

export const loginUser = async (apelido: string, senha: string) => {
  return await signInWithSupabase(apelido, senha);
};

export const registerUser = async (userData: any) => {
  return await signUpWithSupabase(userData);
};

export const logoutUser = async () => {
  await signOutFromSupabase();
  
  // Clear any auth-related localStorage items
  localStorage.removeItem('escola_biblica_usuario');
  
  // Force page reload to ensure clean state
  window.location.href = '/';
};