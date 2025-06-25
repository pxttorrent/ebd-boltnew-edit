import { supabase } from '@/lib/supabase'
import { Usuario, Interessado, Igreja } from '@/types'
import { hashPassword, verifyPassword } from '@/utils/passwordUtils'

// Auth functions
export const signInWithSupabase = async (apelido: string, senha: string) => {
  try {
    console.log('Attempting to sign in with apelido:', apelido)
    
    // First, get the user by apelido
    const { data: usuario, error: userError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('apelido', apelido)
      .maybeSingle() // Use maybeSingle() instead of single() to handle no results gracefully

    if (userError) {
      console.error('Database error:', userError)
      return { error: 'Erro ao consultar o banco de dados' }
    }

    if (!usuario) {
      console.log('User not found for apelido:', apelido)
      return { error: 'Usuário não encontrado' }
    }

    if (!usuario.aprovado) {
      return { error: 'Sua conta ainda não foi aprovada pelo administrador' }
    }

    // Verify password
    const isPasswordValid = await verifyPassword(senha, usuario.senha)
    if (!isPasswordValid) {
      return { error: 'Senha incorreta' }
    }

    // Get igreja name
    let igrejaNome = 'Sem igreja'
    if (usuario.igreja_id) {
      const { data: igreja } = await supabase
        .from('igrejas')
        .select('nome')
        .eq('id', usuario.igreja_id)
        .maybeSingle()
      
      if (igreja) {
        igrejaNome = igreja.nome
      }
    }

    // Convert to local Usuario type
    const localUser: Usuario = {
      id: usuario.id,
      nome_completo: usuario.nome_completo,
      apelido: usuario.apelido,
      login_acesso: usuario.login_acesso,
      senha: usuario.senha,
      email_pessoal: usuario.email_pessoal || '',
      igreja: igrejaNome,
      tipo: usuario.tipo,
      foto_perfil: usuario.foto_perfil || '',
      aprovado: usuario.aprovado,
      permissoes: usuario.permissoes,
      created_at: usuario.created_at,
      updated_at: usuario.updated_at
    }

    // Store in localStorage for compatibility
    localStorage.setItem('escola_biblica_current_user', JSON.stringify(localUser))

    console.log('Authentication successful')
    return { user: localUser }
  } catch (error: any) {
    console.error('Sign in error:', error)
    return { error: error.message || 'Erro desconhecido durante o login' }
  }
}

export const signUpWithSupabase = async (userData: any) => {
  try {
    console.log('Starting signup process with data:', userData)
    
    // Validar dados obrigatórios
    if (!userData.nome_completo || !userData.apelido || !userData.senha || !userData.email_pessoal || !userData.igreja) {
      return { error: 'Todos os campos obrigatórios devem ser preenchidos' }
    }

    // Validar apelido (apenas letras, números e pontos)
    const apelidoRegex = /^[a-z0-9.]+$/
    if (!apelidoRegex.test(userData.apelido)) {
      return { error: 'O apelido deve conter apenas letras minúsculas, números e pontos' }
    }

    // Validar e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(userData.email_pessoal)) {
      return { error: 'Por favor, insira um e-mail válido' }
    }

    // Check if apelido already exists
    const { data: existingUser } = await supabase
      .from('usuarios')
      .select('id')
      .eq('apelido', userData.apelido)
      .maybeSingle()

    if (existingUser) {
      return { error: 'Este apelido já está em uso. Escolha outro.' }
    }

    // Get igreja_id
    const { data: igreja, error: igrejaError } = await supabase
      .from('igrejas')
      .select('id')
      .eq('nome', userData.igreja)
      .maybeSingle()

    if (igrejaError || !igreja) {
      return { error: 'Igreja não encontrada' }
    }

    // Hash the password
    const hashedPassword = await hashPassword(userData.senha)
    
    // Create new user
    const { data: newUser, error: insertError } = await supabase
      .from('usuarios')
      .insert({
        nome_completo: userData.nome_completo,
        apelido: userData.apelido,
        login_acesso: userData.login_acesso,
        senha: hashedPassword,
        email_pessoal: userData.email_pessoal,
        igreja_id: igreja.id,
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
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      return { error: insertError.message }
    }

    console.log('User created successfully:', newUser)
    return {}
  } catch (error: any) {
    console.error('Signup error:', error)
    return { error: error.message || 'Erro inesperado durante o cadastro' }
  }
}

export const signOutFromSupabase = async () => {
  localStorage.removeItem('escola_biblica_current_user')
  localStorage.removeItem('escola_biblica_usuario')
  window.location.href = '/'
}

// Usuario operations
export const fetchUsuarios = async (): Promise<Usuario[]> => {
  try {
    const { data: usuarios, error } = await supabase
      .from('usuarios')
      .select(`
        *,
        igrejas (nome)
      `)
      .order('nome_completo')

    if (error) {
      console.error('Error fetching usuarios:', error)
      return []
    }

    return usuarios.map(usuario => ({
      id: usuario.id,
      nome_completo: usuario.nome_completo,
      apelido: usuario.apelido,
      login_acesso: usuario.login_acesso,
      senha: usuario.senha,
      email_pessoal: usuario.email_pessoal || '',
      igreja: usuario.igrejas?.nome || 'Sem igreja',
      tipo: usuario.tipo,
      foto_perfil: usuario.foto_perfil || '',
      aprovado: usuario.aprovado,
      permissoes: usuario.permissoes,
      created_at: usuario.created_at,
      updated_at: usuario.updated_at
    }))
  } catch (error) {
    console.error('Error in fetchUsuarios:', error)
    return []
  }
}

export const addUsuario = async (usuario: Omit<Usuario, 'id'>): Promise<Usuario> => {
  try {
    // Get igreja_id
    const { data: igreja, error: igrejaError } = await supabase
      .from('igrejas')
      .select('id')
      .eq('nome', usuario.igreja)
      .maybeSingle()

    if (igrejaError || !igreja) {
      throw new Error('Igreja não encontrada')
    }

    const { data: newUsuario, error } = await supabase
      .from('usuarios')
      .insert({
        nome_completo: usuario.nome_completo,
        apelido: usuario.apelido,
        login_acesso: usuario.login_acesso,
        senha: usuario.senha,
        email_pessoal: usuario.email_pessoal,
        igreja_id: igreja.id,
        tipo: usuario.tipo,
        foto_perfil: usuario.foto_perfil,
        aprovado: usuario.aprovado,
        permissoes: usuario.permissoes
      })
      .select(`
        *,
        igrejas (nome)
      `)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return {
      id: newUsuario.id,
      nome_completo: newUsuario.nome_completo,
      apelido: newUsuario.apelido,
      login_acesso: newUsuario.login_acesso,
      senha: newUsuario.senha,
      email_pessoal: newUsuario.email_pessoal || '',
      igreja: newUsuario.igrejas?.nome || 'Sem igreja',
      tipo: newUsuario.tipo,
      foto_perfil: newUsuario.foto_perfil || '',
      aprovado: newUsuario.aprovado,
      permissoes: newUsuario.permissoes,
      created_at: newUsuario.created_at,
      updated_at: newUsuario.updated_at
    }
  } catch (error: any) {
    console.error('Error adding usuario:', error)
    throw error
  }
}

export const updateUsuario = async (id: string, updates: Partial<Usuario>) => {
  try {
    let updateData: any = { ...updates }

    // If igreja is being updated, get igreja_id
    if (updates.igreja) {
      const { data: igreja, error: igrejaError } = await supabase
        .from('igrejas')
        .select('id')
        .eq('nome', updates.igreja)
        .maybeSingle()

      if (igrejaError || !igreja) {
        throw new Error('Igreja não encontrada')
      }

      updateData.igreja_id = igreja.id
      delete updateData.igreja
    }

    const { error } = await supabase
      .from('usuarios')
      .update(updateData)
      .eq('id', id)

    if (error) {
      throw new Error(error.message)
    }
  } catch (error: any) {
    console.error('Error updating usuario:', error)
    throw error
  }
}

export const deleteUsuario = async (id: string) => {
  try {
    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(error.message)
    }
  } catch (error: any) {
    console.error('Error deleting usuario:', error)
    throw error
  }
}

// Interessado operations
export const fetchInteressados = async (): Promise<Interessado[]> => {
  try {
    const { data: interessados, error } = await supabase
      .from('interessados')
      .select(`
        *,
        igrejas (nome),
        instrutor:usuarios!interessados_instrutor_biblico_id_fkey (nome_completo)
      `)
      .order('nome_completo')

    if (error) {
      console.error('Error fetching interessados:', error)
      return []
    }

    return interessados.map(interessado => ({
      id: interessado.id,
      nome_completo: interessado.nome_completo,
      telefone: interessado.telefone || '',
      endereco: interessado.endereco || '',
      cidade: interessado.igrejas?.nome || 'Sem igreja',
      igreja: interessado.igrejas?.nome || 'Sem igreja',
      status: interessado.status,
      instrutor_biblico: interessado.instrutor?.nome_completo || 'A definir',
      data_contato: interessado.data_contato,
      observacoes: interessado.observacoes || '',
      frequenta_cultos: interessado.frequenta_cultos,
      estudo_biblico: interessado.estudo_biblico || '',
      created_at: interessado.created_at,
      updated_at: interessado.updated_at
    }))
  } catch (error) {
    console.error('Error in fetchInteressados:', error)
    return []
  }
}

export const addInteressado = async (interessado: Omit<Interessado, 'id'>): Promise<Interessado> => {
  try {
    // Get igreja_id
    const { data: igreja, error: igrejaError } = await supabase
      .from('igrejas')
      .select('id')
      .eq('nome', interessado.igreja || interessado.cidade)
      .maybeSingle()

    if (igrejaError || !igreja) {
      throw new Error('Igreja não encontrada')
    }

    // Get instrutor_id if specified
    let instrutorId = null
    if (interessado.instrutor_biblico && interessado.instrutor_biblico !== 'A definir') {
      const { data: instrutor } = await supabase
        .from('usuarios')
        .select('id')
        .eq('nome_completo', interessado.instrutor_biblico)
        .maybeSingle()
      
      if (instrutor) {
        instrutorId = instrutor.id
      }
    }

    const { data: newInteressado, error } = await supabase
      .from('interessados')
      .insert({
        nome_completo: interessado.nome_completo,
        telefone: interessado.telefone || '',
        endereco: interessado.endereco || '',
        igreja_id: igreja.id,
        status: interessado.status,
        instrutor_biblico_id: instrutorId,
        data_contato: interessado.data_contato,
        observacoes: interessado.observacoes || '',
        frequenta_cultos: interessado.frequenta_cultos,
        estudo_biblico: interessado.estudo_biblico || ''
      })
      .select(`
        *,
        igrejas (nome),
        instrutor:usuarios!interessados_instrutor_biblico_id_fkey (nome_completo)
      `)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return {
      id: newInteressado.id,
      nome_completo: newInteressado.nome_completo,
      telefone: newInteressado.telefone || '',
      endereco: newInteressado.endereco || '',
      cidade: newInteressado.igrejas?.nome || 'Sem igreja',
      igreja: newInteressado.igrejas?.nome || 'Sem igreja',
      status: newInteressado.status,
      instrutor_biblico: newInteressado.instrutor?.nome_completo || 'A definir',
      data_contato: newInteressado.data_contato,
      observacoes: newInteressado.observacoes || '',
      frequenta_cultos: newInteressado.frequenta_cultos,
      estudo_biblico: newInteressado.estudo_biblico || '',
      created_at: newInteressado.created_at,
      updated_at: newInteressado.updated_at
    }
  } catch (error: any) {
    console.error('Error adding interessado:', error)
    throw error
  }
}

export const updateInteressado = async (id: string, updates: Partial<Interessado>) => {
  try {
    let updateData: any = { ...updates }

    // If igreja/cidade is being updated, get igreja_id
    if (updates.igreja || updates.cidade) {
      const igrejaNome = updates.igreja || updates.cidade
      const { data: igreja, error: igrejaError } = await supabase
        .from('igrejas')
        .select('id')
        .eq('nome', igrejaNome)
        .maybeSingle()

      if (igrejaError || !igreja) {
        throw new Error('Igreja não encontrada')
      }

      updateData.igreja_id = igreja.id
      delete updateData.igreja
      delete updateData.cidade
    }

    // If instrutor_biblico is being updated, get instrutor_id
    if (updates.instrutor_biblico) {
      if (updates.instrutor_biblico === 'A definir') {
        updateData.instrutor_biblico_id = null
      } else {
        const { data: instrutor } = await supabase
          .from('usuarios')
          .select('id')
          .eq('nome_completo', updates.instrutor_biblico)
          .maybeSingle()
        
        if (instrutor) {
          updateData.instrutor_biblico_id = instrutor.id
        }
      }
      delete updateData.instrutor_biblico
    }

    const { error } = await supabase
      .from('interessados')
      .update(updateData)
      .eq('id', id)

    if (error) {
      throw new Error(error.message)
    }
  } catch (error: any) {
    console.error('Error updating interessado:', error)
    throw error
  }
}

export const deleteInteressado = async (id: string) => {
  try {
    const { error } = await supabase
      .from('interessados')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(error.message)
    }
  } catch (error: any) {
    console.error('Error deleting interessado:', error)
    throw error
  }
}

// Igreja operations
export const fetchIgrejas = async (): Promise<Igreja[]> => {
  try {
    const { data: igrejas, error } = await supabase
      .from('igrejas')
      .select('*')
      .order('nome')

    if (error) {
      console.error('Error fetching igrejas:', error)
      return []
    }

    return igrejas.map(igreja => ({
      id: igreja.id,
      nome: igreja.nome,
      ativa: igreja.ativa,
      created_at: igreja.created_at,
      updated_at: igreja.updated_at
    }))
  } catch (error) {
    console.error('Error in fetchIgrejas:', error)
    return []
  }
}

export const addIgreja = async (igreja: Omit<Igreja, 'id'>): Promise<Igreja> => {
  try {
    const { data: newIgreja, error } = await supabase
      .from('igrejas')
      .insert({
        nome: igreja.nome,
        ativa: igreja.ativa
      })
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return {
      id: newIgreja.id,
      nome: newIgreja.nome,
      ativa: newIgreja.ativa,
      created_at: newIgreja.created_at,
      updated_at: newIgreja.updated_at
    }
  } catch (error: any) {
    console.error('Error adding igreja:', error)
    throw error
  }
}

export const updateIgreja = async (id: string, updates: Partial<Igreja>) => {
  try {
    const { error } = await supabase
      .from('igrejas')
      .update(updates)
      .eq('id', id)

    if (error) {
      throw new Error(error.message)
    }
  } catch (error: any) {
    console.error('Error updating igreja:', error)
    throw error
  }
}

export const deleteIgreja = async (id: string) => {
  try {
    const { error } = await supabase
      .from('igrejas')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(error.message)
    }
  } catch (error: any) {
    console.error('Error deleting igreja:', error)
    throw error
  }
}

// Get current user from localStorage (for compatibility)
export const getCurrentUserFromSupabase = (): Usuario | null => {
  try {
    const data = localStorage.getItem('escola_biblica_current_user')
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}