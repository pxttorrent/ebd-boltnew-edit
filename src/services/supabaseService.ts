import { supabase } from '@/lib/supabase';
import { Usuario, Interessado, Igreja } from '@/types';
import { hashPassword, verifyPassword } from '@/utils/passwordUtils';

// Auth functions
export const signInWithSupabase = async (apelido: string, senha: string) => {
  try {
    console.log('Attempting to sign in with apelido:', apelido);
    
    // First, get user by apelido
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select(`
        *,
        igreja:igrejas(*)
      `)
      .eq('apelido', apelido)
      .maybeSingle();

    if (userError || !userData) {
      console.error('User not found:', userError);
      return { error: 'Usuário não encontrado' };
    }

    if (!userData.aprovado) {
      return { error: 'Sua conta ainda não foi aprovada pelo administrador' };
    }

    // Verify password
    const isPasswordValid = await verifyPassword(senha, userData.senha);
    if (!isPasswordValid) {
      return { error: 'Senha incorreta' };
    }

    // Sign in with Supabase Auth using the user's ID
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: userData.login_acesso,
      password: userData.id // Use user ID as password for Supabase Auth
    });

    if (authError) {
      // If auth user doesn't exist, create it
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: userData.login_acesso,
        password: userData.id,
        options: {
          data: {
            user_id: userData.id,
            nome_completo: userData.nome_completo
          }
        }
      });

      if (signUpError) {
        console.error('Auth error:', signUpError);
        return { error: 'Erro de autenticação' };
      }
    }

    // Convert database user to app user format
    const user: Usuario = {
      id: userData.id,
      nome_completo: userData.nome_completo,
      apelido: userData.apelido,
      login_acesso: userData.login_acesso,
      senha: userData.senha,
      email_pessoal: userData.email_pessoal || '',
      igreja: userData.igreja?.nome || '',
      tipo: userData.tipo,
      foto_perfil: userData.foto_perfil,
      aprovado: userData.aprovado,
      permissoes: userData.permissoes,
      created_at: userData.created_at,
      updated_at: userData.updated_at
    };

    console.log('Authentication successful');
    return { user };
  } catch (error: any) {
    console.error('Sign in error:', error);
    return { error: error.message || 'Erro desconhecido durante o login' };
  }
};

export const signUpWithSupabase = async (userData: any) => {
  try {
    console.log('Starting signup process with data:', userData);
    
    // Validar dados obrigatórios
    if (!userData.nome_completo || !userData.apelido || !userData.senha || !userData.email_pessoal || !userData.igreja) {
      return { error: 'Todos os campos obrigatórios devem ser preenchidos' };
    }

    // Hash the password
    const hashedPassword = await hashPassword(userData.senha);
    
    // Get igreja ID
    const { data: igrejaData, error: igrejaError } = await supabase
      .from('igrejas')
      .select('id')
      .eq('nome', userData.igreja)
      .single();

    if (igrejaError || !igrejaData) {
      return { error: 'Igreja não encontrada' };
    }

    // Create user in database
    const { data: newUser, error: insertError } = await supabase
      .from('usuarios')
      .insert({
        nome_completo: userData.nome_completo,
        apelido: userData.apelido,
        login_acesso: userData.login_acesso,
        senha: hashedPassword,
        email_pessoal: userData.email_pessoal,
        igreja_id: igrejaData.id,
        tipo: userData.tipo || 'missionario',
        foto_perfil: userData.foto_perfil || null,
        aprovado: false,
        permissoes: {
          pode_cadastrar: false,
          pode_editar: false,
          pode_excluir: false,
          pode_exportar: false
        }
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      if (insertError.code === '23505') {
        if (insertError.message.includes('apelido')) {
          return { error: 'Este apelido já está em uso. Escolha outro.' };
        } else if (insertError.message.includes('login_acesso')) {
          return { error: 'Este email já está cadastrado.' };
        }
        return { error: 'Já existe um usuário com estes dados.' };
      }
      return { error: insertError.message || 'Erro ao criar usuário' };
    }

    console.log('User created successfully:', newUser);
    return {};
  } catch (error: any) {
    console.error('Signup error:', error);
    return { error: error.message || 'Erro inesperado durante o cadastro' };
  }
};

export const signOutFromSupabase = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Sign out error:', error);
  }
};

// Usuario functions
export const fetchUsuarios = async (): Promise<Usuario[]> => {
  const { data, error } = await supabase
    .from('usuarios')
    .select(`
      *,
      igreja:igrejas(nome)
    `)
    .order('nome_completo');

  if (error) {
    console.error('Error fetching usuarios:', error);
    throw new Error(error.message);
  }

  return data.map(user => ({
    id: user.id,
    nome_completo: user.nome_completo,
    apelido: user.apelido,
    login_acesso: user.login_acesso,
    senha: user.senha,
    email_pessoal: user.email_pessoal || '',
    igreja: user.igreja?.nome || '',
    tipo: user.tipo,
    foto_perfil: user.foto_perfil,
    aprovado: user.aprovado,
    permissoes: user.permissoes,
    created_at: user.created_at,
    updated_at: user.updated_at
  }));
};

export const addUsuario = async (usuario: Omit<Usuario, 'id'>): Promise<Usuario> => {
  // Hash password
  const hashedPassword = await hashPassword(usuario.senha);
  
  // Get igreja ID
  const { data: igrejaData, error: igrejaError } = await supabase
    .from('igrejas')
    .select('id')
    .eq('nome', usuario.igreja)
    .single();

  if (igrejaError || !igrejaData) {
    throw new Error('Igreja não encontrada');
  }

  const { data, error } = await supabase
    .from('usuarios')
    .insert({
      nome_completo: usuario.nome_completo,
      apelido: usuario.apelido,
      login_acesso: usuario.login_acesso,
      senha: hashedPassword,
      email_pessoal: usuario.email_pessoal,
      igreja_id: igrejaData.id,
      tipo: usuario.tipo,
      foto_perfil: usuario.foto_perfil,
      aprovado: usuario.aprovado,
      permissoes: usuario.permissoes
    })
    .select(`
      *,
      igreja:igrejas(nome)
    `)
    .single();

  if (error) {
    console.error('Error adding usuario:', error);
    throw new Error(error.message);
  }

  return {
    id: data.id,
    nome_completo: data.nome_completo,
    apelido: data.apelido,
    login_acesso: data.login_acesso,
    senha: data.senha,
    email_pessoal: data.email_pessoal || '',
    igreja: data.igreja?.nome || '',
    tipo: data.tipo,
    foto_perfil: data.foto_perfil,
    aprovado: data.aprovado,
    permissoes: data.permissoes,
    created_at: data.created_at,
    updated_at: data.updated_at
  };
};

export const updateUsuario = async (id: string, updates: Partial<Usuario>): Promise<void> => {
  const updateData: any = { ...updates };
  
  // Hash password if being updated
  if (updates.senha) {
    updateData.senha = await hashPassword(updates.senha);
  }

  // Get igreja ID if igreja is being updated
  if (updates.igreja) {
    const { data: igrejaData, error: igrejaError } = await supabase
      .from('igrejas')
      .select('id')
      .eq('nome', updates.igreja)
      .single();

    if (igrejaError || !igrejaData) {
      throw new Error('Igreja não encontrada');
    }
    
    updateData.igreja_id = igrejaData.id;
    delete updateData.igreja;
  }

  // Remove fields that don't exist in database
  delete updateData.id;
  delete updateData.created_at;
  delete updateData.updated_at;

  const { error } = await supabase
    .from('usuarios')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Error updating usuario:', error);
    throw new Error(error.message);
  }
};

export const deleteUsuario = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('usuarios')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting usuario:', error);
    throw new Error(error.message);
  }
};

// Interessado functions
export const fetchInteressados = async (): Promise<Interessado[]> => {
  const { data, error } = await supabase
    .from('interessados')
    .select(`
      *,
      igreja:igrejas(nome),
      instrutor:usuarios(nome_completo)
    `)
    .order('nome_completo');

  if (error) {
    console.error('Error fetching interessados:', error);
    throw new Error(error.message);
  }

  return data.map(interessado => ({
    id: interessado.id,
    nome_completo: interessado.nome_completo,
    telefone: interessado.telefone,
    endereco: interessado.endereco,
    cidade: interessado.igreja?.nome || '',
    igreja: interessado.igreja?.nome || '',
    status: interessado.status,
    instrutor_biblico: interessado.instrutor?.nome_completo || 'A definir',
    data_contato: interessado.data_contato,
    observacoes: interessado.observacoes,
    frequenta_cultos: interessado.frequenta_cultos,
    estudo_biblico: interessado.estudo_biblico,
    created_at: interessado.created_at,
    updated_at: interessado.updated_at
  }));
};

export const addInteressado = async (interessado: Omit<Interessado, 'id'>): Promise<Interessado> => {
  // Get igreja ID
  const { data: igrejaData, error: igrejaError } = await supabase
    .from('igrejas')
    .select('id')
    .eq('nome', interessado.igreja || interessado.cidade)
    .single();

  if (igrejaError || !igrejaData) {
    throw new Error('Igreja não encontrada');
  }

  // Get instrutor ID if specified
  let instrutorId = null;
  if (interessado.instrutor_biblico && interessado.instrutor_biblico !== 'A definir') {
    const { data: instrutorData } = await supabase
      .from('usuarios')
      .select('id')
      .eq('nome_completo', interessado.instrutor_biblico)
      .single();
    
    if (instrutorData) {
      instrutorId = instrutorData.id;
    }
  }

  const { data, error } = await supabase
    .from('interessados')
    .insert({
      nome_completo: interessado.nome_completo,
      telefone: interessado.telefone || '',
      endereco: interessado.endereco || '',
      igreja_id: igrejaData.id,
      status: interessado.status,
      instrutor_biblico_id: instrutorId,
      data_contato: interessado.data_contato,
      observacoes: interessado.observacoes || '',
      frequenta_cultos: interessado.frequenta_cultos,
      estudo_biblico: interessado.estudo_biblico || ''
    })
    .select(`
      *,
      igreja:igrejas(nome),
      instrutor:usuarios(nome_completo)
    `)
    .single();

  if (error) {
    console.error('Error adding interessado:', error);
    throw new Error(error.message);
  }

  return {
    id: data.id,
    nome_completo: data.nome_completo,
    telefone: data.telefone,
    endereco: data.endereco,
    cidade: data.igreja?.nome || '',
    igreja: data.igreja?.nome || '',
    status: data.status,
    instrutor_biblico: data.instrutor?.nome_completo || 'A definir',
    data_contato: data.data_contato,
    observacoes: data.observacoes,
    frequenta_cultos: data.frequenta_cultos,
    estudo_biblico: data.estudo_biblico,
    created_at: data.created_at,
    updated_at: data.updated_at
  };
};

export const updateInteressado = async (id: string, updates: Partial<Interessado>): Promise<void> => {
  const updateData: any = { ...updates };

  // Get igreja ID if igreja/cidade is being updated
  if (updates.igreja || updates.cidade) {
    const igrejaNome = updates.igreja || updates.cidade;
    const { data: igrejaData, error: igrejaError } = await supabase
      .from('igrejas')
      .select('id')
      .eq('nome', igrejaNome)
      .single();

    if (igrejaError || !igrejaData) {
      throw new Error('Igreja não encontrada');
    }
    
    updateData.igreja_id = igrejaData.id;
  }

  // Get instrutor ID if instrutor is being updated
  if (updates.instrutor_biblico) {
    if (updates.instrutor_biblico === 'A definir') {
      updateData.instrutor_biblico_id = null;
    } else {
      const { data: instrutorData } = await supabase
        .from('usuarios')
        .select('id')
        .eq('nome_completo', updates.instrutor_biblico)
        .single();
      
      if (instrutorData) {
        updateData.instrutor_biblico_id = instrutorData.id;
      }
    }
  }

  // Remove fields that don't exist in database
  delete updateData.id;
  delete updateData.cidade;
  delete updateData.igreja;
  delete updateData.instrutor_biblico;
  delete updateData.created_at;
  delete updateData.updated_at;

  const { error } = await supabase
    .from('interessados')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Error updating interessado:', error);
    throw new Error(error.message);
  }
};

export const deleteInteressado = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('interessados')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting interessado:', error);
    throw new Error(error.message);
  }
};

// Igreja functions
export const fetchIgrejas = async (): Promise<Igreja[]> => {
  const { data, error } = await supabase
    .from('igrejas')
    .select('*')
    .order('nome');

  if (error) {
    console.error('Error fetching igrejas:', error);
    throw new Error(error.message);
  }

  return data.map(igreja => ({
    id: igreja.id,
    nome: igreja.nome,
    ativa: igreja.ativa,
    created_at: igreja.created_at,
    updated_at: igreja.updated_at
  }));
};

export const addIgreja = async (igreja: Omit<Igreja, 'id'>): Promise<Igreja> => {
  const { data, error } = await supabase
    .from('igrejas')
    .insert({
      nome: igreja.nome,
      ativa: igreja.ativa
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding igreja:', error);
    throw new Error(error.message);
  }

  return {
    id: data.id,
    nome: data.nome,
    ativa: data.ativa,
    created_at: data.created_at,
    updated_at: data.updated_at
  };
};

export const updateIgreja = async (id: string, updates: Partial<Igreja>): Promise<void> => {
  const updateData = { ...updates };
  
  // Remove fields that don't exist in database
  delete updateData.id;
  delete updateData.created_at;
  delete updateData.updated_at;

  const { error } = await supabase
    .from('igrejas')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Error updating igreja:', error);
    throw new Error(error.message);
  }
};

export const deleteIgreja = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('igrejas')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting igreja:', error);
    throw new Error(error.message);
  }
};

// Get current user from Supabase
export const getCurrentUserFromSupabase = async (): Promise<Usuario | null> => {
  const { data: { user: authUser } } = await supabase.auth.getUser();
  
  if (!authUser) {
    return null;
  }

  const { data: userData, error } = await supabase
    .from('usuarios')
    .select(`
      *,
      igreja:igrejas(nome)
    `)
    .eq('id', authUser.user_metadata?.user_id || authUser.id)
    .single();

  if (error || !userData) {
    console.error('Error fetching current user:', error);
    return null;
  }

  return {
    id: userData.id,
    nome_completo: userData.nome_completo,
    apelido: userData.apelido,
    login_acesso: userData.login_acesso,
    senha: userData.senha,
    email_pessoal: userData.email_pessoal || '',
    igreja: userData.igreja?.nome || '',
    tipo: userData.tipo,
    foto_perfil: userData.foto_perfil,
    aprovado: userData.aprovado,
    permissoes: userData.permissoes,
    created_at: userData.created_at,
    updated_at: userData.updated_at
  };
};