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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      customers: {
        Row: {
          created_at: string | null
          email: string | null
          id: number
          name: string
          phone: string | null
          tenant_id: number | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: number
          name: string
          phone?: string | null
          tenant_id?: number | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: number
          name?: string
          phone?: string | null
          tenant_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants_public"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          customer_id: number | null
          id: number
          items: Json
          notes: string | null
          payment_id: string | null
          payment_method: string | null
          status: string
          tenant_id: number | null
          total: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: number | null
          id?: number
          items?: Json
          notes?: string | null
          payment_id?: string | null
          payment_method?: string | null
          status?: string
          tenant_id?: number | null
          total: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: number | null
          id?: number
          items?: Json
          notes?: string | null
          payment_id?: string | null
          payment_method?: string | null
          status?: string
          tenant_id?: number | null
          total?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants_public"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean | null
          category: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          id: number
          image_url: string | null
          metadata: Json | null
          name: string
          price: number
          stock: number | null
          tenant_id: number | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: number
          image_url?: string | null
          metadata?: Json | null
          name: string
          price: number
          stock?: number | null
          tenant_id?: number | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: number
          image_url?: string | null
          metadata?: Json | null
          name?: string
          price?: number
          stock?: number | null
          tenant_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants_public"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          active: boolean | null
          config: Json | null
          created_at: string | null
          id: number
          mp_access_token: string | null
          name: string
          owner_email: string
          owner_id: string
          plan: string
          secure_config: Json | null
          slug: string
          template: string
          theme_overrides: Json
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          config?: Json | null
          created_at?: string | null
          id?: number
          mp_access_token?: string | null
          name: string
          owner_email: string
          owner_id: string
          plan?: string
          secure_config?: Json | null
          slug: string
          template?: string
          theme_overrides?: Json
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          config?: Json | null
          created_at?: string | null
          id?: number
          mp_access_token?: string | null
          name?: string
          owner_email?: string
          owner_id?: string
          plan?: string
          secure_config?: Json | null
          slug?: string
          template?: string
          theme_overrides?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      daily_sales: {
        Row: {
          avg_order_value: number | null
          order_count: number | null
          sale_date: string | null
          tenant_id: number | null
          total_sales: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants_public"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants_public: {
        Row: {
          active: boolean | null
          config: Json | null
          created_at: string | null
          id: number | null
          name: string | null
          plan: string | null
          slug: string | null
          template: string | null
          theme_overrides: Json | null
        }
        Insert: {
          active?: boolean | null
          config?: Json | null
          created_at?: string | null
          id?: number | null
          name?: string | null
          plan?: string | null
          slug?: string | null
          template?: string | null
          theme_overrides?: Json | null
        }
        Update: {
          active?: boolean | null
          config?: Json | null
          created_at?: string | null
          id?: number | null
          name?: string | null
          plan?: string | null
          slug?: string | null
          template?: string | null
          theme_overrides?: Json | null
        }
        Relationships: []
      }
      top_products: {
        Row: {
          category: string | null
          id: number | null
          name: string | null
          order_count: number | null
          price: number | null
          tenant_id: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants_public"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_product_badges: { Args: { product_id: number }; Returns: string[] }
      get_public_tenant_by_slug: {
        Args: { tenant_slug: string }
        Returns: {
          active: boolean
          config: Json
          created_at: string
          id: string
          name: string
          plan: string
          slug: string
        }[]
      }
      is_superadmin: { Args: Record<string, never>; Returns: boolean }
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
