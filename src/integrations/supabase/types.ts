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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      agents: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          department: string | null
          description: string | null
          email: string
          id: string
          max_chats: number | null
          name: string
          role: string
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          description?: string | null
          email: string
          id?: string
          max_chats?: number | null
          name: string
          role?: string
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          description?: string | null
          email?: string
          id?: string
          max_chats?: number | null
          name?: string
          role?: string
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          description: string | null
          id: string
          is_secret: boolean | null
          key: string
          updated_at: string | null
          updated_by: string | null
          value: string | null
          value_enc: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          is_secret?: boolean | null
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value?: string | null
          value_enc?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          is_secret?: boolean | null
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: string | null
          value_enc?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      contact_followups: {
        Row: {
          attempt: number
          conversation_id: string
          created_at: string
          id: string
          last_sent_at: string | null
          next_run_at: string
          status: string
        }
        Insert: {
          attempt?: number
          conversation_id: string
          created_at?: string
          id?: string
          last_sent_at?: string | null
          next_run_at?: string
          status?: string
        }
        Update: {
          attempt?: number
          conversation_id?: string
          created_at?: string
          id?: string
          last_sent_at?: string | null
          next_run_at?: string
          status?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          avatar_url: string | null
          birthdate: string | null
          cep: string | null
          city: string | null
          complement: string | null
          cpf: string | null
          created_at: string | null
          district: string | null
          email: string | null
          id: string
          name: string | null
          notes: string | null
          phone: string
          source: string | null
          stage: string | null
          state: string | null
          street: string | null
          street_number: string | null
          tags: string[] | null
          total_conversations: number | null
          updated_at: string | null
          vehicle_brand: string | null
          vehicle_model: string | null
          vehicle_year: number | null
        }
        Insert: {
          avatar_url?: string | null
          birthdate?: string | null
          cep?: string | null
          city?: string | null
          complement?: string | null
          cpf?: string | null
          created_at?: string | null
          district?: string | null
          email?: string | null
          id?: string
          name?: string | null
          notes?: string | null
          phone: string
          source?: string | null
          stage?: string | null
          state?: string | null
          street?: string | null
          street_number?: string | null
          tags?: string[] | null
          total_conversations?: number | null
          updated_at?: string | null
          vehicle_brand?: string | null
          vehicle_model?: string | null
          vehicle_year?: number | null
        }
        Update: {
          avatar_url?: string | null
          birthdate?: string | null
          cep?: string | null
          city?: string | null
          complement?: string | null
          cpf?: string | null
          created_at?: string | null
          district?: string | null
          email?: string | null
          id?: string
          name?: string | null
          notes?: string | null
          phone?: string
          source?: string | null
          stage?: string | null
          state?: string | null
          street?: string | null
          street_number?: string | null
          tags?: string[] | null
          total_conversations?: number | null
          updated_at?: string | null
          vehicle_brand?: string | null
          vehicle_model?: string | null
          vehicle_year?: number | null
        }
        Relationships: []
      }
      conversation_events: {
        Row: {
          agent_id: string | null
          conversation_id: string | null
          created_at: string | null
          event_type: string
          id: string
          meta: Json | null
        }
        Insert: {
          agent_id?: string | null
          conversation_id?: string | null
          created_at?: string | null
          event_type: string
          id?: string
          meta?: Json | null
        }
        Update: {
          agent_id?: string | null
          conversation_id?: string | null
          created_at?: string | null
          event_type?: string
          id?: string
          meta?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_events_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_events_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_labels: {
        Row: {
          conversation_id: string | null
          created_at: string | null
          id: string
          label_id: string | null
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          label_id?: string | null
        }
        Update: {
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          label_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_labels_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_labels_label_id_fkey"
            columns: ["label_id"]
            isOneToOne: false
            referencedRelation: "labels"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          agent_id: string | null
          ai_intent: string | null
          ai_summary: string | null
          assigned_department: string | null
          auto_reply_enabled: boolean | null
          bot_active: boolean | null
          bot_disabled_at: string | null
          channel: string | null
          contact_id: string | null
          created_at: string | null
          id: string
          instance_id: string | null
          last_automated_msg_at: string | null
          last_message: string | null
          last_message_at: string | null
          nps_comment: string | null
          nps_score: number | null
          priority: string | null
          resolved_at: string | null
          status: string
          subject: string | null
          team_id: string | null
          transferred_at: string | null
          transferred_from: string | null
          unread_count: number | null
          updated_at: string | null
          whatsapp_chat_id: string
        }
        Insert: {
          agent_id?: string | null
          ai_intent?: string | null
          ai_summary?: string | null
          assigned_department?: string | null
          auto_reply_enabled?: boolean | null
          bot_active?: boolean | null
          bot_disabled_at?: string | null
          channel?: string | null
          contact_id?: string | null
          created_at?: string | null
          id?: string
          instance_id?: string | null
          last_automated_msg_at?: string | null
          last_message?: string | null
          last_message_at?: string | null
          nps_comment?: string | null
          nps_score?: number | null
          priority?: string | null
          resolved_at?: string | null
          status?: string
          subject?: string | null
          team_id?: string | null
          transferred_at?: string | null
          transferred_from?: string | null
          unread_count?: number | null
          updated_at?: string | null
          whatsapp_chat_id: string
        }
        Update: {
          agent_id?: string | null
          ai_intent?: string | null
          ai_summary?: string | null
          assigned_department?: string | null
          auto_reply_enabled?: boolean | null
          bot_active?: boolean | null
          bot_disabled_at?: string | null
          channel?: string | null
          contact_id?: string | null
          created_at?: string | null
          id?: string
          instance_id?: string | null
          last_automated_msg_at?: string | null
          last_message?: string | null
          last_message_at?: string | null
          nps_comment?: string | null
          nps_score?: number | null
          priority?: string | null
          resolved_at?: string | null
          status?: string
          subject?: string | null
          team_id?: string | null
          transferred_at?: string | null
          transferred_from?: string | null
          unread_count?: number | null
          updated_at?: string | null
          whatsapp_chat_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_transferred_from_fkey"
            columns: ["transferred_from"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_conversations_instance_id"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      labels: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string | null
          content_type: string | null
          conversation_id: string
          created_at: string | null
          id: string
          is_internal: boolean | null
          media_mime: string | null
          media_url: string | null
          sender_id: string | null
          sender_type: string
          status: string | null
          wa_message_id: string | null
        }
        Insert: {
          content?: string | null
          content_type?: string | null
          conversation_id: string
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          media_mime?: string | null
          media_url?: string | null
          sender_id?: string | null
          sender_type: string
          status?: string | null
          wa_message_id?: string | null
        }
        Update: {
          content?: string | null
          content_type?: string | null
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          media_mime?: string | null
          media_url?: string | null
          sender_id?: string | null
          sender_type?: string
          status?: string | null
          wa_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          conversation_id: string | null
          created_at: string | null
          department: string | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string | null
          department?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          conversation_id?: string | null
          created_at?: string | null
          department?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          agent_id: string | null
          contact_id: string | null
          conversation_id: string | null
          created_at: string | null
          discount: number | null
          id: string
          items: Json
          notes: string | null
          proposal_number: string
          status: string | null
          subtotal: number | null
          total: number | null
          updated_at: string | null
          valid_until: string | null
        }
        Insert: {
          agent_id?: string | null
          contact_id?: string | null
          conversation_id?: string | null
          created_at?: string | null
          discount?: number | null
          id?: string
          items?: Json
          notes?: string | null
          proposal_number?: string
          status?: string | null
          subtotal?: number | null
          total?: number | null
          updated_at?: string | null
          valid_until?: string | null
        }
        Update: {
          agent_id?: string | null
          contact_id?: string | null
          conversation_id?: string | null
          created_at?: string | null
          discount?: number | null
          id?: string
          items?: Json
          notes?: string | null
          proposal_number?: string
          status?: string | null
          subtotal?: number | null
          total?: number | null
          updated_at?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      quick_replies: {
        Row: {
          agent_id: string | null
          content: string
          created_at: string | null
          id: string
          shortcut: string | null
          title: string
          use_count: number | null
        }
        Insert: {
          agent_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          shortcut?: string | null
          title: string
          use_count?: number | null
        }
        Update: {
          agent_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          shortcut?: string | null
          title?: string
          use_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quick_replies_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_results: {
        Row: {
          completed_at: string
          id: string
          lesson_id: string
          score: number
          total_questions: number
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          lesson_id: string
          score: number
          total_questions: number
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          lesson_id?: string
          score?: number
          total_questions?: number
          user_id?: string
        }
        Relationships: []
      }
      scheduled_messages: {
        Row: {
          agent_id: string | null
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          scheduled_for: string
          sent_at: string | null
          status: string
        }
        Insert: {
          agent_id?: string | null
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          scheduled_for: string
          sent_at?: string | null
          status?: string
        }
        Update: {
          agent_id?: string | null
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          scheduled_for?: string
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          agent_id: string | null
          created_at: string | null
          id: string
          role: string | null
          team_id: string | null
        }
        Insert: {
          agent_id?: string | null
          created_at?: string | null
          id?: string
          role?: string | null
          team_id?: string | null
        }
        Update: {
          agent_id?: string | null
          created_at?: string | null
          id?: string
          role?: string | null
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      waiting_queue: {
        Row: {
          contact_id: string | null
          conversation_id: string
          entered_at: string | null
          id: string
          metadata: Json | null
          priority: string | null
        }
        Insert: {
          contact_id?: string | null
          conversation_id: string
          entered_at?: string | null
          id?: string
          metadata?: Json | null
          priority?: string | null
        }
        Update: {
          contact_id?: string | null
          conversation_id?: string
          entered_at?: string | null
          id?: string
          metadata?: Json | null
          priority?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "waiting_queue_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waiting_queue_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: true
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_instances: {
        Row: {
          created_at: string | null
          display_name: string
          id: string
          instance_data: Json | null
          instance_key: string | null
          last_seen: string | null
          name: string
          phone_number: string | null
          provider: string
          qr_code: string | null
          status: string | null
          updated_at: string | null
          webhook_url: string | null
        }
        Insert: {
          created_at?: string | null
          display_name: string
          id?: string
          instance_data?: Json | null
          instance_key?: string | null
          last_seen?: string | null
          name: string
          phone_number?: string | null
          provider?: string
          qr_code?: string | null
          status?: string | null
          updated_at?: string | null
          webhook_url?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string
          id?: string
          instance_data?: Json | null
          instance_key?: string | null
          last_seen?: string | null
          name?: string
          phone_number?: string | null
          provider?: string
          qr_code?: string | null
          status?: string | null
          updated_at?: string | null
          webhook_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_whatsapp_instance: {
        Args: { _instance_id?: string; _instance_name?: string }
        Returns: Json
      }
      get_agents_with_email: {
        Args: never
        Returns: {
          avatar_url: string | null
          created_at: string | null
          department: string | null
          description: string | null
          email: string
          id: string
          max_chats: number | null
          name: string
          role: string
          status: string
          updated_at: string | null
          user_id: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "agents"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_my_roles: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      has_any_role: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "supervisor" | "agent"
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
      app_role: ["admin", "supervisor", "agent"],
    },
  },
} as const
