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
      ai_providers: {
        Row: {
          api_key_encrypted: string | null
          created_at: string | null
          display_name: string
          id: string
          is_active: boolean | null
          model_name: string | null
          priority: string | null
          provider_name: string
          updated_at: string | null
        }
        Insert: {
          api_key_encrypted?: string | null
          created_at?: string | null
          display_name: string
          id?: string
          is_active?: boolean | null
          model_name?: string | null
          priority?: string | null
          provider_name: string
          updated_at?: string | null
        }
        Update: {
          api_key_encrypted?: string | null
          created_at?: string | null
          display_name?: string
          id?: string
          is_active?: boolean | null
          model_name?: string | null
          priority?: string | null
          provider_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_avatar: string | null
          author_bio: string | null
          author_name: string | null
          category: string | null
          character_image: string | null
          content: string | null
          cover_image: string | null
          created_at: string
          deleted_at: string | null
          excerpt: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          published: boolean | null
          scheduled_at: string | null
          show_in_banner: boolean
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
          views_count: number | null
        }
        Insert: {
          author_avatar?: string | null
          author_bio?: string | null
          author_name?: string | null
          category?: string | null
          character_image?: string | null
          content?: string | null
          cover_image?: string | null
          created_at?: string
          deleted_at?: string | null
          excerpt?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published?: boolean | null
          scheduled_at?: string | null
          show_in_banner?: boolean
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
          views_count?: number | null
        }
        Update: {
          author_avatar?: string | null
          author_bio?: string | null
          author_name?: string | null
          category?: string | null
          character_image?: string | null
          content?: string | null
          cover_image?: string | null
          created_at?: string
          deleted_at?: string | null
          excerpt?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published?: boolean | null
          scheduled_at?: string | null
          show_in_banner?: boolean
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          views_count?: number | null
        }
        Relationships: []
      }
      chat_agent_config: {
        Row: {
          active: boolean
          avoid_topics: string
          fallback_message: string
          few_shot_examples: Json
          greeting: string
          id: string
          instructions: string
          temperature: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          avoid_topics?: string
          fallback_message?: string
          few_shot_examples?: Json
          greeting?: string
          id?: string
          instructions?: string
          temperature?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          avoid_topics?: string
          fallback_message?: string
          few_shot_examples?: Json
          greeting?: string
          id?: string
          instructions?: string
          temperature?: number
          updated_at?: string
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          session_id: string
          status: string
          updated_at: string
          visitor_email: string | null
          visitor_name: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          session_id: string
          status?: string
          updated_at?: string
          visitor_email?: string | null
          visitor_name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          session_id?: string
          status?: string
          updated_at?: string
          visitor_email?: string | null
          visitor_name?: string | null
        }
        Relationships: []
      }
      chat_knowledge: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          title: string
        }
        Insert: {
          category?: string
          content: string
          created_at?: string
          id?: string
          title: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          title?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role?: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      client_history: {
        Row: {
          changed_by: string | null
          client_id: string
          created_at: string
          field_changed: string
          id: string
          new_value: string | null
          old_value: string | null
        }
        Insert: {
          changed_by?: string | null
          client_id: string
          created_at?: string
          field_changed: string
          id?: string
          new_value?: string | null
          old_value?: string | null
        }
        Update: {
          changed_by?: string | null
          client_id?: string
          created_at?: string
          field_changed?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          conversation_id: string | null
          created_at: string
          email: string | null
          id: string
          kanban_entered_at: string | null
          name: string
          notes: string | null
          phone: string | null
          source: string
          status: string
          updated_at: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          kanban_entered_at?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          source?: string
          status?: string
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          conversation_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          kanban_entered_at?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          source?: string
          status?: string
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      kanban_columns: {
        Row: {
          color: string | null
          created_at: string
          id: string
          is_fixed: boolean
          name: string
          position: number
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          is_fixed?: boolean
          name: string
          position?: number
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          is_fixed?: boolean
          name?: string
          position?: number
        }
        Relationships: []
      }
      kanban_leads: {
        Row: {
          column_id: string
          conversation_id: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          position: number
          source: string
          updated_at: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          column_id: string
          conversation_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          position?: number
          source?: string
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          column_id?: string
          conversation_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          position?: number
          source?: string
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kanban_leads_column_id_fkey"
            columns: ["column_id"]
            isOneToOne: false
            referencedRelation: "kanban_columns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kanban_leads_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      page_views: {
        Row: {
          browser: string | null
          city: string | null
          country: string | null
          created_at: string
          device_type: string | null
          id: string
          ip_hash: string | null
          language: string | null
          os: string | null
          page_url: string
          referrer: string | null
          region: string | null
          screen_height: number | null
          screen_width: number | null
          session_id: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          ip_hash?: string | null
          language?: string | null
          os?: string | null
          page_url: string
          referrer?: string | null
          region?: string | null
          screen_height?: number | null
          screen_width?: number | null
          session_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          ip_hash?: string | null
          language?: string | null
          os?: string | null
          page_url?: string
          referrer?: string | null
          region?: string | null
          screen_height?: number | null
          screen_width?: number | null
          session_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      site_content: {
        Row: {
          content: Json
          id: string
          locale: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content: Json
          id?: string
          locale?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content?: Json
          id?: string
          locale?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      site_sections: {
        Row: {
          created_at: string
          id: string
          is_visible: boolean
          locale: string
          position: number
          section_data: Json
          section_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_visible?: boolean
          locale?: string
          position?: number
          section_data?: Json
          section_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_visible?: boolean
          locale?: string
          position?: number
          section_data?: Json
          section_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      tracking_scripts: {
        Row: {
          body_code: string | null
          created_at: string
          head_code: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          body_code?: string | null
          created_at?: string
          head_code?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          body_code?: string | null
          created_at?: string
          head_code?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_config: {
        Row: {
          created_at: string
          id: string
          instance_name: string | null
          instance_status: string
          notifications_enabled: boolean
          notify_form_submission: boolean
          notify_new_chat: boolean
          notify_new_lead: boolean
          qr_code: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          instance_name?: string | null
          instance_status?: string
          notifications_enabled?: boolean
          notify_form_submission?: boolean
          notify_new_chat?: boolean
          notify_new_lead?: boolean
          qr_code?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          instance_name?: string | null
          instance_status?: string
          notifications_enabled?: boolean
          notify_form_submission?: boolean
          notify_new_chat?: boolean
          notify_new_lead?: boolean
          qr_code?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrypt_api_key: { Args: { encrypted_key: string }; Returns: string }
      encrypt_api_key: { Args: { plain_key: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
