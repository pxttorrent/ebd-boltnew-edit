export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      codigos_recuperacao: {
        Row: {
          codigo: string
          created_at: string
          email_pessoal: string
          expires_at: string
          id: string
          usado: boolean
          usuario_id: string
        }
        Insert: {
          codigo: string
          created_at?: string
          email_pessoal: string
          expires_at: string
          id?: string
          usado?: boolean
          usuario_id: string
        }
        Update: {
          codigo?: string
          created_at?: string
          email_pessoal?: string
          expires_at?: string
          id?: string
          usado?: boolean
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "codigos_recuperacao_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      interessados: {
        Row: {
          cidade: string
          created_at: string
          data_contato: string
          endereco: string | null
          estudo_biblico: string | null
          frequenta_cultos: string | null
          id: string
          igreja: string
          instrutor_biblico: string
          nome_completo: string
          observacoes: string | null
          status: string
          telefone: string
          updated_at: string
        }
        Insert: {
          cidade: string
          created_at?: string
          data_contato: string
          endereco?: string | null
          estudo_biblico?: string | null
          frequenta_cultos?: string | null
          id?: string
          igreja: string
          instrutor_biblico: string
          nome_completo: string
          observacoes?: string | null
          status: string
          telefone: string
          updated_at?: string
        }
        Update: {
          cidade?: string
          created_at?: string
          data_contato?: string
          endereco?: string | null
          estudo_biblico?: string | null
          frequenta_cultos?: string | null
          id?: string
          igreja?: string
          instrutor_biblico?: string
          nome_completo?: string
          observacoes?: string | null
          status?: string
          telefone?: string
          updated_at?: string
        }
        Relationships: []
      }
      usuario_permissoes: {
        Row: {
          created_at: string
          id: string
          pode_cadastrar: boolean
          pode_editar: boolean
          pode_excluir: boolean
          pode_exportar: boolean
          updated_at: string
          usuario_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          pode_cadastrar?: boolean
          pode_editar?: boolean
          pode_excluir?: boolean
          pode_exportar?: boolean
          updated_at?: string
          usuario_id: string
        }
        Update: {
          created_at?: string
          id?: string
          pode_cadastrar?: boolean
          pode_editar?: boolean
          pode_excluir?: boolean
          pode_exportar?: boolean
          updated_at?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuario_permissoes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: true
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          apelido: string
          aprovado: boolean
          created_at: string
          email_pessoal: string | null
          foto_perfil: string | null
          id: string
          igreja: string
          login_acesso: string
          nome_completo: string
          senha: string
          updated_at: string
        }
        Insert: {
          apelido: string
          aprovado?: boolean
          created_at?: string
          email_pessoal?: string | null
          foto_perfil?: string | null
          id?: string
          igreja: string
          login_acesso: string
          nome_completo: string
          senha: string
          updated_at?: string
        }
        Update: {
          apelido?: string
          aprovado?: boolean
          created_at?: string
          email_pessoal?: string | null
          foto_perfil?: string | null
          id?: string
          igreja?: string
          login_acesso?: string
          nome_completo?: string
          senha?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
