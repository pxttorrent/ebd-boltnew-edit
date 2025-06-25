import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Usuario, Interessado, Igreja } from '../types';
import { useToast } from '@/hooks/use-toast';
import {
  fetchUsuarios,
  addUsuario as addUsuarioToSupabase,
  updateUsuario as updateUsuarioInSupabase,
  deleteUsuario as deleteUsuarioFromSupabase,
  fetchInteressados,
  addInteressado as addInteressadoToSupabase,
  updateInteressado as updateInteressadoInSupabase,
  deleteInteressado as deleteInteressadoFromSupabase,
  fetchIgrejas,
  addIgreja as addIgrejaToSupabase,
  updateIgreja as updateIgrejaInSupabase,
  deleteIgreja as deleteIgrejaFromSupabase
} from '../services/supabaseService';

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

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load all data from Supabase
      const [usuariosData, interessadosData, igrejasData] = await Promise.all([
        fetchUsuarios(),
        fetchInteressados(),
        fetchIgrejas()
      ]);

      setUsuarios(usuariosData);
      setInteressados(interessadosData);
      setIgrejas(igrejasData);

      // Set first admin user as current user for system access
      const adminUser = usuariosData.find(u => u.tipo === 'administrador' && u.aprovado);
      if (adminUser) {
        setCurrentUser(adminUser);
        console.log('Sistema iniciado com usuário administrador:', adminUser.nome_completo);
      } else {
        console.warn('Nenhum usuário administrador encontrado');
      }

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
      const newUsuario = await addUsuarioToSupabase(usuario);
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
      await updateUsuarioInSupabase(id, updates);
      
      setUsuarios(prev => 
        prev.map(usuario => 
          usuario.id === id ? { ...usuario, ...updates } : usuario
        )
      );

      // Update current user if it's the same user
      if (currentUser?.id === id) {
        const updatedUser = { ...currentUser, ...updates };
        setCurrentUser(updatedUser);
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
      await deleteUsuarioFromSupabase(id);
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

      const newInteressado = await addInteressadoToSupabase(interessado);
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
      await updateInteressadoInSupabase(id, updates);
      
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
      await deleteInteressadoFromSupabase(id);
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
      const newIgreja = await addIgrejaToSupabase(igreja);
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
      await updateIgrejaInSupabase(id, updates);
      
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

      await deleteIgrejaFromSupabase(id);
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