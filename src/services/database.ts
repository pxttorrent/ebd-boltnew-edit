
import { Usuario, Interessado } from '../types';
import { hashPassword } from '../utils/passwordUtils';
import {
  getUsuarios,
  addUsuario as addUsuarioToStorage,
  updateUsuario as updateUsuarioInStorage,
  deleteUsuario as deleteUsuarioFromStorage,
  getInteressados,
  addInteressado as addInteressadoToStorage,
  updateInteressado as updateInteressadoInStorage,
  deleteInteressado as deleteInteressadoFromStorage,
  getCurrentUser
} from './localStorage';

// Usuario operations
export const fetchUsuarios = async () => {
  return getUsuarios();
};

export const addUsuario = async (usuario: Omit<Usuario, 'id'>) => {
  // Hash password before storing
  const hashedPassword = await hashPassword(usuario.senha);
  
  const usuarioWithHashedPassword = {
    ...usuario,
    senha: hashedPassword
  };

  return addUsuarioToStorage(usuarioWithHashedPassword);
};

export const updateUsuario = async (id: string, updates: Partial<Usuario>) => {
  // Hash password if it's being updated
  if (updates.senha) {
    updates.senha = await hashPassword(updates.senha);
  }

  updateUsuarioInStorage(id, updates);
};

export const deleteUsuario = async (id: string) => {
  deleteUsuarioFromStorage(id);
};

// Interessado operations
export const fetchInteressados = async () => {
  return getInteressados();
};

export const addInteressado = async (interessado: Omit<Interessado, 'id'>) => {
  console.log('Tentando adicionar interessado:', interessado);
  
  // Verificar se há usuário logado
  const currentUser = getCurrentUser();
  if (!currentUser) {
    throw new Error('Usuário não autenticado');
  }

  console.log('Usuário atual:', currentUser.id);

  if (!currentUser.aprovado) {
    throw new Error('Usuário não aprovado para realizar esta operação');
  }

  if (!currentUser.permissoes?.pode_cadastrar) {
    throw new Error('Usuário não tem permissão para cadastrar interessados');
  }

  // Verificar se a igreja do interessado corresponde à igreja do usuário (exceto para admins)
  if (currentUser.tipo !== 'administrador' && interessado.igreja !== currentUser.igreja) {
    console.error('Igreja do interessado não corresponde à do usuário:', {
      interessadoIgreja: interessado.igreja,
      usuarioIgreja: currentUser.igreja
    });
    throw new Error('Você só pode cadastrar interessados da sua igreja');
  }

  // Garantir que todos os campos obrigatórios estão preenchidos
  const interessadoCompleto = {
    nome_completo: interessado.nome_completo,
    telefone: interessado.telefone || '',
    endereco: interessado.endereco || '',
    cidade: interessado.cidade,
    igreja: interessado.igreja,
    status: interessado.status || 'E',
    instrutor_biblico: interessado.instrutor_biblico || 'A definir',
    data_contato: interessado.data_contato || new Date().toISOString().split('T')[0],
    observacoes: interessado.observacoes || '',
    frequenta_cultos: interessado.frequenta_cultos || null,
    estudo_biblico: interessado.estudo_biblico || ''
  };

  console.log('Dados completos para inserção:', interessadoCompleto);

  const newInteressado = addInteressadoToStorage(interessadoCompleto);
  console.log('Interessado criado com sucesso:', newInteressado);
  return newInteressado;
};

export const updateInteressado = async (id: string, updates: Partial<Interessado>) => {
  // Se a cidade for alterada, também alterar a igreja
  const updateData = {
    ...updates,
    ...(updates.cidade && { igreja: updates.cidade })
  };

  updateInteressadoInStorage(id, updateData);
};

export const deleteInteressado = async (id: string) => {
  deleteInteressadoFromStorage(id);
};
