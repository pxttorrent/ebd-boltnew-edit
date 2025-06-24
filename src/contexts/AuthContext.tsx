
import { createContext, useContext, ReactNode } from 'react';
import { Usuario } from '../types';

interface AuthContextType {
  user: Usuario | null;
  signIn: (apelido: string, senha: string) => Promise<{ error?: string }>;
  signUp: (userData: any) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
