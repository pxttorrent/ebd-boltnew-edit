import { useState, useEffect, ReactNode } from 'react';
import { Usuario } from '../types';
import { AuthContext } from '@/contexts/AuthContext';
import { loginUser, registerUser, logoutUser } from '@/services/authService';
import { getCurrentUserFromSupabase } from '@/services/supabaseService';
import { supabase } from '@/lib/supabase';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const currentUser = await getCurrentUserFromSupabase();
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (session) {
        const currentUser = await getCurrentUserFromSupabase();
        setUser(currentUser);
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (apelido: string, senha: string) => {
    setLoading(true);
    const result = await loginUser(apelido, senha);
    
    if (result.user) {
      setUser(result.user);
    }
    
    setLoading(false);
    return { error: result.error };
  };

  const signUp = async (userData: any) => {
    setLoading(true);
    const result = await registerUser(userData);
    setLoading(false);
    return result;
  };

  const signOut = async () => {
    await logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      signIn,
      signUp,
      signOut,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};