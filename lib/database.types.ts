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
      admin_users: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string | null
          phone_number: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
          phone_number?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          phone_number?: string | null
        }
        Relationships: []
      }
      cms_page_content: {
        Row: {
          approved: boolean
          body_en: string | null
          body_es_draft: string | null
          body_es_published: string | null
          category: string | null
          created_at: string
          created_by: string | null
          id: string
          page_key: string
          sort: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          approved?: boolean
          body_en?: string | null
          body_es_draft?: string | null
          body_es_published?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          page_key: string
          sort?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          approved?: boolean
          body_en?: string | null
          body_es_draft?: string | null
          body_es_published?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          page_key?: string
          sort?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      media_assets: {
        Row: {
          asset_key: string | null
          asset_type: Database["public"]["Enums"]["asset_type"]
          bucket: string
          category: Database["public"]["Enums"]["photo_category"]
          created_at: string | null
          description: string | null
          id: string
          path: string
          public: boolean
          session_id: string | null
          sort: number
          title: string
          updated_at: string | null
        }
        Insert: {
          asset_key?: string | null
          asset_type?: Database["public"]["Enums"]["asset_type"]
          bucket: string
          category?: Database["public"]["Enums"]["photo_category"]
          created_at?: string | null
          description?: string | null
          id?: string
          path: string
          public: boolean
          session_id?: string | null
          sort?: number
          title: string
          updated_at?: string | null
        }
        Update: {
          asset_key?: string | null
          asset_type?: Database["public"]["Enums"]["asset_type"]
          bucket?: string
          category?: Database["public"]["Enums"]["photo_category"]
          created_at?: string | null
          description?: string | null
          id?: string
          path?: string
          public?: boolean
          session_id?: string | null
          sort?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_assets_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          client_names: string[] | null
          created_at: string
          deleted_at: string | null
          group_size: number | null
          id: string
          lesson_status: Database["public"]["Enums"]["lesson_status"] | null
          paid: number
          session_time: string | null
          tip: number | null
        }
        Insert: {
          client_names?: string[] | null
          created_at?: string
          deleted_at?: string | null
          group_size?: number | null
          id?: string
          lesson_status?: Database["public"]["Enums"]["lesson_status"] | null
          paid?: number
          session_time?: string | null
          tip?: number | null
        }
        Update: {
          client_names?: string[] | null
          created_at?: string
          deleted_at?: string | null
          group_size?: number | null
          id?: string
          lesson_status?: Database["public"]["Enums"]["lesson_status"] | null
          paid?: number
          session_time?: string | null
          tip?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_create_session: {
        Args: {
          p_client_names?: string[]
          p_group_size?: number
          p_lesson_status?: Database["public"]["Enums"]["lesson_status"]
          p_paid?: number
          p_session_time?: string
          p_tip?: number
        }
        Returns: {
          client_names: string[] | null
          created_at: string
          deleted_at: string | null
          group_size: number | null
          id: string
          lesson_status: Database["public"]["Enums"]["lesson_status"] | null
          paid: number
          session_time: string | null
          tip: number | null
        }
        SetofOptions: {
          from: "*"
          to: "sessions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_delete_page_content: {
        Args: { p_page_key: string }
        Returns: undefined
      }
      admin_delete_session: { Args: { p_id: string }; Returns: undefined }
      admin_hard_delete_session: { Args: { p_id: string }; Returns: undefined }
      admin_list_media_assets: {
        Args: never
        Returns: {
          asset_key: string | null
          asset_type: Database["public"]["Enums"]["asset_type"]
          bucket: string
          category: Database["public"]["Enums"]["photo_category"]
          created_at: string | null
          description: string | null
          id: string
          path: string
          public: boolean
          session_id: string | null
          sort: number
          title: string
          updated_at: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "media_assets"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      admin_list_sessions:
        | {
            Args: never
            Returns: {
              client_names: string[] | null
              created_at: string
              deleted_at: string | null
              group_size: number | null
              id: string
              lesson_status: Database["public"]["Enums"]["lesson_status"] | null
              paid: number
              session_time: string | null
              tip: number | null
            }[]
            SetofOptions: {
              from: "*"
              to: "sessions"
              isOneToOne: false
              isSetofReturn: true
            }
          }
        | {
            Args: { include_deleted?: boolean }
            Returns: {
              client_names: string[] | null
              created_at: string
              deleted_at: string | null
              group_size: number | null
              id: string
              lesson_status: Database["public"]["Enums"]["lesson_status"] | null
              paid: number
              session_time: string | null
              tip: number | null
            }[]
            SetofOptions: {
              from: "*"
              to: "sessions"
              isOneToOne: false
              isSetofReturn: true
            }
          }
      admin_publish_es: { Args: { p_page_key: string }; Returns: undefined }
      admin_restore_session: { Args: { p_id: string }; Returns: undefined }
      admin_update_session: {
        Args: {
          p_client_names?: string[]
          p_group_size?: number
          p_id: string
          p_lesson_status?: Database["public"]["Enums"]["lesson_status"]
          p_paid?: number
          p_session_time?: string
          p_tip?: number
        }
        Returns: {
          client_names: string[] | null
          created_at: string
          deleted_at: string | null
          group_size: number | null
          id: string
          lesson_status: Database["public"]["Enums"]["lesson_status"] | null
          paid: number
          session_time: string | null
          tip: number | null
        }
        SetofOptions: {
          from: "*"
          to: "sessions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_upsert_media_asset:
        | {
            Args: {
              p_asset_type: Database["public"]["Enums"]["asset_type"]
              p_bucket: string
              p_category: Database["public"]["Enums"]["photo_category"]
              p_description?: string
              p_id?: string
              p_path: string
              p_public: boolean
              p_session_id?: string
              p_sort?: number
              p_title: string
            }
            Returns: {
              asset_key: string | null
              asset_type: Database["public"]["Enums"]["asset_type"]
              bucket: string
              category: Database["public"]["Enums"]["photo_category"]
              created_at: string | null
              description: string | null
              id: string
              path: string
              public: boolean
              session_id: string | null
              sort: number
              title: string
              updated_at: string | null
            }
            SetofOptions: {
              from: "*"
              to: "media_assets"
              isOneToOne: true
              isSetofReturn: false
            }
          }
        | {
            Args: {
              p_asset_key?: string
              p_asset_type: Database["public"]["Enums"]["asset_type"]
              p_bucket: string
              p_category: Database["public"]["Enums"]["photo_category"]
              p_description?: string
              p_id?: string
              p_path: string
              p_public: boolean
              p_session_id?: string
              p_sort?: number
              p_title: string
            }
            Returns: {
              asset_key: string | null
              asset_type: Database["public"]["Enums"]["asset_type"]
              bucket: string
              category: Database["public"]["Enums"]["photo_category"]
              created_at: string | null
              description: string | null
              id: string
              path: string
              public: boolean
              session_id: string | null
              sort: number
              title: string
              updated_at: string | null
            }
            SetofOptions: {
              from: "*"
              to: "media_assets"
              isOneToOne: true
              isSetofReturn: false
            }
          }
      admin_upsert_page_content: {
        Args: {
          p_approved?: boolean
          p_body_en?: string
          p_body_es_draft?: string
          p_body_es_published?: string
          p_category?: string
          p_page_key: string
          p_sort?: number
        }
        Returns: undefined
      }
      get_page_content: {
        Args: { p_locale?: string; p_page_key: string }
        Returns: {
          body: string
          locale: string
          page_key: string
          updated_at: string
        }[]
      }
      get_public_media_asset_by_key: {
        Args: { p_asset_key: string }
        Returns: {
          asset_key: string | null
          asset_type: Database["public"]["Enums"]["asset_type"]
          bucket: string
          category: Database["public"]["Enums"]["photo_category"]
          created_at: string | null
          description: string | null
          id: string
          path: string
          public: boolean
          session_id: string | null
          sort: number
          title: string
          updated_at: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "media_assets"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_public_media_assets: {
        Args: { p_category?: Database["public"]["Enums"]["photo_category"] }
        Returns: {
          asset_key: string | null
          asset_type: Database["public"]["Enums"]["asset_type"]
          bucket: string
          category: Database["public"]["Enums"]["photo_category"]
          created_at: string | null
          description: string | null
          id: string
          path: string
          public: boolean
          session_id: string | null
          sort: number
          title: string
          updated_at: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "media_assets"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_public_media_assets_by_prefix: {
        Args: { p_prefix: string }
        Returns: {
          asset_key: string | null
          asset_type: Database["public"]["Enums"]["asset_type"]
          bucket: string
          category: Database["public"]["Enums"]["photo_category"]
          created_at: string | null
          description: string | null
          id: string
          path: string
          public: boolean
          session_id: string | null
          sort: number
          title: string
          updated_at: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "media_assets"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_public_sessions: {
        Args: never
        Returns: {
          client_names: string[] | null
          created_at: string
          deleted_at: string | null
          group_size: number | null
          id: string
          lesson_status: Database["public"]["Enums"]["lesson_status"] | null
          paid: number
          session_time: string | null
          tip: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "sessions"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      is_admin: { Args: never; Returns: boolean }
      is_valid_json: { Args: { p_text: string }; Returns: boolean }
    }
    Enums: {
      asset_type: "video" | "photo"
      Days_of_the_week:
        | "Sunday"
        | "Monday"
        | "Tuesday"
        | "Wednesday"
        | "Thursday"
        | "Friday"
        | "Saturday"
      lesson_status:
        | "booked"
        | "completed"
        | "canceled_with_refund"
        | "canceled_without_refund"
      photo_category:
        | "logo"
        | "hero"
        | "lessons"
        | "web_content"
        | "uncategorized"
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
      asset_type: ["video", "photo"],
      Days_of_the_week: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      lesson_status: [
        "booked",
        "completed",
        "canceled_with_refund",
        "canceled_without_refund",
      ],
      photo_category: [
        "logo",
        "hero",
        "lessons",
        "web_content",
        "uncategorized",
      ],
    },
  },
} as const
