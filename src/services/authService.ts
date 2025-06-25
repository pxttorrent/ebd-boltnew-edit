import { hashPassword, verifyPassword } from '@/utils/passwordUtils';
import {
  findUsuarioByApelido,
  addUsuario,
  setCurrentUser,
  clearStorage,
  initializeStorage
} from './localStorage';

// Initialize storage on import
initializeStorage();

export const loginUser = async (apelido: string, senha: string) => {
  try {
    console.log('Attempting to sign in with apelido:', apelido);
    
    const usuario = findUsuarioByApelido(apelido);

    console.log('User query result:', { usuario });

    if (!usuario) {
      return { error: 'Usuário não encontrado' };
    }

    if (!usuario.aprovado) {
      return { error: 'Sua conta ainda não foi aprovada pelo administrador' };
    }

    // Verify password using bcrypt
    const isPasswordValid = await verifyPassword(senha, usuario.senha);
    if (!isPasswordValid) {
      return { error: 'Senha incorreta' };
    }

    console.log('Password verified, setting current user...');

    // Set current user in localStorage
    setCurrentUser(usuario);

    console.log('Authentication successful');
    return { user: usuario };
  } catch (error: any) {
    console.error('Sign in error:', error);
    return { error: error.message || 'Erro desconhecido durante o login' };
  }
};

export const registerUser = async (userData: any) => {
  try {
    console.log('Starting signup process with data:', userData);
    
    // Validar dados obrigatórios
    if (!userData.nome_completo || !userData.apelido || !userData.senha || !userData.email_pessoal || !userData.igreja) {
      return { error: 'Todos os campos obrigatórios devem ser preenchidos' };
    }

    // Validar apelido (apenas letras, números e pontos)
    const apelidoRegex = /^[a-z0-9.]+$/;
    if (!apelidoRegex.test(userData.apelido)) {
      return { error: 'O apelido deve conter apenas letras minúsculas, números e pontos' };
    }

    // Validar e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email_pessoal)) {
      return { error: 'Por favor, insira um e-mail válido' };
    }

    // Hash the password before storing
    const hashedPassword = await hashPassword(userData.senha);
    
    // Verificar se o apelido já existe
    const existingUser = findUsuarioByApelido(userData.apelido);
    if (existingUser) {
      return { error: 'Este apelido já está em uso. Escolha outro.' };
    }

    // Create new user
    const newUser = addUsuario({
      nome_completo: userData.nome_completo,
      apelido: userData.apelido,
      login_acesso: userData.login_acesso,
      senha: hashedPassword,
      email_pessoal: userData.email_pessoal,
      igreja: userData.igreja,
      tipo: userData.tipo || 'missionario',
      foto_perfil: userData.foto_perfil || null,
      aprovado: false, // Sempre iniciar como não aprovado
      permissoes: {
        pode_cadastrar: false,
        pode_editar: false,
        pode_excluir: false,
        pode_exportar: false
      }
    });

    console.log('User created successfully:', newUser);
    console.log('Signup completed successfully');
    return {};
  } catch (error: any) {
    console.error('Signup error:', error);
    return { error: error.message || 'Erro inesperado durante o cadastro' };
  }
};

export const logoutUser = async () => {
  // Clear current user
  setCurrentUser(null);
  
  // Clear any auth-related localStorage items
  localStorage.removeItem('escola_biblica_usuario');
  
  // Force page reload to ensure clean state
  window.location.href = '/';
};