
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { hashPassword, verifyPassword } from '@/utils/passwordUtils';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signIn: (apelido: string, senha: string) => Promise<{ error?: string }>;
  signUp: (userData: any) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (apelido: string, senha: string) => {
    try {
      setLoading(true);
      console.log('Attempting to sign in with apelido:', apelido);
      
      // First, find the user by apelido
      const { data: usuario, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('apelido', apelido)
        .maybeSingle();

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

      // Create a proper email format for Supabase Auth if login_acesso is not an email
      let emailForAuth = usuario.login_acesso;
      if (!emailForAuth.includes('@')) {
        emailForAuth = `${usuario.login_acesso}@escola-biblica-local.com`;
      }

      // Try to sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: emailForAuth,
        password: senha
      });

      if (authError) {
        console.log('Auth user does not exist, creating one...', authError.message);
        
        // If auth user doesn't exist, create one
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

        if (signUpError) {
          console.error('Sign up error:', signUpError);
          return { error: signUpError.message };
        }

        // If sign up was successful, try to sign in again
        if (signUpData.user) {
          const { error: secondSignInError } = await supabase.auth.signInWithPassword({
            email: emailForAuth,
            password: senha
          });
          
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
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (userData: any) => {
    try {
      setLoading(true);
      console.log('Starting signup process with data:', userData);
      
      // Hash the password before storing
      const hashedPassword = await hashPassword(userData.senha);
      
      // Create a proper email format for Supabase Auth if login_acesso is not an email
      let emailForAuth = userData.login_acesso;
      if (!emailForAuth.includes('@')) {
        emailForAuth = `${userData.login_acesso}@escola-biblica-local.com`;
      }
      
      // Insert into usuarios table directly (now allowed by RLS policy)
      const { data: usuario, error: insertError } = await supabase
        .from('usuarios')
        .insert({
          nome_completo: userData.nome_completo,
          apelido: userData.apelido,
          login_acesso: userData.login_acesso,
          senha: hashedPassword, // Store hashed password
          igreja: userData.igreja,
          foto_perfil: userData.foto_perfil,
          aprovado: false // Needs admin approval
        })
        .select()
        .single();

      if (insertError) {
        console.error('Insert error:', insertError);
        return { error: insertError.message };
      }

      console.log('User inserted successfully:', usuario);

      // Insert default permissions
      const { error: permissionsError } = await supabase
        .from('usuario_permissoes')
        .insert({
          usuario_id: usuario.id,
          pode_cadastrar: false,
          pode_editar: false,
          pode_excluir: false,
          pode_exportar: false
        });

      if (permissionsError) {
        console.error('Permissions error:', permissionsError);
        return { error: permissionsError.message };
      }

      console.log('Signup completed successfully');
      return {};
    } catch (error: any) {
      console.error('Signup error:', error);
      return { error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    // Clear local storage
    localStorage.removeItem('escola_biblica_usuario');
    
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    // Force page reload to ensure clean state
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      signIn,
      signUp,
      signOut,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
