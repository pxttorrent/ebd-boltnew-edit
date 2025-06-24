import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Usuario, Interessado, Igreja } from '../types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';
import {
  getUsuarios,
  addUsuario as addUsuarioToStorage,
  updateUsuario as updateUsuarioInStorage,
  deleteUsuario as deleteUsuarioFromStorage,
  getInteressados,
  addInteressado as addInteressadoToStorage,
  updateInteressado as updateInteressadoInStorage,
  deleteInteressado as deleteInteressadoFromStorage,
  getIgrejas,
  addIgreja as addIgrejaToStorage,
  updateIgreja as updateIgrejaInStorage,
  deleteIgreja as deleteIgrejaFromStorage,
  getCurrentUser
} from '../services/localStorage';

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
  addInteressado: (interessado: Omit<Interessado, 'id'>) => Promise<void>;
  updateInteressado: (id: string, updates: Partial<Interessado>) => Promise<void>;
  deleteInteressado: (id: string) => Promise<void>;

  // Igreja management
  igrejas: Igreja[];
  addIgreja: (igreja: Omit<Igreja, 'id'>) => Promise<void>;
  updateIgreja: (id: string, updates: Partial<Igreja>) => Promise<void>;
  deleteIgreja: (id: string) => Promise<void>;

  // Loading states
  loading: boolean;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [interessados, setInteressados] = useState<Interessado[]>([]);
  const [igrejas, setIgrejas] = useState<Igreja[]>([]);
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
      setIgrejas([]);
      setCurrentUser(null);
      setLoading(false);
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load usuarios and find current user
      const usuariosData = getUsuarios();
      setUsuarios(usuariosData);
      
      // Find current user by matching auth user ID
      const currentUserData = usuariosData.find(u => u.id === user?.id);
      setCurrentUser(currentUserData || null);

      if (currentUserData) {
        console.log('Usuário atual encontrado:', currentUserData);
      } else {
        console.warn('Usuário atual não encontrado nos dados do localStorage');
      }

      // Load interessados
      const interessadosData = getInteressados();
      setInteressados(interessadosData);

      // Load igrejas
      const igrejasData = getIgrejas();
      setIgrejas(igrejasData);

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
      const newUsuario = addUsuarioToStorage(usuario);
      setUsuarios(prev => [...prev, newUsuario]);
      
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
      updateUsuarioInStorage(id, updates);
      
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
      deleteUsuarioFromStorage(id);
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
  const addInteressado = async (interessado: Omit<Interessado, 'id'>) => {
    try {
      console.log('Context: Adicionando interessado:', interessado);
      
      // Verificar se há usuário logado
      const currentUser = getCurrentUser();
      if (!currentUser) {
        throw new Error('Usuário não autenticado');
      }

      if (!currentUser.aprovado) {
        throw new Error('Usuário não aprovado para realizar esta operação');
      }

      if (!currentUser.permissoes?.pode_cadastrar) {
        throw new Error('Usuário não tem permissão para cadastrar interessados');
      }

      // Verificar se a igreja do interessado corresponde à igreja do usuário (exceto para admins)
      if (currentUser.tipo !== 'administrador' && interessado.igreja !== currentUser.igreja) {
        throw new Error('Você só pode cadastrar interessados da sua igreja');
      }

      const newInteressado = addInteressadoToStorage(interessado);
      console.log('Context: Interessado adicionado:', newInteressado);
      
      setInteressados(prev => [...prev, newInteressado]);
      
      toast({
        title: "Sucesso!",
        description: "Interessado adicionado com sucesso."
      });
    } catch (error: any) {
      console.error('Context: Error adding interessado:', error);
      // Re-throw the error so the component can handle it
      throw error;
    }
  };

  const updateInteressado = async (id: string, updates: Partial<Interessado>) => {
    try {
      updateInteressadoInStorage(id, updates);
      
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
      deleteInteressadoFromStorage(id);
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

  // Igreja operations
  const addIgreja = async (igreja: Omit<Igreja, 'id'>) => {
    try {
      const newIgreja = addIgrejaToStorage(igreja);
      setIgrejas(prev => [...prev, newIgreja]);
      
      toast({
        title: "Sucesso!",
        description: "Igreja adicionada com sucesso."
      });
    } catch (error: any) {
      console.error('Error adding igreja:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar igreja",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateIgreja = async (id: string, updates: Partial<Igreja>) => {
    try {
      updateIgrejaInStorage(id, updates);
      
      setIgrejas(prev => 
        prev.map(igreja => 
          igreja.id === id ? { ...igreja, ...updates } : igreja
        )
      );

      toast({
        title: "Sucesso!",
        description: "Igreja atualizada com sucesso."
      });
    } catch (error: any) {
      console.error('Error updating igreja:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar igreja",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteIgreja = async (id: string) => {
    try {
      // Verificar se há usuários ou interessados vinculados a esta igreja
      const igrejaNome = igrejas.find(i => i.id === id)?.nome;
      const usuariosVinculados = usuarios.filter(u => u.igreja === igrejaNome);
      const interessadosVinculados = interessados.filter(i => i.igreja === igrejaNome || i.cidade === igrejaNome);

      if (usuariosVinculados.length > 0 || interessadosVinculados.length > 0) {
        throw new Error(`Não é possível excluir a igreja "${igrejaNome}" pois há ${usuariosVinculados.length} usuário(s) e ${interessadosVinculados.length} interessado(s) vinculados a ela. Desative a igreja ao invés de excluí-la.`);
      }

      deleteIgrejaFromStorage(id);
      setIgrejas(prev => prev.filter(igreja => igreja.id !== id));
      
      toast({
        title: "Sucesso!",
        description: "Igreja excluída com sucesso."
      });
    } catch (error: any) {
      console.error('Error deleting igreja:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir igreja",
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
      igrejas,
      addIgreja,
      updateIgreja,
      deleteIgreja,
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