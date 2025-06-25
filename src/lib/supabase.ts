import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('🔧 Configuração Supabase:', {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey,
  keyLength: supabaseAnonKey?.length
})

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas:', {
    VITE_SUPABASE_URL: supabaseUrl,
    VITE_SUPABASE_ANON_KEY: supabaseAnonKey ? 'Presente' : 'Ausente'
  })
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false // Desabilitar sessão automática do Supabase Auth
  }
})

// Test connection
supabase
  .from('igrejas')
  .select('count', { count: 'exact', head: true })
  .then(({ count, error }) => {
    if (error) {
      console.error('❌ Erro ao conectar com Supabase:', error)
    } else {
      console.log('✅ Conexão com Supabase estabelecida. Igrejas encontradas:', count)
    }
  })

// Types for database tables
export interface Database {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string
          nome_completo: string
          apelido: string
          login_acesso: string
          senha: string
          email_pessoal: string | null
          igreja_id: string | null
          tipo: 'administrador' | 'missionario'
          foto_perfil: string | null
          aprovado: boolean
          permissoes: {
            pode_cadastrar: boolean
            pode_editar: boolean
            pode_excluir: boolean
            pode_exportar: boolean
          }
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome_completo: string
          apelido: string
          login_acesso: string
          senha: string
          email_pessoal?: string | null
          igreja_id?: string | null
          tipo?: 'administrador' | 'missionario'
          foto_perfil?: string | null
          aprovado?: boolean
          permissoes?: {
            pode_cadastrar: boolean
            pode_editar: boolean
            pode_excluir: boolean
            pode_exportar: boolean
          }
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome_completo?: string
          apelido?: string
          login_acesso?: string
          senha?: string
          email_pessoal?: string | null
          igreja_id?: string | null
          tipo?: 'administrador' | 'missionario'
          foto_perfil?: string | null
          aprovado?: boolean
          permissoes?: {
            pode_cadastrar: boolean
            pode_editar: boolean
            pode_excluir: boolean
            pode_exportar: boolean
          }
          created_at?: string
          updated_at?: string
        }
      }
      interessados: {
        Row: {
          id: string
          nome_completo: string
          telefone: string
          endereco: string
          igreja_id: string | null
          status: 'A' | 'B' | 'C' | 'D' | 'E'
          instrutor_biblico_id: string | null
          data_contato: string
          observacoes: string
          frequenta_cultos: string | null
          estudo_biblico: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome_completo: string
          telefone?: string
          endereco?: string
          igreja_id?: string | null
          status?: 'A' | 'B' | 'C' | 'D' | 'E'
          instrutor_biblico_id?: string | null
          data_contato?: string
          observacoes?: string
          frequenta_cultos?: string | null
          estudo_biblico?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome_completo?: string
          telefone?: string
          endereco?: string
          igreja_id?: string | null
          status?: 'A' | 'B' | 'C' | 'D' | 'E'
          instrutor_biblico_id?: string | null
          data_contato?: string
          observacoes?: string
          frequenta_cultos?: string | null
          estudo_biblico?: string
          created_at?: string
          updated_at?: string
        }
      }
      igrejas: {
        Row: {
          id: string
          nome: string
          ativa: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          ativa?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          ativa?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}