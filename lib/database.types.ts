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
      availability_exceptions: {
        Row: {
          created_at: string | null
          date: string
          end_time: string
          id: string
          is_blackout: boolean
          reason: string | null
          start_time: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          end_time: string
          id?: string
          is_blackout?: boolean
          reason?: string | null
          start_time: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          end_time?: string
          id?: string
          is_blackout?: boolean
          reason?: string | null
          start_time?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      availability_rules: {
        Row: {
          created_at: string | null
          end_time: string
          id: string
          is_active: boolean
          lesson_type_id: string | null
          start_time: string
          updated_at: string | null
          week_day: Database["public"]["Enums"]["Days_of_the_week"]
        }
        Insert: {
          created_at?: string | null
          end_time: string
          id?: string
          is_active?: boolean
          lesson_type_id?: string | null
          start_time: string
          updated_at?: string | null
          week_day: Database["public"]["Enums"]["Days_of_the_week"]
        }
        Update: {
          created_at?: string | null
          end_time?: string
          id?: string
          is_active?: boolean
          lesson_type_id?: string | null
          start_time?: string
          updated_at?: string | null
          week_day?: Database["public"]["Enums"]["Days_of_the_week"]
        }
        Relationships: [
          {
            foreignKeyName: "availability_rules_lesson_type_id_fkey"
            columns: ["lesson_type_id"]
            isOneToOne: false
            referencedRelation: "lesson_types"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          created_at: string | null
          customer_email: string
          customer_name: string
          customer_phone: string
          id: string
          party_size: number
          payment_intent_id: string | null
          status: string
          time_slot_id: string
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_email: string
          customer_name: string
          customer_phone: string
          id?: string
          party_size?: number
          payment_intent_id?: string | null
          status?: string
          time_slot_id: string
          total_amount?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          id?: string
          party_size?: number
          payment_intent_id?: string | null
          status?: string
          time_slot_id?: string
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_time_slot_id_fkey"
            columns: ["time_slot_id"]
            isOneToOne: false
            referencedRelation: "time_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_types: {
        Row: {
          created_at: string | null
          description: string
          duration_minutes: number
          id: string
          is_active: boolean
          location: string
          max_participants: number
          name: string
          price: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          duration_minutes?: number
          id?: string
          is_active?: boolean
          location?: string
          max_participants?: number
          name: string
          price?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          duration_minutes?: number
          id?: string
          is_active?: boolean
          location?: string
          max_participants?: number
          name?: string
          price?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      media_assets: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_featured: boolean
          sort_order: number
          title: string
          type: string
          updated_at: string | null
          url: string
          youtube_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean
          sort_order?: number
          title: string
          type: string
          updated_at?: string | null
          url: string
          youtube_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean
          sort_order?: number
          title?: string
          type?: string
          updated_at?: string | null
          url?: string
          youtube_id?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          booking_id: string
          created_at: string | null
          id: string
          net_amount: number
          status: string
          stripe_fee: number
          stripe_payment_intent_id: string
          updated_at: string | null
        }
        Insert: {
          amount?: number
          booking_id: string
          created_at?: string | null
          id?: string
          net_amount?: number
          status?: string
          stripe_fee?: number
          stripe_payment_intent_id: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string | null
          id?: string
          net_amount?: number
          status?: string
          stripe_fee?: number
          stripe_payment_intent_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      time_slots: {
        Row: {
          created_at: string | null
          current_bookings: number
          end_time: string
          id: string
          lesson_type_id: string
          max_participants: number
          start_time: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_bookings?: number
          end_time: string
          id?: string
          lesson_type_id: string
          max_participants?: number
          start_time: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_bookings?: number
          end_time?: string
          id?: string
          lesson_type_id?: string
          max_participants?: number
          start_time?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "time_slots_lesson_type_id_fkey"
            columns: ["lesson_type_id"]
            isOneToOne: false
            referencedRelation: "lesson_types"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      monthly_revenue: {
        Row: {
          gross_amount: number | null
          month: string | null
          net_amount: number | null
          payments_count: number | null
          stripe_fees: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      Days_of_the_week:
        | "Sunday"
        | "Monday"
        | "Tuesday"
        | "Wednesday"
        | "Thursday"
        | "Friday"
        | "Saturday"
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
      Days_of_the_week: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
    },
  },
} as const
