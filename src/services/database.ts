
import { supabase } from '@/integrations/supabase/client';
import { Usuario, Interessado } from '../types';
import { hashPassword } from '../utils/passwordUtils';

// Usuario operations
export const fetchUsuarios = async () => {
  const { data, error } = await supabase
    .from('usuarios')
    .select(`
      *,
      usuario_permissoes(*)
    `)
    .order('nome_completo');

  if (error) throw error;

  // Transform data to match our Usuario type
  return data.map(usuario => ({
    ...usuario,
    permissoes: usuario.usuario_permissoes[0] || {
      pode_cadastrar: false,
      pode_editar: false,
      pode_excluir: false,
      pode_exportar: false
    }
  }));
};

export const addUsuario = async (usuario: Omit<Usuario, 'id'>) => {
  // Hash password before storing
  const hashedPassword = await hashPassword(usuario.senha);
  
  const { data, error } = await supabase
    .from('usuarios')
    .insert({
      nome_completo: usuario.nome_completo,
      apelido: usuario.apelido,
      login_acesso: usuario.login_acesso,
      senha: hashedPassword, // Store hashed password
      email_pessoal: usuario.email_pessoal,
      igreja: usuario.igreja,
      foto_perfil: usuario.foto_perfil,
      aprovado: usuario.aprovado
    })
    .select()
    .single();

  if (error) throw error;

  // Insert permissions
  await supabase
    .from('usuario_permissoes')
    .insert({
      usuario_id: data.id,
      pode_cadastrar: usuario.permissoes.pode_cadastrar,
      pode_editar: usuario.permissoes.pode_editar,
      pode_excluir: usuario.permissoes.pode_excluir,
      pode_exportar: usuario.permissoes.pode_exportar
    });

  return data;
};

export const updateUsuario = async (id: string, updates: Partial<Usuario>) => {
  // Hash password if it's being updated
  if (updates.senha) {
    updates.senha = await hashPassword(updates.senha);
  }

  // Update usuario table
  if (updates.nome_completo || updates.apelido || updates.login_acesso || 
      updates.senha || updates.email_pessoal !== undefined || updates.igreja || 
      updates.foto_perfil !== undefined || updates.aprovado !== undefined) {
    const { error } = await supabase
      .from('usuarios')
      .update({
        ...(updates.nome_completo && { nome_completo: updates.nome_completo }),
        ...(updates.apelido && { apelido: updates.apelido }),
        ...(updates.login_acesso && { login_acesso: updates.login_acesso }),
        ...(updates.senha && { senha: updates.senha }),
        ...(updates.email_pessoal !== undefined && { email_pessoal: updates.email_pessoal }),
        ...(updates.igreja && { igreja: updates.igreja }),
        ...(updates.foto_perfil !== undefined && { foto_perfil: updates.foto_perfil }),
        ...(updates.aprovado !== undefined && { aprovado: updates.aprovado })
      })
      .eq('id', id);

    if (error) throw error;
  }

  // Update permissions if provided
  if (updates.permissoes) {
    const { error } = await supabase
      .from('usuario_permissoes')
      .update({
        pode_cadastrar: updates.permissoes.pode_cadastrar,
        pode_editar: updates.permissoes.pode_editar,
        pode_excluir: updates.permissoes.pode_excluir,
        pode_exportar: updates.permissoes.pode_exportar
      })
      .eq('usuario_id', id);

    if (error) throw error;
  }
};

export const deleteUsuario = async (id: string) => {
  const { error } = await supabase
    .from('usuarios')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Interessado operations
export const fetchInteressados = async () => {
  const { data, error } = await supabase
    .from('interessados')
    .select('*')
    .order('nome_completo');

  if (error) throw error;
  return data;
};

export const addInteressado = async (interessado: Omit<Interessado, 'id'>) => {
  console.log('Tentando adicionar interessado:', interessado);
  
  // Verificar autenticação
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error('Usuário não autenticado:', authError);
    throw new Error('Usuário não autenticado');
  }

  console.log('Usuário autenticado:', user.id);

  // Verificar se o usuário atual tem permissão
  const { data: usuarioAtual, error: userError } = await supabase
    .from('usuarios')
    .select(`
      *,
      usuario_permissoes(*)
    `)
    .eq('id', user.id)
    .single();

  if (userError) {
    console.error('Erro ao buscar usuário atual:', userError);
    throw new Error('Erro ao verificar permissões do usuário');
  }

  if (!usuarioAtual?.aprovado) {
    throw new Error('Usuário não aprovado para realizar esta operação');
  }

  const permissoes = usuarioAtual.usuario_permissoes[0];
  if (!permissoes?.pode_cadastrar) {
    throw new Error('Usuário não tem permissão para cadastrar interessados');
  }

  // Verificar se a igreja do interessado corresponde à igreja do usuário
  if (interessado.igreja !== usuarioAtual.igreja) {
    console.error('Igreja do interessado não corresponde à do usuário:', {
      interessadoIgreja: interessado.igreja,
      usuarioIgreja: usuarioAtual.igreja
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

  const { data, error } = await supabase
    .from('interessados')
    .insert(interessadoCompleto)
    .select()
    .single();

  if (error) {
    console.error('Erro ao inserir interessado:', error);
    throw error;
  }

  console.log('Interessado criado com sucesso:', data);
  return data;
};

export const updateInteressado = async (id: string, updates: Partial<Interessado>) => {
  // Se a cidade for alterada, também alterar a igreja
  const updateData = {
    ...updates,
    ...(updates.cidade && { igreja: updates.cidade })
  };

  const { error } = await supabase
    .from('interessados')
    .update(updateData)
    .eq('id', id);

  if (error) throw error;
};

export const deleteInteressado = async (id: string) => {
  const { error } = await supabase
    .from('interessados')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
