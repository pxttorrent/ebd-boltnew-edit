
import { supabase } from '@/integrations/supabase/client';
import { hashPassword, verifyPassword } from '@/utils/passwordUtils';
import {
  createEmailForAuth,
  findUserByApelido,
  createSupabaseAuthUser,
  signInWithSupabase,
  createUserPermissions,
  cleanupAuthState
} from '@/utils/authUtils';

export const loginUser = async (apelido: string, senha: string) => {
  try {
    console.log('Attempting to sign in with apelido:', apelido);
    
    const { usuario, error: userError } = await findUserByApelido(apelido);

    console.log('User query result:', { usuario, userError });

    if (userError) {
      console.error('Database error:', userError);
      return { error: 'Erro ao conectar com o banco de dados' };
    }

    if (!usuario) {
      return { error: 'Usuário não encontrado' };
    }

    if (!usuario.aprovado) {
      return { error: 'Sua conta ainda não foi aprovada pelo administrador' };
    }

    // Verify password using bcrypt
    const isPasswordValid = await verifyPassword(senha, usuario.senha);
    if (!isPasswordValid) {
      return { error: 'Senha incorreta' };
    }

    console.log('Password verified, attempting Supabase auth...');

    const emailForAuth = createEmailForAuth(usuario.login_acesso);

    // Try to sign in with Supabase Auth
    const { authData, authError } = await signInWithSupabase(emailForAuth, senha);

    if (authError) {
      console.log('Auth user does not exist, creating one...', authError.message);
      
      // If auth user doesn't exist, create one
      const { signUpData, signUpError } = await createSupabaseAuthUser(emailForAuth, senha, usuario);

      if (signUpError) {
        console.error('Sign up error:', signUpError);
        return { error: signUpError.message };
      }

      // If sign up was successful, try to sign in again
      if (signUpData.user) {
        const { authError: secondSignInError } = await signInWithSupabase(emailForAuth, senha);
        
        if (secondSignInError) {
          console.error('Second sign in error:', secondSignInError);
          return { error: secondSignInError.message };
        }
      }
    }

    console.log('Authentication successful');
    return {};
  } catch (error: any) {
    console.error('Sign in error:', error);
    return { error: error.message || 'Erro desconhecido durante o login' };
  }
};

export const registerUser = async (userData: any) => {
  try {
    console.log('Starting signup process with data:', userData);
    
    // Validar dados obrigatórios
    if (!userData.nome_completo || !userData.apelido || !userData.senha || !userData.igreja) {
      return { error: 'Todos os campos obrigatórios devem ser preenchidos' };
    }

    // Validar apelido (apenas letras, números e pontos)
    const apelidoRegex = /^[a-z0-9.]+$/;
    if (!apelidoRegex.test(userData.apelido)) {
      return { error: 'O apelido deve conter apenas letras minúsculas, números e pontos' };
    }

    // Hash the password before storing
    const hashedPassword = await hashPassword(userData.senha);
    
    const emailForAuth = createEmailForAuth(userData.login_acesso);
    
    // Verificar se o apelido já existe
    const { data: existingUser } = await supabase
      .from('usuarios')
      .select('apelido')
      .eq('apelido', userData.apelido)
      .maybeSingle();

    if (existingUser) {
      return { error: 'Este apelido já está em uso. Escolha outro.' };
    }

    // Insert into usuarios table directly
    const { data: usuario, error: insertError } = await supabase
      .from('usuarios')
      .insert({
        nome_completo: userData.nome_completo,
        apelido: userData.apelido,
        login_acesso: userData.login_acesso,
        senha: hashedPassword,
        igreja: userData.igreja,
        foto_perfil: userData.foto_perfil || null,
        aprovado: false // Sempre iniciar como não aprovado
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      
      // Tratar erros específicos
      if (insertError.code === '23505') { // Unique violation
        if (insertError.message.includes('apelido')) {
          return { error: 'Este apelido já está em uso. Escolha outro.' };
        } else if (insertError.message.includes('login_acesso')) {
          return { error: 'Este email já está cadastrado.' };
        }
        return { error: 'Já existe um usuário com estes dados.' };
      }
      
      return { error: insertError.message };
    }

    console.log('User inserted successfully:', usuario);

    // Insert default permissions
    const { error: permissionsError } = await createUserPermissions(usuario.id);

    if (permissionsError) {
      console.error('Permissions error:', permissionsError);
      // Não falhar o cadastro se as permissões não foram criadas
      console.warn('User created but permissions not set. Admin can set them later.');
    }

    console.log('Signup completed successfully');
    return {};
  } catch (error: any) {
    console.error('Signup error:', error);
    return { error: error.message || 'Erro inesperado durante o cadastro' };
  }
};

export const logoutUser = async () => {
  // Clear local storage
  cleanupAuthState();
  
  // Sign out from Supabase
  await supabase.auth.signOut();
  
  // Force page reload to ensure clean state
  window.location.href = '/';
};
