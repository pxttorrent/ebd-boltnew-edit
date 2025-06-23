
import { supabase } from '@/integrations/supabase/client';
import { Usuario, Interessado } from '../types';

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
  const { data, error } = await supabase
    .from('usuarios')
    .insert({
      nome_completo: usuario.nome_completo,
      apelido: usuario.apelido,
      login_acesso: usuario.login_acesso,
      senha: usuario.senha,
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
  // Update usuario table
  if (updates.nome_completo || updates.apelido || updates.login_acesso || 
      updates.senha || updates.igreja || updates.foto_perfil !== undefined || 
      updates.aprovado !== undefined) {
    const { error } = await supabase
      .from('usuarios')
      .update({
        ...(updates.nome_completo && { nome_completo: updates.nome_completo }),
        ...(updates.apelido && { apelido: updates.apelido }),
        ...(updates.login_acesso && { login_acesso: updates.login_acesso }),
        ...(updates.senha && { senha: updates.senha }),
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
  const { data, error } = await supabase
    .from('interessados')
    .insert(interessado)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateInteressado = async (id: string, updates: Partial<Interessado>) => {
  const { error } = await supabase
    .from('interessados')
    .update(updates)
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
