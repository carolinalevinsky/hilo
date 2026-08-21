export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          created_at: string
          duration_minutes: number
          focus_goal_id: string | null
          gcal_event_id: string | null
          id: string
          note: string | null
          patient_id: string
          practitioner_id: string
          schedule_id: string | null
          scheduled_on: string
          source: string
          start_time: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number
          focus_goal_id?: string | null
          gcal_event_id?: string | null
          id?: string
          note?: string | null
          patient_id: string
          practitioner_id: string
          schedule_id?: string | null
          scheduled_on: string
          source?: string
          start_time: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number
          focus_goal_id?: string | null
          gcal_event_id?: string | null
          id?: string
          note?: string | null
          patient_id?: string
          practitioner_id?: string
          schedule_id?: string | null
          scheduled_on?: string
          source?: string
          start_time?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_focus_goal_id_fkey"
            columns: ["focus_goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "practitioners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          ai_generated: boolean
          ai_model: string | null
          analysis: string | null
          assessed_on: string
          created_at: string
          id: string
          instrument: string
          observations: string | null
          patient_id: string
          practitioner_id: string
          results: Json
          updated_at: string
        }
        Insert: {
          ai_generated?: boolean
          ai_model?: string | null
          analysis?: string | null
          assessed_on?: string
          created_at?: string
          id?: string
          instrument: string
          observations?: string | null
          patient_id: string
          practitioner_id: string
          results?: Json
          updated_at?: string
        }
        Update: {
          ai_generated?: boolean
          ai_model?: string | null
          analysis?: string | null
          assessed_on?: string
          created_at?: string
          id?: string
          instrument?: string
          observations?: string | null
          patient_id?: string
          practitioner_id?: string
          results?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "practitioners"
            referencedColumns: ["id"]
          },
        ]
      }
      assistant_questions: {
        Row: {
          created_at: string
          id: string
          practitioner_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          practitioner_id: string
        }
        Update: {
          created_at?: string
          id?: string
          practitioner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assistant_questions_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "practitioners"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          created_at: string
          entity: string
          entity_id: string | null
          id: string
          practitioner_id: string
        }
        Insert: {
          action: string
          created_at?: string
          entity: string
          entity_id?: string | null
          id?: string
          practitioner_id: string
        }
        Update: {
          action?: string
          created_at?: string
          entity?: string
          entity_id?: string | null
          id?: string
          practitioner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "practitioners"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_requests: {
        Row: {
          created_at: string
          id: string
          name: string
          note: string | null
          patient_id: string | null
          phone: string
          practitioner_id: string
          preferred_time: string | null
          preferred_weekday: number | null
          status: string
          submitter_hash: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          note?: string | null
          patient_id?: string | null
          phone: string
          practitioner_id: string
          preferred_time?: string | null
          preferred_weekday?: number | null
          status?: string
          submitter_hash?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          note?: string | null
          patient_id?: string | null
          phone?: string
          practitioner_id?: string
          preferred_time?: string | null
          preferred_weekday?: number | null
          status?: string
          submitter_hash?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_requests_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_requests_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "practitioners"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_progress: {
        Row: {
          created_at: string
          goal_id: string
          id: string
          patient_id: string
          practitioner_id: string
          recorded_on: string
          value: number
        }
        Insert: {
          created_at?: string
          goal_id: string
          id?: string
          patient_id: string
          practitioner_id: string
          recorded_on?: string
          value: number
        }
        Update: {
          created_at?: string
          goal_id?: string
          id?: string
          patient_id?: string
          practitioner_id?: string
          recorded_on?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "goal_progress_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_progress_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_progress_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "practitioners"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          patient_id: string
          position: number
          practitioner_id: string
          progress: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          patient_id: string
          position?: number
          practitioner_id: string
          progress?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          patient_id?: string
          position?: number
          practitioner_id?: string
          progress?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "practitioners"
            referencedColumns: ["id"]
          },
        ]
      }
      materials: {
        Row: {
          age_range: string | null
          area: string
          author_name: string | null
          content: string
          copied_from: string | null
          created_at: string
          discipline: string | null
          file_path: string | null
          file_type: string | null
          focus: string | null
          id: string
          kind: string
          objective: string | null
          practitioner_id: string | null
          search_text: string | null
          source: string
          title: string
          updated_at: string
          visibility: string
        }
        Insert: {
          age_range?: string | null
          area: string
          author_name?: string | null
          content: string
          copied_from?: string | null
          created_at?: string
          discipline?: string | null
          file_path?: string | null
          file_type?: string | null
          focus?: string | null
          id?: string
          kind?: string
          objective?: string | null
          practitioner_id?: string | null
          search_text?: string | null
          source?: string
          title: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          age_range?: string | null
          area?: string
          author_name?: string | null
          content?: string
          copied_from?: string | null
          created_at?: string
          discipline?: string | null
          file_path?: string | null
          file_type?: string | null
          focus?: string | null
          id?: string
          kind?: string
          objective?: string | null
          practitioner_id?: string | null
          search_text?: string | null
          source?: string
          title?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "materials_copied_from_fkey"
            columns: ["copied_from"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "materials_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "practitioners"
            referencedColumns: ["id"]
          },
        ]
      }
      mp_accounts: {
        Row: {
          access_token: string
          connected_at: string
          payment_link: string | null
          practitioner_id: string
          updated_at: string
        }
        Insert: {
          access_token: string
          connected_at?: string
          payment_link?: string | null
          practitioner_id: string
          updated_at?: string
        }
        Update: {
          access_token?: string
          connected_at?: string
          payment_link?: string | null
          practitioner_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mp_accounts_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: true
            referencedRelation: "practitioners"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          age_group: string
          archived_at: string | null
          billing_frequency: string
          color: string | null
          consent_signed_at: string | null
          created_at: string
          date_of_birth: string | null
          deleted_at: string | null
          expected_sessions_per_month: number | null
          full_name: string
          health_insurer: string | null
          id: string
          phone: string | null
          photo_path: string | null
          practitioner_id: string
          referral_reason: string | null
          room_id: string | null
          school: string | null
          school_level: string | null
          search_text: string | null
          session_fee: number | null
          start_date: string | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          age_group?: string
          archived_at?: string | null
          billing_frequency?: string
          color?: string | null
          consent_signed_at?: string | null
          created_at?: string
          date_of_birth?: string | null
          deleted_at?: string | null
          expected_sessions_per_month?: number | null
          full_name: string
          health_insurer?: string | null
          id?: string
          phone?: string | null
          photo_path?: string | null
          practitioner_id: string
          referral_reason?: string | null
          room_id?: string | null
          school?: string | null
          school_level?: string | null
          search_text?: string | null
          session_fee?: number | null
          start_date?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          age_group?: string
          archived_at?: string | null
          billing_frequency?: string
          color?: string | null
          consent_signed_at?: string | null
          created_at?: string
          date_of_birth?: string | null
          deleted_at?: string | null
          expected_sessions_per_month?: number | null
          full_name?: string
          health_insurer?: string | null
          id?: string
          phone?: string | null
          photo_path?: string | null
          practitioner_id?: string
          referral_reason?: string | null
          room_id?: string | null
          school?: string | null
          school_level?: string | null
          search_text?: string | null
          session_fee?: number | null
          start_date?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "practitioners"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          method: string
          mp_payment_id: string | null
          note: string | null
          paid_on: string
          patient_id: string
          period: string
          practitioner_id: string
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          method?: string
          mp_payment_id?: string | null
          note?: string | null
          paid_on?: string
          patient_id: string
          period: string
          practitioner_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          method?: string
          mp_payment_id?: string | null
          note?: string | null
          paid_on?: string
          patient_id?: string
          period?: string
          practitioner_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "practitioners"
            referencedColumns: ["id"]
          },
        ]
      }
      practitioners: {
        Row: {
          created_at: string
          digest_sent_at: string | null
          discipline: string
          email: string
          full_name: string
          id: string
          onboarded_at: string | null
          phone: string | null
          plan: string
          slug: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          digest_sent_at?: string | null
          discipline: string
          email: string
          full_name: string
          id: string
          onboarded_at?: string | null
          phone?: string | null
          plan?: string
          slug?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          digest_sent_at?: string | null
          discipline?: string
          email?: string
          full_name?: string
          id?: string
          onboarded_at?: string | null
          phone?: string | null
          plan?: string
          slug?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          ai_generated: boolean
          ai_model: string | null
          content: string | null
          created_at: string
          id: string
          input_notes: string | null
          issued_on: string
          patient_id: string
          practitioner_id: string
          recipient: string
          title: string
          updated_at: string
        }
        Insert: {
          ai_generated?: boolean
          ai_model?: string | null
          content?: string | null
          created_at?: string
          id?: string
          input_notes?: string | null
          issued_on?: string
          patient_id: string
          practitioner_id: string
          recipient: string
          title: string
          updated_at?: string
        }
        Update: {
          ai_generated?: boolean
          ai_model?: string | null
          content?: string | null
          created_at?: string
          id?: string
          input_notes?: string | null
          issued_on?: string
          patient_id?: string
          practitioner_id?: string
          recipient?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "practitioners"
            referencedColumns: ["id"]
          },
        ]
      }
      schedules: {
        Row: {
          created_at: string
          duration_minutes: number
          ends_on: string | null
          frequency: string
          id: string
          is_active: boolean
          patient_id: string
          practitioner_id: string
          start_time: string
          starts_on: string
          updated_at: string
          weekday: number
        }
        Insert: {
          created_at?: string
          duration_minutes?: number
          ends_on?: string | null
          frequency?: string
          id?: string
          is_active?: boolean
          patient_id: string
          practitioner_id: string
          start_time: string
          starts_on?: string
          updated_at?: string
          weekday: number
        }
        Update: {
          created_at?: string
          duration_minutes?: number
          ends_on?: string | null
          frequency?: string
          id?: string
          is_active?: boolean
          patient_id?: string
          practitioner_id?: string
          start_time?: string
          starts_on?: string
          updated_at?: string
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "schedules_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "practitioners"
            referencedColumns: ["id"]
          },
        ]
      }
      session_goals: {
        Row: {
          goal_id: string
          practitioner_id: string
          session_id: string
        }
        Insert: {
          goal_id: string
          practitioner_id: string
          session_id: string
        }
        Update: {
          goal_id?: string
          practitioner_id?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_goals_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_goals_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "practitioners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_goals_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_plan_items: {
        Row: {
          created_at: string
          goal_id: string | null
          id: string
          material_id: string | null
          patient_id: string
          position: number
          practitioner_id: string
          title: string | null
        }
        Insert: {
          created_at?: string
          goal_id?: string | null
          id?: string
          material_id?: string | null
          patient_id: string
          position?: number
          practitioner_id: string
          title?: string | null
        }
        Update: {
          created_at?: string
          goal_id?: string | null
          id?: string
          material_id?: string | null
          patient_id?: string
          position?: number
          practitioner_id?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_plan_items_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_plan_items_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_plan_items_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_plan_items_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "practitioners"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          appointment_id: string | null
          created_at: string
          held_on: string
          id: string
          patient_id: string
          practitioner_id: string
          private_note: string | null
          progress_note: string | null
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string
          held_on?: string
          id?: string
          patient_id: string
          practitioner_id: string
          private_note?: string | null
          progress_note?: string | null
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          created_at?: string
          held_on?: string
          id?: string
          patient_id?: string
          practitioner_id?: string
          private_note?: string | null
          progress_note?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "practitioners"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      practitioner_by_slug: {
        Args: { lookup_slug: string }
        Returns: {
          discipline: string
          full_name: string
          id: string
        }[]
      }
      slugify: { Args: { input: string }; Returns: string }
      unaccent_fallback: { Args: { input: string }; Returns: string }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

