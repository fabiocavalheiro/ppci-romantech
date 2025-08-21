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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          end_time: string | null
          id: string
          location_id: string
          scheduled_date: string
          start_time: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          end_time?: string | null
          id?: string
          location_id: string
          scheduled_date: string
          start_time?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          end_time?: string | null
          id?: string
          location_id?: string
          scheduled_date?: string
          start_time?: string | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_activities_location"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      alarms: {
        Row: {
          created_at: string
          id: string
          last_maintenance: string | null
          location_id: string
          maintenance_frequency_months: number
          next_maintenance: string | null
          serial_number: string
          status: Database["public"]["Enums"]["equipment_status"]
          type: string
          updated_at: string
          zone: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_maintenance?: string | null
          location_id: string
          maintenance_frequency_months?: number
          next_maintenance?: string | null
          serial_number: string
          status?: Database["public"]["Enums"]["equipment_status"]
          type: string
          updated_at?: string
          zone: string
        }
        Update: {
          created_at?: string
          id?: string
          last_maintenance?: string | null
          location_id?: string
          maintenance_frequency_months?: number
          next_maintenance?: string | null
          serial_number?: string
          status?: Database["public"]["Enums"]["equipment_status"]
          type?: string
          updated_at?: string
          zone?: string
        }
        Relationships: [
          {
            foreignKeyName: "alarms_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      brigade_members: {
        Row: {
          active: boolean
          cpf: string
          created_at: string
          id: string
          last_training: string | null
          location_id: string
          name: string
          next_training: string | null
          role: string
          status: Database["public"]["Enums"]["equipment_status"]
          training_frequency_months: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          cpf: string
          created_at?: string
          id?: string
          last_training?: string | null
          location_id: string
          name: string
          next_training?: string | null
          role: string
          status?: Database["public"]["Enums"]["equipment_status"]
          training_frequency_months?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          cpf?: string
          created_at?: string
          id?: string
          last_training?: string | null
          location_id?: string
          name?: string
          next_training?: string | null
          role?: string
          status?: Database["public"]["Enums"]["equipment_status"]
          training_frequency_months?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brigade_members_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          active: boolean
          address: Json | null
          cnpj: string | null
          contact_person: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          address?: Json | null
          cnpj?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          address?: Json | null
          cnpj?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      emergency_lighting: {
        Row: {
          created_at: string
          id: string
          last_maintenance: string | null
          location_id: string
          maintenance_frequency_months: number
          next_maintenance: string | null
          serial_number: string
          status: Database["public"]["Enums"]["equipment_status"]
          type: string
          updated_at: string
          zone: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_maintenance?: string | null
          location_id: string
          maintenance_frequency_months?: number
          next_maintenance?: string | null
          serial_number: string
          status?: Database["public"]["Enums"]["equipment_status"]
          type: string
          updated_at?: string
          zone: string
        }
        Update: {
          created_at?: string
          id?: string
          last_maintenance?: string | null
          location_id?: string
          maintenance_frequency_months?: number
          next_maintenance?: string | null
          serial_number?: string
          status?: Database["public"]["Enums"]["equipment_status"]
          type?: string
          updated_at?: string
          zone?: string
        }
        Relationships: [
          {
            foreignKeyName: "emergency_lighting_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          cnpj: string | null
          created_at: string
          id: string
          nome: string
          status: string
        }
        Insert: {
          cnpj?: string | null
          created_at?: string
          id?: string
          nome: string
          status?: string
        }
        Update: {
          cnpj?: string | null
          created_at?: string
          id?: string
          nome?: string
          status?: string
        }
        Relationships: []
      }
      extintores: {
        Row: {
          created_at: string
          id: string
          local_id: string
          localizacao_texto: string | null
          numero: number
          observacoes: string | null
          proxima_inspecao: string | null
          responsavel_manutencao: string | null
          status: Database["public"]["Enums"]["equipment_status"]
          tipo: Database["public"]["Enums"]["extintor_type"]
          ultima_inspecao: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          local_id: string
          localizacao_texto?: string | null
          numero: number
          observacoes?: string | null
          proxima_inspecao?: string | null
          responsavel_manutencao?: string | null
          status?: Database["public"]["Enums"]["equipment_status"]
          tipo?: Database["public"]["Enums"]["extintor_type"]
          ultima_inspecao?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          local_id?: string
          localizacao_texto?: string | null
          numero?: number
          observacoes?: string | null
          proxima_inspecao?: string | null
          responsavel_manutencao?: string | null
          status?: Database["public"]["Enums"]["equipment_status"]
          tipo?: Database["public"]["Enums"]["extintor_type"]
          ultima_inspecao?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "extintores_local_id_fkey"
            columns: ["local_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      fire_extinguishers: {
        Row: {
          capacity: string
          created_at: string
          id: string
          last_maintenance: string | null
          location_id: string
          maintenance_frequency_months: number
          manufacture_date: string
          next_maintenance: string | null
          serial_number: string
          status: Database["public"]["Enums"]["equipment_status"]
          type: string
          updated_at: string
        }
        Insert: {
          capacity: string
          created_at?: string
          id?: string
          last_maintenance?: string | null
          location_id: string
          maintenance_frequency_months?: number
          manufacture_date: string
          next_maintenance?: string | null
          serial_number: string
          status?: Database["public"]["Enums"]["equipment_status"]
          type: string
          updated_at?: string
        }
        Update: {
          capacity?: string
          created_at?: string
          id?: string
          last_maintenance?: string | null
          location_id?: string
          maintenance_frequency_months?: number
          manufacture_date?: string
          next_maintenance?: string | null
          serial_number?: string
          status?: Database["public"]["Enums"]["equipment_status"]
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fire_extinguishers_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      hydrants: {
        Row: {
          created_at: string
          id: string
          last_maintenance: string | null
          location_id: string
          maintenance_frequency_months: number
          next_maintenance: string | null
          pressure_rating: string | null
          serial_number: string
          status: Database["public"]["Enums"]["equipment_status"]
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_maintenance?: string | null
          location_id: string
          maintenance_frequency_months?: number
          next_maintenance?: string | null
          pressure_rating?: string | null
          serial_number: string
          status?: Database["public"]["Enums"]["equipment_status"]
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_maintenance?: string | null
          location_id?: string
          maintenance_frequency_months?: number
          next_maintenance?: string | null
          pressure_rating?: string | null
          serial_number?: string
          status?: Database["public"]["Enums"]["equipment_status"]
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hydrants_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          active: boolean
          address: string
          client_id: string
          client_type: Database["public"]["Enums"]["client_type_enum"] | null
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          address: string
          client_id: string
          client_type?: Database["public"]["Enums"]["client_type_enum"] | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          address?: string
          client_id?: string
          client_type?: Database["public"]["Enums"]["client_type_enum"] | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "locations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active: boolean
          client_id: string | null
          created_at: string
          email: string
          empresa_id: string | null
          full_name: string
          id: string
          phone: string | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          client_id?: string | null
          created_at?: string
          email: string
          empresa_id?: string | null
          full_name: string
          id?: string
          phone?: string | null
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          client_id?: string | null
          created_at?: string
          email?: string
          empresa_id?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          company_name: string | null
          id: number
          logo_url: string | null
          primary_color: string | null
          updated_at: string | null
        }
        Insert: {
          company_name?: string | null
          id?: number
          logo_url?: string | null
          primary_color?: string | null
          updated_at?: string | null
        }
        Update: {
          company_name?: string | null
          id?: number
          logo_url?: string | null
          primary_color?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sprinklers: {
        Row: {
          created_at: string
          id: string
          last_maintenance: string | null
          location_id: string
          maintenance_frequency_months: number
          next_maintenance: string | null
          serial_number: string
          status: Database["public"]["Enums"]["equipment_status"]
          type: string
          updated_at: string
          zone: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_maintenance?: string | null
          location_id: string
          maintenance_frequency_months?: number
          next_maintenance?: string | null
          serial_number: string
          status?: Database["public"]["Enums"]["equipment_status"]
          type: string
          updated_at?: string
          zone: string
        }
        Update: {
          created_at?: string
          id?: string
          last_maintenance?: string | null
          location_id?: string
          maintenance_frequency_months?: number
          next_maintenance?: string | null
          serial_number?: string
          status?: Database["public"]["Enums"]["equipment_status"]
          type?: string
          updated_at?: string
          zone?: string
        }
        Relationships: [
          {
            foreignKeyName: "sprinklers_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_brigade_members_for_client: {
        Args: Record<PropertyKey, never>
        Returns: {
          active: boolean
          created_at: string
          id: string
          last_training: string
          location_id: string
          name: string
          next_training: string
          role: string
          status: Database["public"]["Enums"]["equipment_status"]
          training_frequency_months: number
          updated_at: string
        }[]
      }
      get_brigade_members_for_client_safe: {
        Args: Record<PropertyKey, never>
        Returns: {
          active: boolean
          created_at: string
          id: string
          last_training: string
          location_id: string
          name: string
          next_training: string
          role: string
          status: Database["public"]["Enums"]["equipment_status"]
          training_frequency_months: number
          updated_at: string
        }[]
      }
      get_user_client_id: {
        Args: { user_id: string }
        Returns: string
      }
      get_user_client_ids: {
        Args: { user_id: string }
        Returns: string[]
      }
      get_user_client_ids_safe: {
        Args: { user_id: string }
        Returns: string[]
      }
      get_user_empresa_id: {
        Args: { user_id: string }
        Returns: string
      }
      get_user_profile_empresa_id: {
        Args: { user_id: string }
        Returns: string
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      get_user_role_safe: {
        Args: { user_id: string }
        Returns: string
      }
      get_user_role_temp: {
        Args: { user_id: string }
        Returns: string
      }
      log_sensitive_data_access: {
        Args: { accessed_by?: string; operation: string; table_name: string }
        Returns: undefined
      }
    }
    Enums: {
      client_type_enum: "residencial" | "comercial" | "industria"
      equipment_status: "ok" | "warning" | "danger" | "expired"
      extintor_type: "BC" | "ABC" | "CO2"
      user_role: "admin" | "cliente" | "tecnico"
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
    Enums: {
      client_type_enum: ["residencial", "comercial", "industria"],
      equipment_status: ["ok", "warning", "danger", "expired"],
      extintor_type: ["BC", "ABC", "CO2"],
      user_role: ["admin", "cliente", "tecnico"],
    },
  },
} as const
