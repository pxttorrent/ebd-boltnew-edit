
import { supabase } from '@/integrations/supabase/client';
import { hashPassword, verifyPassword } from '@/utils/passwordUtils';

export const createEmailForAuth = (loginAccess: string): string => {
  if (!loginAccess.includes('@')) {
    return `${loginAccess}@escola-biblica-local.com`;
  }
  return loginAccess;
};

export const findUserByApelido = async (apelido: string) => {
  const { data: usuario, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('apelido', apelido)
    .maybeSingle();

  return { usuario, error };
};

export const createSupabaseAuthUser = async (emailForAuth: string, senha: string, usuario: any) => {
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: emailForAuth,
    password: senha,
    options: {
      data: {
        usuario_id: usuario.id,
        nome_completo: usuario.nome_completo,
        apelido: usuario.apelido
      },
      emailRedirectTo: window.location.origin
    }
  });

  return { signUpData, signUpError };
};

export const signInWithSupabase = async (emailForAuth: string, senha: string) => {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: emailForAuth,
    password: senha
  });

  return { authData, authError };
};

export const createUserPermissions = async (usuarioId: string) => {
  const { error } = await supabase
    .from('usuario_permissoes')
    .insert({
      usuario_id: usuarioId,
      pode_cadastrar: false,
      pode_editar: false,
      pode_excluir: false,
      pode_exportar: false
    });

  return { error };
};

export const cleanupAuthState = () => {
  localStorage.removeItem('escola_biblica_usuario');
  // Clear any Supabase auth keys
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
};
