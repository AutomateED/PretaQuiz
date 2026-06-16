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
      archived_clients: {
        Row: {
          admin_notes: string | null
          archived_at: string | null
          archived_reason: string | null
          business_name: string | null
          created_at: string | null
          email: string
          id: string
          lead_count: number | null
          quiz_configs: Json | null
          subscription_status: string | null
          template_type: string | null
        }
        Insert: {
          admin_notes?: string | null
          archived_at?: string | null
          archived_reason?: string | null
          business_name?: string | null
          created_at?: string | null
          email: string
          id: string
          lead_count?: number | null
          quiz_configs?: Json | null
          subscription_status?: string | null
          template_type?: string | null
        }
        Update: {
          admin_notes?: string | null
          archived_at?: string | null
          archived_reason?: string | null
          business_name?: string | null
          created_at?: string | null
          email?: string
          id?: string
          lead_count?: number | null
          quiz_configs?: Json | null
          subscription_status?: string | null
          template_type?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          content: string
          created_at: string
          date: string
          excerpt: string
          id: string
          published: boolean
          slug: string
          title: string
        }
        Insert: {
          content?: string
          created_at?: string
          date?: string
          excerpt?: string
          id?: string
          published?: boolean
          slug: string
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          date?: string
          excerpt?: string
          id?: string
          published?: boolean
          slug?: string
          title?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          account_tier: string
          business_name: string
          created_at: string | null
          email: string
          id: string
          last_login: string | null
          monthly_lead_cap: number
          notes: string
          subscription_status: string
          template_type: string | null
        }
        Insert: {
          account_tier?: string
          business_name?: string
          created_at?: string | null
          email: string
          id?: string
          last_login?: string | null
          monthly_lead_cap?: number
          notes?: string
          subscription_status?: string
          template_type?: string | null
        }
        Update: {
          account_tier?: string
          business_name?: string
          created_at?: string | null
          email?: string
          id?: string
          last_login?: string | null
          monthly_lead_cap?: number
          notes?: string
          subscription_status?: string
          template_type?: string | null
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          answers: Json | null
          client_id: string | null
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          quiz_slug: string
          result_type: string | null
        }
        Insert: {
          answers?: Json | null
          client_id?: string | null
          created_at?: string | null
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          quiz_slug: string
          result_type?: string | null
        }
        Update: {
          answers?: Json | null
          client_id?: string | null
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          quiz_slug?: string
          result_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_configs: {
        Row: {
          brand_colour: string
          business_name: string
          client_id: string
          cta_tagline: string
          cta_text: string
          cta_url: string
          email: string
          email_config: Json | null
          font_family: string
          full_name: string
          id: string
          logo_url: string | null
          privacy_policy_url: string | null
          questions: Json
          quiz_name: string
          result_ctas: Json | null
          result_texts: Json
          result_titles: Json | null
          slug: string
          template_type: string
          updated_at: string | null
          webhook_url: string | null
        }
        Insert: {
          brand_colour?: string
          business_name?: string
          client_id: string
          cta_tagline?: string
          cta_text?: string
          cta_url?: string
          email?: string
          email_config?: Json | null
          font_family?: string
          full_name?: string
          id?: string
          logo_url?: string | null
          privacy_policy_url?: string | null
          questions?: Json
          quiz_name?: string
          result_ctas?: Json | null
          result_texts?: Json
          result_titles?: Json | null
          slug: string
          template_type?: string
          updated_at?: string | null
          webhook_url?: string | null
        }
        Update: {
          brand_colour?: string
          business_name?: string
          client_id?: string
          cta_tagline?: string
          cta_text?: string
          cta_url?: string
          email?: string
          email_config?: Json | null
          font_family?: string
          full_name?: string
          id?: string
          logo_url?: string | null
          privacy_policy_url?: string | null
          questions?: Json
          quiz_name?: string
          result_ctas?: Json | null
          result_texts?: Json
          result_titles?: Json | null
          slug?: string
          template_type?: string
          updated_at?: string | null
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_configs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist_signups: {
        Row: {
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      public_quiz_configs: {
        Row: {
          brand_colour: string | null
          business_name: string | null
          client_id: string | null
          cta_tagline: string | null
          cta_text: string | null
          cta_url: string | null
          font_family: string | null
          logo_url: string | null
          privacy_policy_url: string | null
          questions: Json | null
          quiz_name: string | null
          result_ctas: Json | null
          result_texts: Json | null
          result_titles: Json | null
          slug: string | null
          template_type: string | null
        }
        Insert: {
          brand_colour?: string | null
          business_name?: string | null
          client_id?: string | null
          cta_tagline?: string | null
          cta_text?: string | null
          cta_url?: string | null
          font_family?: string | null
          logo_url?: string | null
          privacy_policy_url?: string | null
          questions?: Json | null
          quiz_name?: string | null
          result_ctas?: Json | null
          result_texts?: Json | null
          result_titles?: Json | null
          slug?: string | null
          template_type?: string | null
        }
        Update: {
          brand_colour?: string | null
          business_name?: string | null
          client_id?: string | null
          cta_tagline?: string | null
          cta_text?: string | null
          cta_url?: string | null
          font_family?: string | null
          logo_url?: string | null
          privacy_policy_url?: string | null
          questions?: Json | null
          quiz_name?: string | null
          result_ctas?: Json | null
          result_texts?: Json | null
          result_titles?: Json | null
          slug?: string | null
          template_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_configs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      check_lead_cap: { Args: { p_client_id: string }; Returns: boolean }
      get_monthly_lead_count: { Args: { p_client_id: string }; Returns: number }
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
