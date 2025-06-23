
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

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
      // First, find the user by apelido
      const { data: usuario, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('apelido', apelido)
        .single();

      if (userError || !usuario) {
        return { error: 'Usuário não encontrado' };
      }

      if (!usuario.aprovado) {
        return { error: 'Sua conta ainda não foi aprovada pelo administrador' };
      }

      // Check password (direct comparison for now - in production use proper hashing)
      if (senha !== usuario.senha) {
        return { error: 'Senha incorreta' };
      }

      // Create a custom session by setting the user ID
      const { data, error } = await supabase.auth.signInWithPassword({
        email: usuario.login_acesso,
        password: senha
      });

      if (error) {
        // If auth user doesn't exist, create one
        const { error: signUpError } = await supabase.auth.signUp({
          email: usuario.login_acesso,
          password: senha,
          options: {
            data: {
              usuario_id: usuario.id,
              nome_completo: usuario.nome_completo,
              apelido: usuario.apelido
            }
          }
        });

        if (!signUpError) {
          // Now sign in
          await supabase.auth.signInWithPassword({
            email: usuario.login_acesso,
            password: senha
          });
        }
      }

      return {};
    } catch (error: any) {
      return { error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (userData: any) => {
    try {
      setLoading(true);
      
      // Insert into usuarios table
      const { data: usuario, error: insertError } = await supabase
        .from('usuarios')
        .insert({
          nome_completo: userData.nome_completo,
          apelido: userData.apelido,
          login_acesso: userData.login_acesso,
          senha: userData.senha,
          igreja: userData.igreja,
          foto_perfil: userData.foto_perfil,
          aprovado: false // Needs admin approval
        })
        .select()
        .single();

      if (insertError) {
        return { error: insertError.message };
      }

      // Insert default permissions
      await supabase
        .from('usuario_permissoes')
        .insert({
          usuario_id: usuario.id,
          pode_cadastrar: false,
          pode_editar: false,
          pode_excluir: false,
          pode_exportar: false
        });

      return {};
    } catch (error: any) {
      return { error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
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
