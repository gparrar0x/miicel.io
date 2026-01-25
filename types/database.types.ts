export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      users: {
        Row: {
          auth_user_id: string | null
          created_at: string | null
          email: string
          id: number
          is_active: boolean | null
          last_login_at: string | null
          name: string
          permissions: Json | null
          role: string
          tenant_id: number | null
          updated_at: string | null
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string | null
          email: string
          id?: number
          is_active?: boolean | null
          last_login_at?: string | null
          name: string
          permissions?: Json | null
          role: string
          tenant_id?: number | null
          updated_at?: string | null
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string | null
          email?: string
          id?: number
          is_active?: boolean | null
          last_login_at?: string | null
          name?: string
          permissions?: Json | null
          role?: string
          tenant_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      customers: {
        Row: {
          created_at: string | null
          email: string | null
          id: number
          last_order_at: string | null
          loyalty_points: number | null
          name: string
          phone: string | null
          tenant_id: number | null
          total_orders: number | null
          total_spent: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: number
          last_order_at?: string | null
          loyalty_points?: number | null
          name: string
          phone?: string | null
          tenant_id?: number | null
          total_orders?: number | null
          total_spent?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: number
          last_order_at?: string | null
          loyalty_points?: number | null
          name?: string
          phone?: string | null
          tenant_id?: number | null
          total_orders?: number | null
          total_spent?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          checkout_id: string | null
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
          checkout_id?: string | null
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
          checkout_id?: string | null
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
        Relationships: []
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
        Relationships: []
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
      payments: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          id: number
          metadata: Json | null
          order_id: number
          payer_email: string | null
          payer_name: string | null
          payment_id: string
          payment_method_id: string | null
          payment_type: string | null
          status: string
          status_detail: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string
          id?: number
          metadata?: Json | null
          order_id: number
          payer_email?: string | null
          payer_name?: string | null
          payment_id: string
          payment_method_id?: string | null
          payment_type?: string | null
          status: string
          status_detail?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          id?: number
          metadata?: Json | null
          order_id?: number
          payer_email?: string | null
          payer_name?: string | null
          payment_id?: string
          payment_method_id?: string | null
          payment_type?: string | null
          status?: string
          status_detail?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          created_at: string
          description: string | null
          enabled: boolean
          id: number
          key: string
          rules: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: never
          key: string
          rules?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: never
          key?: string
          rules?: Json
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {}
    Functions: {
      is_superadmin: { Args: Record<PropertyKey, never>; Returns: boolean }
    }
    Enums: {}
    CompositeTypes: {}
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<T extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])> =
  (DefaultSchema["Tables"] & DefaultSchema["Views"])[T] extends { Row: infer R } ? R : never

export type TablesInsert<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T] extends { Insert: infer I } ? I : never

export type TablesUpdate<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T] extends { Update: infer U } ? U : never
