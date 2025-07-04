import { Usuario, Interessado, Igreja } from '../types';

const STORAGE_KEYS = {
  USUARIOS: 'escola_biblica_usuarios',
  INTERESSADOS: 'escola_biblica_interessados',
  IGREJAS: 'escola_biblica_igrejas',
  CURRENT_USER: 'escola_biblica_current_user'
};

// Dados iniciais do sistema
const INITIAL_DATA = {
  usuarios: [
    {
      id: '1',
      nome_completo: 'Administrador',
      apelido: 'admin',
      login_acesso: 'admin@escola-biblica.app',
      senha: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      email_pessoal: 'admin@exemplo.com',
      igreja: 'Matriz',
      tipo: 'administrador' as Usuario['tipo'],
      foto_perfil: null,
      aprovado: true,
      permissoes: {
        pode_cadastrar: true,
        pode_editar: true,
        pode_excluir: true,
        pode_exportar: true
      }
    }
  ] as Usuario[],
  interessados: [] as Interessado[],
  igrejas: [
    { id: '1', nome: 'Armour', ativa: true },
    { id: '2', nome: 'Dom Pedrito', ativa: true },
    { id: '3', nome: 'Quaraí', ativa: true },
    { id: '4', nome: 'Santana do Livramento', ativa: true },
    { id: '5', nome: 'Argeni', ativa: true },
    { id: '6', nome: 'Parque São José', ativa: true }
  ] as Igreja[]
};

// Initialize storage with default data if empty
export const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USUARIOS)) {
    localStorage.setItem(STORAGE_KEYS.USUARIOS, JSON.stringify(INITIAL_DATA.usuarios));
  }
  if (!localStorage.getItem(STORAGE_KEYS.INTERESSADOS)) {
    localStorage.setItem(STORAGE_KEYS.INTERESSADOS, JSON.stringify(INITIAL_DATA.interessados));
  }
  if (!localStorage.getItem(STORAGE_KEYS.IGREJAS)) {
    localStorage.setItem(STORAGE_KEYS.IGREJAS, JSON.stringify(INITIAL_DATA.igrejas));
  }
};

// Usuario operations
export const getUsuarios = (): Usuario[] => {
  const data = localStorage.getItem(STORAGE_KEYS.USUARIOS);
  return data ? JSON.parse(data) : [];
};

export const saveUsuarios = (usuarios: Usuario[]) => {
  localStorage.setItem(STORAGE_KEYS.USUARIOS, JSON.stringify(usuarios));
};

export const addUsuario = (usuario: Omit<Usuario, 'id'>): Usuario => {
  const usuarios = getUsuarios();
  const newUsuario: Usuario = {
    ...usuario,
    id: Date.now().toString()
  };
  usuarios.push(newUsuario);
  saveUsuarios(usuarios);
  return newUsuario;
};

export const updateUsuario = (id: string, updates: Partial<Usuario>) => {
  const usuarios = getUsuarios();
  const index = usuarios.findIndex(u => u.id === id);
  if (index !== -1) {
    usuarios[index] = { ...usuarios[index], ...updates };
    saveUsuarios(usuarios);
  }
};

export const deleteUsuario = (id: string) => {
  const usuarios = getUsuarios().filter(u => u.id !== id);
  saveUsuarios(usuarios);
};

export const findUsuarioByApelido = (apelido: string): Usuario | null => {
  const usuarios = getUsuarios();
  return usuarios.find(u => u.apelido === apelido) || null;
};

export const findUsuarioByEmail = (email: string): Usuario | null => {
  const usuarios = getUsuarios();
  return usuarios.find(user => user.email_pessoal === email) || null;
};

// Interessado operations
export const getInteressados = (): Interessado[] => {
  const data = localStorage.getItem(STORAGE_KEYS.INTERESSADOS);
  return data ? JSON.parse(data) : [];
};

export const saveInteressados = (interessados: Interessado[]) => {
  localStorage.setItem(STORAGE_KEYS.INTERESSADOS, JSON.stringify(interessados));
};

export const addInteressado = (interessado: Omit<Interessado, 'id'>): Interessado => {
  const interessados = getInteressados();
  const newInteressado: Interessado = {
    ...interessado,
    id: Date.now().toString()
  };
  interessados.push(newInteressado);
  saveInteressados(interessados);
  return newInteressado;
};

export const updateInteressado = (id: string, updates: Partial<Interessado>) => {
  const interessados = getInteressados();
  const index = interessados.findIndex(i => i.id === id);
  if (index !== -1) {
    interessados[index] = { ...interessados[index], ...updates };
    saveInteressados(interessados);
  }
};

export const deleteInteressado = (id: string) => {
  const interessados = getInteressados().filter(i => i.id !== id);
  saveInteressados(interessados);
};

// Igreja operations
export const getIgrejas = (): Igreja[] => {
  const data = localStorage.getItem(STORAGE_KEYS.IGREJAS);
  return data ? JSON.parse(data) : [];
};

export const saveIgrejas = (igrejas: Igreja[]) => {
  localStorage.setItem(STORAGE_KEYS.IGREJAS, JSON.stringify(igrejas));
};

export const addIgreja = (igreja: Omit<Igreja, 'id'>): Igreja => {
  const igrejas = getIgrejas();
  const newIgreja: Igreja = {
    ...igreja,
    id: Date.now().toString(),
    created_at: new Date().toISOString()
  };
  igrejas.push(newIgreja);
  saveIgrejas(igrejas);
  return newIgreja;
};

export const updateIgreja = (id: string, updates: Partial<Igreja>) => {
  const igrejas = getIgrejas();
  const index = igrejas.findIndex(i => i.id === id);
  if (index !== -1) {
    igrejas[index] = { 
      ...igrejas[index], 
      ...updates,
      updated_at: new Date().toISOString()
    };
    saveIgrejas(igrejas);
  }
};

export const deleteIgreja = (id: string) => {
  const igrejas = getIgrejas().filter(i => i.id !== id);
  saveIgrejas(igrejas);
};

export const getIgrejasAtivas = (): Igreja[] => {
  return getIgrejas().filter(igreja => igreja.ativa);
};

// Current user operations
export const getCurrentUser = (): Usuario | null => {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return data ? JSON.parse(data) : null;
};

export const setCurrentUser = (user: Usuario | null) => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};

export const clearStorage = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};