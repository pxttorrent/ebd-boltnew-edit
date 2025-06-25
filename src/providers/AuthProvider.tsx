import { useState, useEffect, ReactNode } from 'react';
import { Usuario } from '../types';
import { AuthContext } from '@/contexts/AuthContext';
import { loginUser, registerUser, logoutUser } from '@/services/authService';
import { getCurrentUser, setCurrentUser } from '@/services/localStorage';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing user in localStorage
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setLoading(false);
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