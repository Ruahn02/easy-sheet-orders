export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      configuracoes: {
        Row: {
          chave: string
          id: string
          valor: string
        }
        Insert: {
          chave: string
          id?: string
          valor: string
        }
        Update: {
          chave?: string
          id?: string
          valor?: string
        }
        Relationships: []
      }
      entidades: {
        Row: {
          aceitando_pedidos: boolean
          criado_em: string
          id: string
          nome: string
          tipo_pedido: string
        }
        Insert: {
          aceitando_pedidos?: boolean
          criado_em?: string
          id?: string
          nome: string
          tipo_pedido?: string
        }
        Update: {
          aceitando_pedidos?: boolean
          criado_em?: string
          id?: string
          nome?: string
          tipo_pedido?: string
        }
        Relationships: []
      }
      inventario: {
        Row: {
          data_conferencia: string
          entidade_id: string
          id: string
          produto_id: string
          quantidade: number
          status: string
          unidade_medida: string
        }
        Insert: {
          data_conferencia?: string
          entidade_id: string
          id?: string
          produto_id: string
          quantidade?: number
          status?: string
          unidade_medida?: string
        }
        Update: {
          data_conferencia?: string
          entidade_id?: string
          id?: string
          produto_id?: string
          quantidade?: number
          status?: string
          unidade_medida?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventario_entidade_id_fkey"
            columns: ["entidade_id"]
            isOneToOne: false
            referencedRelation: "entidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventario_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: true
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      lojas: {
        Row: {
          ativo: boolean
          codigo_acesso: string
          criado_em: string
          id: string
          nome: string
          ordem: number | null
          status: string
        }
        Insert: {
          ativo?: boolean
          codigo_acesso: string
          criado_em?: string
          id?: string
          nome: string
          ordem?: number | null
          status?: string
        }
        Update: {
          ativo?: boolean
          codigo_acesso?: string
          criado_em?: string
          id?: string
          nome?: string
          ordem?: number | null
          status?: string
        }
        Relationships: []
      }
      pedido_itens: {
        Row: {
          id: string
          pedido_id: string
          produto_id: string
          quantidade: number
        }
        Insert: {
          id?: string
          pedido_id: string
          produto_id: string
          quantidade: number
        }
        Update: {
          id?: string
          pedido_id?: string
          produto_id?: string
          quantidade?: number
        }
        Relationships: [
          {
            foreignKeyName: "pedido_itens_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedido_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      pedido_separacao_itens: {
        Row: {
          data_registro: string
          id: string
          pedido_id: string
          produto_id: string
          separado: boolean
        }
        Insert: {
          data_registro?: string
          id?: string
          pedido_id: string
          produto_id: string
          separado?: boolean
        }
        Update: {
          data_registro?: string
          id?: string
          pedido_id?: string
          produto_id?: string
          separado?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "pedido_separacao_itens_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedido_separacao_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos: {
        Row: {
          cor_linha: string | null
          data: string
          email_solicitante: string | null
          entidade_id: string
          funcao_colaborador: string | null
          id: string
          loja_id: string
          matricula_funcionario: string | null
          motivo_solicitacao: string | null
          nome_colaborador: string | null
          nome_solicitante: string | null
          observacoes: string | null
          status: string
        }
        Insert: {
          cor_linha?: string | null
          data?: string
          email_solicitante?: string | null
          entidade_id: string
          funcao_colaborador?: string | null
          id?: string
          loja_id: string
          matricula_funcionario?: string | null
          motivo_solicitacao?: string | null
          nome_colaborador?: string | null
          nome_solicitante?: string | null
          observacoes?: string | null
          status?: string
        }
        Update: {
          cor_linha?: string | null
          data?: string
          email_solicitante?: string | null
          entidade_id?: string
          funcao_colaborador?: string | null
          id?: string
          loja_id?: string
          matricula_funcionario?: string | null
          motivo_solicitacao?: string | null
          nome_colaborador?: string | null
          nome_solicitante?: string | null
          observacoes?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_entidade_id_fkey"
            columns: ["entidade_id"]
            isOneToOne: false
            referencedRelation: "entidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_loja_id_fkey"
            columns: ["loja_id"]
            isOneToOne: false
            referencedRelation: "lojas"
            referencedColumns: ["id"]
          },
        ]
      }
      produto_entidades: {
        Row: {
          criado_em: string
          entidade_id: string
          id: string
          produto_id: string
        }
        Insert: {
          criado_em?: string
          entidade_id: string
          id?: string
          produto_id: string
        }
        Update: {
          criado_em?: string
          entidade_id?: string
          id?: string
          produto_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "produto_entidades_entidade_id_fkey"
            columns: ["entidade_id"]
            isOneToOne: false
            referencedRelation: "entidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produto_entidades_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          codigo: string
          criado_em: string
          entidade_id: string
          id: string
          imagem_url: string | null
          nome: string
          ordem: number | null
          qtd_maxima: number
          status: string
        }
        Insert: {
          codigo: string
          criado_em?: string
          entidade_id: string
          id?: string
          imagem_url?: string | null
          nome: string
          ordem?: number | null
          qtd_maxima?: number
          status?: string
        }
        Update: {
          codigo?: string
          criado_em?: string
          entidade_id?: string
          id?: string
          imagem_url?: string | null
          nome?: string
          ordem?: number | null
          qtd_maxima?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "produtos_entidade_id_fkey"
            columns: ["entidade_id"]
            isOneToOne: false
            referencedRelation: "entidades"
            referencedColumns: ["id"]
          },
        ]
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
