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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      configuraçoes: {
        Row: {
          chave: string | null
          id: string | null
          valor: string | null
        }
        Insert: {
          chave?: string | null
          id?: string | null
          valor?: string | null
        }
        Update: {
          chave?: string | null
          id?: string | null
          valor?: string | null
        }
        Relationships: []
      }
      entidades: {
        Row: {
          aceitando_pedidos: boolean | null
          agendamento_ativo: boolean | null
          criado_em: string | null
          horario_abertura_dia: string | null
          horario_abertura_hora: string | null
          horario_fechamento_dia: string | null
          horario_fechamento_hora: string | null
          id: string | null
          nome: string | null
          tipo_pedido: string | null
        }
        Insert: {
          aceitando_pedidos?: boolean | null
          agendamento_ativo?: boolean | null
          criado_em?: string | null
          horario_abertura_dia?: string | null
          horario_abertura_hora?: string | null
          horario_fechamento_dia?: string | null
          horario_fechamento_hora?: string | null
          id?: string | null
          nome?: string | null
          tipo_pedido?: string | null
        }
        Update: {
          aceitando_pedidos?: boolean | null
          agendamento_ativo?: boolean | null
          criado_em?: string | null
          horario_abertura_dia?: string | null
          horario_abertura_hora?: string | null
          horario_fechamento_dia?: string | null
          horario_fechamento_hora?: string | null
          id?: string | null
          nome?: string | null
          tipo_pedido?: string | null
        }
        Relationships: []
      }
      inventario: {
        Row: {
          data_conferencia: string | null
          entidade_id: string | null
          id: string | null
          produto_id: string | null
          quantidade: number | null
          status: string | null
          unidade_medida: string | null
        }
        Insert: {
          data_conferencia?: string | null
          entidade_id?: string | null
          id?: string | null
          produto_id?: string | null
          quantidade?: number | null
          status?: string | null
          unidade_medida?: string | null
        }
        Update: {
          data_conferencia?: string | null
          entidade_id?: string | null
          id?: string | null
          produto_id?: string | null
          quantidade?: number | null
          status?: string | null
          unidade_medida?: string | null
        }
        Relationships: []
      }
      loja_entidades: {
        Row: {
          criado_em: string | null
          entidade_id: string | null
          id: string | null
          loja_id: string | null
        }
        Insert: {
          criado_em?: string | null
          entidade_id?: string | null
          id?: string | null
          loja_id?: string | null
        }
        Update: {
          criado_em?: string | null
          entidade_id?: string | null
          id?: string | null
          loja_id?: string | null
        }
        Relationships: []
      }
      lojas: {
        Row: {
          ativo: boolean | null
          codigo_acesso: string | null
          criado_em: string | null
          id: string | null
          nome: string | null
          ordem: number | null
          status: string | null
        }
        Insert: {
          ativo?: boolean | null
          codigo_acesso?: string | null
          criado_em?: string | null
          id?: string | null
          nome?: string | null
          ordem?: number | null
          status?: string | null
        }
        Update: {
          ativo?: boolean | null
          codigo_acesso?: string | null
          criado_em?: string | null
          id?: string | null
          nome?: string | null
          ordem?: number | null
          status?: string | null
        }
        Relationships: []
      }
      pedido_separacao_itens: {
        Row: {
          data_registro: string | null
          id: string | null
          pedido_id: string | null
          produto_id: string | null
          separado: boolean | null
        }
        Insert: {
          data_registro?: string | null
          id?: string | null
          pedido_id?: string | null
          produto_id?: string | null
          separado?: boolean | null
        }
        Update: {
          data_registro?: string | null
          id?: string | null
          pedido_id?: string | null
          produto_id?: string | null
          separado?: boolean | null
        }
        Relationships: []
      }
      pedidos: {
        Row: {
          cor_linha: string | null
          data: string | null
          email_solicitante: string | null
          entidade_id: string | null
          funcao_colaborador: string | null
          id: string | null
          loja_id: string | null
          matricula_funcionario: string | null
          motivo_solicitacao: string | null
          nome_colaborador: string | null
          nome_solicitante: string | null
          observacoes: string | null
          status: string | null
        }
        Insert: {
          cor_linha?: string | null
          data?: string | null
          email_solicitante?: string | null
          entidade_id?: string | null
          funcao_colaborador?: string | null
          id?: string | null
          loja_id?: string | null
          matricula_funcionario?: string | null
          motivo_solicitacao?: string | null
          nome_colaborador?: string | null
          nome_solicitante?: string | null
          observacoes?: string | null
          status?: string | null
        }
        Update: {
          cor_linha?: string | null
          data?: string | null
          email_solicitante?: string | null
          entidade_id?: string | null
          funcao_colaborador?: string | null
          id?: string | null
          loja_id?: string | null
          matricula_funcionario?: string | null
          motivo_solicitacao?: string | null
          nome_colaborador?: string | null
          nome_solicitante?: string | null
          observacoes?: string | null
          status?: string | null
        }
        Relationships: []
      }
      pedidos_itens: {
        Row: {
          id: string | null
          pedido_id: string | null
          produto_id: string | null
          quantidade: number | null
        }
        Insert: {
          id?: string | null
          pedido_id?: string | null
          produto_id?: string | null
          quantidade?: number | null
        }
        Update: {
          id?: string | null
          pedido_id?: string | null
          produto_id?: string | null
          quantidade?: number | null
        }
        Relationships: []
      }
      produtos: {
        Row: {
          codigo: string | null
          cor_codigo: string | null
          criado_em: string | null
          entidade_id: string | null
          id: string | null
          imagem_url: string | null
          nome: string | null
          ordem: string | null
          qtd_maxima: number | null
          status: string | null
        }
        Insert: {
          codigo?: string | null
          cor_codigo?: string | null
          criado_em?: string | null
          entidade_id?: string | null
          id?: string | null
          imagem_url?: string | null
          nome?: string | null
          ordem?: string | null
          qtd_maxima?: number | null
          status?: string | null
        }
        Update: {
          codigo?: string | null
          cor_codigo?: string | null
          criado_em?: string | null
          entidade_id?: string | null
          id?: string | null
          imagem_url?: string | null
          nome?: string | null
          ordem?: string | null
          qtd_maxima?: number | null
          status?: string | null
        }
        Relationships: []
      }
      produtos_entidades: {
        Row: {
          criado_em: string | null
          entidade_id: string | null
          id: string | null
          produto_id: string | null
        }
        Insert: {
          criado_em?: string | null
          entidade_id?: string | null
          id?: string | null
          produto_id?: string | null
        }
        Update: {
          criado_em?: string | null
          entidade_id?: string | null
          id?: string | null
          produto_id?: string | null
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
