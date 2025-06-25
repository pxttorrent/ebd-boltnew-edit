import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

// Types for database tables
export interface Database {
  public: {
    Tables: {
      igrejas: {
        Row: {
          id: string;
          nome: string;
          ativa: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          ativa?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          ativa?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      usuarios: {
        Row: {
          id: string;
          nome_completo: string;
          apelido: string;
          login_acesso: string;
          senha: string;
          email_pessoal: string | null;
          igreja_id: string | null;
          tipo: 'administrador' | 'missionario';
          foto_perfil: string | null;
          aprovado: boolean;
          permissoes: {
            pode_cadastrar: boolean;
            pode_editar: boolean;
            pode_excluir: boolean;
            pode_exportar: boolean;
          };
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome_completo: string;
          apelido: string;
          login_acesso: string;
          senha: string;
          email_pessoal?: string | null;
          igreja_id?: string | null;
          tipo?: 'administrador' | 'missionario';
          foto_perfil?: string | null;
          aprovado?: boolean;
          permissoes?: {
            pode_cadastrar: boolean;
            pode_editar: boolean;
            pode_excluir: boolean;
            pode_exportar: boolean;
          };
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nome_completo?: string;
          apelido?: string;
          login_acesso?: string;
          senha?: string;
          email_pessoal?: string | null;
          igreja_id?: string | null;
          tipo?: 'administrador' | 'missionario';
          foto_perfil?: string | null;
          aprovado?: boolean;
          permissoes?: {
            pode_cadastrar: boolean;
            pode_editar: boolean;
            pode_excluir: boolean;
            pode_exportar: boolean;
          };
          created_at?: string;
          updated_at?: string;
        };
      };
      interessados: {
        Row: {
          id: string;
          nome_completo: string;
          telefone: string;
          endereco: string;
          igreja_id: string | null;
          status: 'A' | 'B' | 'C' | 'D' | 'E';
          instrutor_biblico_id: string | null;
          data_contato: string;
          observacoes: string;
          frequenta_cultos: string | null;
          estudo_biblico: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome_completo: string;
          telefone?: string;
          endereco?: string;
          igreja_id?: string | null;
          status?: 'A' | 'B' | 'C' | 'D' | 'E';
          instrutor_biblico_id?: string | null;
          data_contato?: string;
          observacoes?: string;
          frequenta_cultos?: string | null;
          estudo_biblico?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nome_completo?: string;
          telefone?: string;
          endereco?: string;
          igreja_id?: string | null;
          status?: 'A' | 'B' | 'C' | 'D' | 'E';
          instrutor_biblico_id?: string | null;
          data_contato?: string;
          observacoes?: string;
          frequenta_cultos?: string | null;
          estudo_biblico?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}