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
      agent_conversations: {
        Row: {
          agent_name: string | null
          created_at: string
          from_channel: string
          id: string
          messages: Json
          status: string
          tenant_id: number
          thread_id: string
          updated_at: string
        }
        Insert: {
          agent_name?: string | null
          created_at?: string
          from_channel?: string
          id?: string
          messages?: Json
          status?: string
          tenant_id: number
          thread_id: string
          updated_at?: string
        }
        Update: {
          agent_name?: string | null
          created_at?: string
          from_channel?: string
          id?: string
          messages?: Json
          status?: string
          tenant_id?: number
          thread_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_conversations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_conversations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants_public"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_usage_logs: {
        Row: {
          agent_name: string
          conversation_id: string | null
          cost_usd: number
          created_at: string
          id: string
          model: string
          tenant_id: number
          tokens_in: number
          tokens_out: number
        }
        Insert: {
          agent_name: string
          conversation_id?: string | null
          cost_usd?: number
          created_at?: string
          id?: string
          model: string
          tenant_id: number
          tokens_in?: number
          tokens_out?: number
        }
        Update: {
          agent_name?: string
          conversation_id?: string | null
          cost_usd?: number
          created_at?: string
          id?: string
          model?: string
          tenant_id?: number
          tokens_in?: number
          tokens_out?: number
        }
        Relationships: [
          {
            foreignKeyName: "agent_usage_logs_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "agent_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_usage_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_usage_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants_public"
            referencedColumns: ["id"]
          },
        ]
      }
      artwork_consignments: {
        Row: {
          assigned_date: string | null
          created_at: string | null
          id: number
          location_id: number
          notes: string | null
          status: string
          tenant_id: number
          unassigned_date: string | null
          updated_at: string | null
          work_id: number
        }
        Insert: {
          assigned_date?: string | null
          created_at?: string | null
          id?: number
          location_id: number
          notes?: string | null
          status?: string
          tenant_id: number
          unassigned_date?: string | null
          updated_at?: string | null
          work_id: number
        }
        Update: {
          assigned_date?: string | null
          created_at?: string | null
          id?: number
          location_id?: number
          notes?: string | null
          status?: string
          tenant_id?: number
          unassigned_date?: string | null
          updated_at?: string | null
          work_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "artwork_consignments_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "consignment_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artwork_consignments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artwork_consignments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artwork_consignments_work_id_fkey"
            columns: ["work_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artwork_consignments_work_id_fkey"
            columns: ["work_id"]
            isOneToOne: false
            referencedRelation: "top_products"
            referencedColumns: ["id"]
          },
        ]
      }
      checkpoint_blobs: {
        Row: {
          blob: string | null
          channel: string
          checkpoint_ns: string
          thread_id: string
          type: string
          version: string
        }
        Insert: {
          blob?: string | null
          channel: string
          checkpoint_ns?: string
          thread_id: string
          type: string
          version: string
        }
        Update: {
          blob?: string | null
          channel?: string
          checkpoint_ns?: string
          thread_id?: string
          type?: string
          version?: string
        }
        Relationships: []
      }
      checkpoint_migrations: {
        Row: {
          v: number
        }
        Insert: {
          v: number
        }
        Update: {
          v?: number
        }
        Relationships: []
      }
      checkpoint_writes: {
        Row: {
          blob: string
          channel: string
          checkpoint_id: string
          checkpoint_ns: string
          idx: number
          task_id: string
          task_path: string
          thread_id: string
          type: string | null
        }
        Insert: {
          blob: string
          channel: string
          checkpoint_id: string
          checkpoint_ns?: string
          idx: number
          task_id: string
          task_path?: string
          thread_id: string
          type?: string | null
        }
        Update: {
          blob?: string
          channel?: string
          checkpoint_id?: string
          checkpoint_ns?: string
          idx?: number
          task_id?: string
          task_path?: string
          thread_id?: string
          type?: string | null
        }
        Relationships: []
      }
      checkpoints: {
        Row: {
          checkpoint: Json
          checkpoint_id: string
          checkpoint_ns: string
          metadata: Json
          parent_checkpoint_id: string | null
          thread_id: string
          type: string | null
        }
        Insert: {
          checkpoint: Json
          checkpoint_id: string
          checkpoint_ns?: string
          metadata?: Json
          parent_checkpoint_id?: string | null
          thread_id: string
          type?: string | null
        }
        Update: {
          checkpoint?: Json
          checkpoint_id?: string
          checkpoint_ns?: string
          metadata?: Json
          parent_checkpoint_id?: string | null
          thread_id?: string
          type?: string | null
        }
        Relationships: []
      }
      consignment_locations: {
        Row: {
          address: string | null
          city: string
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          country: string
          created_at: string | null
          description: string | null
          id: number
          latitude: number | null
          longitude: number | null
          name: string
          status: string
          tenant_id: number
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          country: string
          created_at?: string | null
          description?: string | null
          id?: number
          latitude?: number | null
          longitude?: number | null
          name: string
          status?: string
          tenant_id: number
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          country?: string
          created_at?: string | null
          description?: string | null
          id?: number
          latitude?: number | null
          longitude?: number | null
          name?: string
          status?: string
          tenant_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consignment_locations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consignment_locations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants_public"
            referencedColumns: ["id"]
          },
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
      discounts: {
        Row: {
          active: boolean
          created_at: string
          created_by: string | null
          id: string
          name: string
          scope: Database["public"]["Enums"]["discount_scope"]
          tenant_id: number
          type: Database["public"]["Enums"]["discount_type"]
          valid_from: string | null
          valid_to: string | null
          value: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          scope: Database["public"]["Enums"]["discount_scope"]
          tenant_id: number
          type: Database["public"]["Enums"]["discount_type"]
          valid_from?: string | null
          valid_to?: string | null
          value: number
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          scope?: Database["public"]["Enums"]["discount_scope"]
          tenant_id?: number
          type?: Database["public"]["Enums"]["discount_type"]
          valid_from?: string | null
          valid_to?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "discounts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discounts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants_public"
            referencedColumns: ["id"]
          },
        ]
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
      modifier_groups: {
        Row: {
          active: boolean
          created_at: string
          display_order: number
          id: string
          max_selections: number
          min_selections: number
          name: string
          product_id: number
          tenant_id: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          display_order?: number
          id?: string
          max_selections?: number
          min_selections?: number
          name: string
          product_id: number
          tenant_id: number
        }
        Update: {
          active?: boolean
          created_at?: string
          display_order?: number
          id?: string
          max_selections?: number
          min_selections?: number
          name?: string
          product_id?: number
          tenant_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "modifier_groups_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "modifier_groups_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "top_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "modifier_groups_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "modifier_groups_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants_public"
            referencedColumns: ["id"]
          },
        ]
      }
      modifier_options: {
        Row: {
          active: boolean
          created_at: string
          display_order: number
          id: string
          modifier_group_id: string
          name: string
          price_delta: number
          tenant_id: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          display_order?: number
          id?: string
          modifier_group_id: string
          name: string
          price_delta?: number
          tenant_id: number
        }
        Update: {
          active?: boolean
          created_at?: string
          display_order?: number
          id?: string
          modifier_group_id?: string
          name?: string
          price_delta?: number
          tenant_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "modifier_options_modifier_group_id_fkey"
            columns: ["modifier_group_id"]
            isOneToOne: false
            referencedRelation: "modifier_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "modifier_options_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "modifier_options_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants_public"
            referencedColumns: ["id"]
          },
        ]
      }
      order_line_item_modifiers: {
        Row: {
          id: string
          modifier_group_name: string
          modifier_name: string
          modifier_option_id: string
          order_line_item_id: string
          price_delta: number
          tenant_id: number
        }
        Insert: {
          id?: string
          modifier_group_name: string
          modifier_name: string
          modifier_option_id: string
          order_line_item_id: string
          price_delta?: number
          tenant_id: number
        }
        Update: {
          id?: string
          modifier_group_name?: string
          modifier_name?: string
          modifier_option_id?: string
          order_line_item_id?: string
          price_delta?: number
          tenant_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_line_item_modifiers_modifier_option_id_fkey"
            columns: ["modifier_option_id"]
            isOneToOne: false
            referencedRelation: "modifier_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_line_item_modifiers_order_line_item_id_fkey"
            columns: ["order_line_item_id"]
            isOneToOne: false
            referencedRelation: "order_line_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_line_item_modifiers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_line_item_modifiers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants_public"
            referencedColumns: ["id"]
          },
        ]
      }
      order_line_items: {
        Row: {
          created_at: string
          id: string
          order_id: number
          product_id: number
          product_name: string
          quantity: number
          subtotal: number
          tenant_id: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: number
          product_id: number
          product_name: string
          quantity: number
          subtotal: number
          tenant_id: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: number
          product_id?: number
          product_name?: string
          quantity?: number
          subtotal?: number
          tenant_id?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_line_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_line_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_line_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "top_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_line_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_line_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants_public"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          checkout_id: string | null
          created_at: string | null
          customer_id: number | null
          discount_amount: number | null
          discount_id: string | null
          discount_metadata: Json | null
          discount_snapshot: Json | null
          id: number
          items: Json
          notes: string | null
          payment_id: string | null
          payment_method: string | null
          status: string
          tenant_id: number | null
          total: number
          total_before_discount: number | null
          updated_at: string | null
        }
        Insert: {
          checkout_id?: string | null
          created_at?: string | null
          customer_id?: number | null
          discount_amount?: number | null
          discount_id?: string | null
          discount_metadata?: Json | null
          discount_snapshot?: Json | null
          id?: number
          items?: Json
          notes?: string | null
          payment_id?: string | null
          payment_method?: string | null
          status?: string
          tenant_id?: number | null
          total: number
          total_before_discount?: number | null
          updated_at?: string | null
        }
        Update: {
          checkout_id?: string | null
          created_at?: string | null
          customer_id?: number | null
          discount_amount?: number | null
          discount_id?: string | null
          discount_metadata?: Json | null
          discount_snapshot?: Json | null
          id?: number
          items?: Json
          notes?: string | null
          payment_id?: string | null
          payment_method?: string | null
          status?: string
          tenant_id?: number | null
          total?: number
          total_before_discount?: number | null
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
            foreignKeyName: "orders_discount_id_fkey"
            columns: ["discount_id"]
            isOneToOne: false
            referencedRelation: "discounts"
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
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      pdf_processing_log: {
        Row: {
          file_hash: string
          filename: string
          id: string
          processed_at: string | null
          status: string | null
          transactions_extracted: number | null
        }
        Insert: {
          file_hash: string
          filename: string
          id?: string
          processed_at?: string | null
          status?: string | null
          transactions_extracted?: number | null
        }
        Update: {
          file_hash?: string
          filename?: string
          id?: string
          processed_at?: string | null
          status?: string | null
          transactions_extracted?: number | null
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
          whatsapp_number: string | null
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
          whatsapp_number?: string | null
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
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          account_number: string | null
          amount_pesos: number | null
          amount_usd: number | null
          category: string | null
          created_at: string | null
          description: string
          file_hash: string
          id: string
          raw_reference: string | null
          source: string
          statement_period: string
          transaction_date: string
        }
        Insert: {
          account_number?: string | null
          amount_pesos?: number | null
          amount_usd?: number | null
          category?: string | null
          created_at?: string | null
          description: string
          file_hash: string
          id?: string
          raw_reference?: string | null
          source: string
          statement_period: string
          transaction_date: string
        }
        Update: {
          account_number?: string | null
          amount_pesos?: number | null
          amount_usd?: number | null
          category?: string | null
          created_at?: string | null
          description?: string
          file_hash?: string
          id?: string
          raw_reference?: string | null
          source?: string
          statement_period?: string
          transaction_date?: string
        }
        Relationships: []
      }
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
          },
          {
            foreignKeyName: "users_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants_public"
            referencedColumns: ["id"]
          },
        ]
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
      mv_discounts: {
        Row: {
          avg_discount_percentage: number | null
          discount_code: string | null
          discount_source: string | null
          order_date: string | null
          tenant_id: number | null
          total_discount_amount: number | null
          usage_count: number | null
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
      mv_payment_methods: {
        Row: {
          order_count: number | null
          order_date: string | null
          payment_method: string | null
          revenue: number | null
          tenant_id: number | null
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
      mv_top_categories: {
        Row: {
          category: string | null
          order_count: number | null
          order_date: string | null
          revenue: number | null
          tenant_id: number | null
          units_sold: number | null
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
      mv_top_products: {
        Row: {
          order_date: string | null
          product_id: number | null
          product_name: string | null
          revenue: number | null
          tenant_id: number | null
          units_sold: number | null
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
      is_superadmin: { Args: never; Returns: boolean }
      refresh_analytics_views: { Args: never; Returns: undefined }
    }
    Enums: {
      discount_scope: "order" | "item"
      discount_type: "fixed" | "percentage"
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
      discount_scope: ["order", "item"],
      discount_type: ["fixed", "percentage"],
    },
  },
} as const
