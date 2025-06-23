import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Usuario, Interessado } from '../types';

interface AppContextType {
  currentUser: Usuario | null;
  setCurrentUser: (user: Usuario | null) => void;
  usuarios: Usuario[];
  setUsuarios: (usuarios: Usuario[]) => void;
  interessados: Interessado[];
  setInteressados: (interessados: Interessado[]) => void;
  addUsuario: (usuario: Usuario) => void;
  updateUsuario: (id: string, usuario: Partial<Usuario>) => void;
  deleteUsuario: (id: string) => void;
  addInteressado: (interessado: Interessado) => void;
  updateInteressado: (id: string, interessado: Partial<Interessado>) => void;
  deleteInteressado: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Dados mock para demonstração
const mockUsuarios: Usuario[] = [
  {
    id: 'admin',
    nome_completo: 'Administrador do Sistema',
    apelido: 'admin',
    login_acesso: 'admin',
    senha: 'admin',
    igreja: 'Armour',
    aprovado: true,
    permissoes: {
      pode_cadastrar: true,
      pode_editar: true,
      pode_excluir: true,
      pode_exportar: true
    }
  },
  {
    id: '1',
    nome_completo: 'João Silva',
    apelido: 'joao.silva',
    login_acesso: 'joao.silva@escola-biblica.app',
    senha: '123456',
    igreja: 'Armour',
    aprovado: true,
    permissoes: {
      pode_cadastrar: true,
      pode_editar: true,
      pode_excluir: true,
      pode_exportar: true
    }
  },
  {
    id: '2',
    nome_completo: 'Maria Costa',
    apelido: 'maria.costa',
    login_acesso: 'maria.costa@escola-biblica.app',
    senha: '123456',
    igreja: 'Dom Pedrito',
    aprovado: true,
    permissoes: {
      pode_cadastrar: true,
      pode_editar: true,
      pode_excluir: false,
      pode_exportar: true
    }
  }
];

const mockInteressados: Interessado[] = [
  {
    id: '1',
    nome_completo: 'Ana Santos',
    telefone: '(53) 99999-9999',
    endereco: 'Rua das Flores, 123',
    cidade: 'Santana do Livramento',
    status: 'D',
    instrutor_biblico: 'João Silva',
    data_contato: '2024-06-01',
    observacoes: 'Muito interessada nos estudos bíblicos',
    frequenta_cultos: true,
    estudo_biblico: 'Estudo sobre a Criação'
  },
  {
    id: '2',
    nome_completo: 'Pedro Oliveira',
    telefone: '(53) 88888-8888',
    endereco: 'Av. Principal, 456',
    cidade: 'Dom Pedrito',
    status: 'B',
    instrutor_biblico: 'Maria Costa',
    data_contato: '2024-05-15',
    observacoes: 'Decidido pelo batismo, aguardando resolver questões familiares',
    frequenta_cultos: false,
    estudo_biblico: 'Estudo sobre o Batismo'
  }
];

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>(mockUsuarios);
  const [interessados, setInteressados] = useState<Interessado[]>(mockInteressados);

  const addUsuario = (usuario: Usuario) => {
    setUsuarios(prev => [...prev, usuario]);
  };

  const updateUsuario = (id: string, updatedUsuario: Partial<Usuario>) => {
    setUsuarios(prev => 
      prev.map(usuario => 
        usuario.id === id ? { ...usuario, ...updatedUsuario } : usuario
      )
    );
  };

  const deleteUsuario = (id: string) => {
    setUsuarios(prev => prev.filter(usuario => usuario.id !== id));
  };

  const addInteressado = (interessado: Interessado) => {
    setInteressados(prev => [...prev, interessado]);
  };

  const updateInteressado = (id: string, updatedInteressado: Partial<Interessado>) => {
    setInteressados(prev => 
      prev.map(interessado => 
        interessado.id === id ? { ...interessado, ...updatedInteressado } : interessado
      )
    );
  };

  const deleteInteressado = (id: string) => {
    setInteressados(prev => prev.filter(interessado => interessado.id !== id));
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      setCurrentUser,
      usuarios,
      setUsuarios,
      interessados,
      setInteressados,
      addUsuario,
      updateUsuario,
      deleteUsuario,
      addInteressado,
      updateInteressado,
      deleteInteressado
    }}>
      {children}
    </AppContext.Provider>
  );
};
