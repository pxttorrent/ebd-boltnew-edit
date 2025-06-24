
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Usuario, Interessado } from '../types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';
import * as db from '../services/database';

interface AppContextType {
  // Usuario management
  usuarios: Usuario[];
  currentUser: Usuario | null;
  addUsuario: (usuario: Usuario) => Promise<void>;
  updateUsuario: (id: string, updates: Partial<Usuario>) => Promise<void>;
  deleteUsuario: (id: string) => Promise<void>;
  setCurrentUser: (user: Usuario | null) => void;

  // Interessado management
  interessados: Interessado[];
  addInteressado: (interessado: Interessado) => Promise<void>;
  updateInteressado: (id: string, updates: Partial<Interessado>) => Promise<void>;
  deleteInteressado: (id: string) => Promise<void>;

  // Loading states
  loading: boolean;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [interessados, setInteressados] = useState<Interessado[]>([]);
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load data when user is authenticated
  useEffect(() => {
    if (user) {
      loadData();
    } else {
      setUsuarios([]);
      setInteressados([]);
      setCurrentUser(null);
      setLoading(false);
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load usuarios and find current user
      const usuariosData = await db.fetchUsuarios();
      // Transform data to match our types with proper type assertions
      const typedUsuarios: Usuario[] = usuariosData.map(user => ({
        ...user,
        igreja: user.igreja as Usuario['igreja'],
        tipo: user.tipo as Usuario['tipo'],
        permissoes: user.permissoes
      }));
      setUsuarios(typedUsuarios);
      
      // Find current user by matching auth user metadata
      const currentUserData = typedUsuarios.find(u => 
        user?.user_metadata?.apelido === u.apelido ||
        user?.email === u.login_acesso
      );
      setCurrentUser(currentUserData || null);

      // Load interessados
      const interessadosData = await db.fetchInteressados();
      // Transform data to match our types with proper type assertions
      const typedInteressados: Interessado[] = interessadosData.map(interessado => ({
        ...interessado,
        status: interessado.status as Interessado['status']
      }));
      setInteressados(typedInteressados);

    } catch (error: any) {
      console.error('Error loading data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: error.message || "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await loadData();
  };

  // Usuario operations
  const addUsuario = async (usuario: Usuario) => {
    try {
      const newUsuario = await db.addUsuario(usuario);
      setUsuarios(prev => [...prev, { ...usuario, id: newUsuario.id }]);
      
      toast({
        title: "Sucesso!",
        description: "Usuário adicionado com sucesso."
      });
    } catch (error: any) {
      console.error('Error adding usuario:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar usuário",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateUsuario = async (id: string, updates: Partial<Usuario>) => {
    try {
      await db.updateUsuario(id, updates);
      
      setUsuarios(prev => 
        prev.map(usuario => 
          usuario.id === id ? { ...usuario, ...updates } : usuario
        )
      );

      // Update current user if it's the same user
      if (currentUser?.id === id) {
        setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
      }

      toast({
        title: "Sucesso!",
        description: "Usuário atualizado com sucesso."
      });
    } catch (error: any) {
      console.error('Error updating usuario:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar usuário",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteUsuario = async (id: string) => {
    try {
      await db.deleteUsuario(id);
      setUsuarios(prev => prev.filter(usuario => usuario.id !== id));
      
      toast({
        title: "Sucesso!",
        description: "Usuário excluído com sucesso."
      });
    } catch (error: any) {
      console.error('Error deleting usuario:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir usuário",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Interessado operations
  const addInteressado = async (interessado: Interessado) => {
    try {
      const newInteressado = await db.addInteressado(interessado);
      setInteressados(prev => [...prev, { ...interessado, id: newInteressado.id }]);
      
      toast({
        title: "Sucesso!",
        description: "Interessado adicionado com sucesso."
      });
    } catch (error: any) {
      console.error('Error adding interessado:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar interessado",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateInteressado = async (id: string, updates: Partial<Interessado>) => {
    try {
      await db.updateInteressado(id, updates);
      
      setInteressados(prev => 
        prev.map(interessado => 
          interessado.id === id ? { ...interessado, ...updates } : interessado
        )
      );

      toast({
        title: "Sucesso!",
        description: "Interessado atualizado com sucesso."
      });
    } catch (error: any) {
      console.error('Error updating interessado:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar interessado",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteInteressado = async (id: string) => {
    try {
      await db.deleteInteressado(id);
      setInteressados(prev => prev.filter(interessado => interessado.id !== id));
      
      toast({
        title: "Sucesso!",
        description: "Interessado excluído com sucesso."
      });
    } catch (error: any) {
      console.error('Error deleting interessado:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir interessado",
        variant: "destructive"
      });
      throw error;
    }
  };

  return (
    <AppContext.Provider value={{
      usuarios,
      currentUser,
      addUsuario,
      updateUsuario,
      deleteUsuario,
      setCurrentUser,
      interessados,
      addInteressado,
      updateInteressado,
      deleteInteressado,
      loading,
      refreshData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
