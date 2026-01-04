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
      booking_requests: {
        Row: {
          amount_paid_cents: number
          approved_session_id: string | null
          balance_cents: number | null
          bill_total_cents: number | null
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string
          decided_at: string | null
          decided_by: string | null
          decision_reason: string | null
          id: string
          manual_bill_total_cents: number | null
          manual_pricing: boolean
          notes: string | null
          party_names: string[] | null
          party_size: number
          requested_date: string
          requested_lesson_type: string
          requested_time_labels: string[]
          requested_time_slots: string | null
          selected_time_slot: string | null
          status: Database["public"]["Enums"]["booking_request_status"]
          updated_at: string
        }
        Insert: {
          amount_paid_cents?: number
          approved_session_id?: string | null
          balance_cents?: number | null
          bill_total_cents?: number | null
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone: string
          decided_at?: string | null
          decided_by?: string | null
          decision_reason?: string | null
          id?: string
          manual_bill_total_cents?: number | null
          manual_pricing?: boolean
          notes?: string | null
          party_names?: string[] | null
          party_size: number
          requested_date: string
          requested_lesson_type: string
          requested_time_labels?: string[]
          requested_time_slots?: string | null
          selected_time_slot?: string | null
          status?: Database["public"]["Enums"]["booking_request_status"]
          updated_at?: string
        }
        Update: {
          amount_paid_cents?: number
          approved_session_id?: string | null
          balance_cents?: number | null
          bill_total_cents?: number | null
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          decided_at?: string | null
          decided_by?: string | null
          decision_reason?: string | null
          id?: string
          manual_bill_total_cents?: number | null
          manual_pricing?: boolean
          notes?: string | null
          party_names?: string[] | null
          party_size?: number
          requested_date?: string
          requested_lesson_type?: string
          requested_time_labels?: string[]
          requested_time_slots?: string | null
          selected_time_slot?: string | null
          status?: Database["public"]["Enums"]["booking_request_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_requests_approved_session_id_fkey"
            columns: ["approved_session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_requests_decided_by_fkey"
            columns: ["decided_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_requests_requested_lesson_type_fk"
            columns: ["requested_lesson_type"]
            isOneToOne: false
            referencedRelation: "lesson_types"
            referencedColumns: ["key"]
          },
        ]
      }
      business_expenses: {
        Row: {
          category: Database["public"]["Enums"]["finance_category"]
          created_at: string
          description: string | null
          expense_date: string
          id: string
          is_refund: boolean
          notes: string | null
          parent_expense_id: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          subtotal_cents: number | null
          tax_cents: number | null
          tip_cents: number | null
          total_cents: number
          transaction_id: string | null
          updated_at: string
          vendor_name: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["finance_category"]
          created_at?: string
          description?: string | null
          expense_date: string
          id?: string
          is_refund?: boolean
          notes?: string | null
          parent_expense_id?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          subtotal_cents?: number | null
          tax_cents?: number | null
          tip_cents?: number | null
          total_cents: number
          transaction_id?: string | null
          updated_at?: string
          vendor_name?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["finance_category"]
          created_at?: string
          description?: string | null
          expense_date?: string
          id?: string
          is_refund?: boolean
          notes?: string | null
          parent_expense_id?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          subtotal_cents?: number | null
          tax_cents?: number | null
          tip_cents?: number | null
          total_cents?: number
          transaction_id?: string | null
          updated_at?: string
          vendor_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_expenses_parent_expense_id_fkey"
            columns: ["parent_expense_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
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
      lesson_types: {
        Row: {
          created_at: string
          description: string | null
          display_name: string
          is_active: boolean
          key: string
          price_per_person_cents: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name: string
          is_active?: boolean
          key: string
          price_per_person_cents: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string
          is_active?: boolean
          key?: string
          price_per_person_cents?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      media_assets: {
        Row: {
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
      media_slots: {
        Row: {
          asset_id: string | null
          created_at: string
          id: string
          slot_key: string
          sort: number
          updated_at: string
        }
        Insert: {
          asset_id?: string | null
          created_at?: string
          id?: string
          slot_key: string
          sort?: number
          updated_at?: string
        }
        Update: {
          asset_id?: string | null
          created_at?: string
          id?: string
          slot_key?: string
          sort?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_slots_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      page_sections: {
        Row: {
          anchor: string | null
          content_source: Json
          created_at: string
          id: string
          kind: string
          media_source: Json
          meta: Json
          page_key: string
          sort: number
          status: string
          updated_at: string
        }
        Insert: {
          anchor?: string | null
          content_source?: Json
          created_at?: string
          id?: string
          kind: string
          media_source?: Json
          meta?: Json
          page_key: string
          sort?: number
          status?: string
          updated_at?: string
        }
        Update: {
          anchor?: string | null
          content_source?: Json
          created_at?: string
          id?: string
          kind?: string
          media_source?: Json
          meta?: Json
          page_key?: string
          sort?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      receipts: {
        Row: {
          category: Database["public"]["Enums"]["finance_category"]
          created_at: string
          description: string | null
          expense_id: string | null
          id: string
          is_refund: boolean
          notes: string | null
          parent_receipt_id: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          receipt_date: string
          receipt_storage_path: string
          session_id: string | null
          source_type: string | null
          subtotal_cents: number | null
          tax_cents: number | null
          tip_cents: number | null
          total_cents: number
          transaction_id: string | null
          updated_at: string
          vendor_name: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["finance_category"]
          created_at?: string
          description?: string | null
          expense_id?: string | null
          id?: string
          is_refund?: boolean
          notes?: string | null
          parent_receipt_id?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          receipt_date: string
          receipt_storage_path: string
          session_id?: string | null
          source_type?: string | null
          subtotal_cents?: number | null
          tax_cents?: number | null
          tip_cents?: number | null
          total_cents: number
          transaction_id?: string | null
          updated_at?: string
          vendor_name?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["finance_category"]
          created_at?: string
          description?: string | null
          expense_id?: string | null
          id?: string
          is_refund?: boolean
          notes?: string | null
          parent_receipt_id?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          receipt_date?: string
          receipt_storage_path?: string
          session_id?: string | null
          source_type?: string | null
          subtotal_cents?: number | null
          tax_cents?: number | null
          tip_cents?: number | null
          total_cents?: number
          transaction_id?: string | null
          updated_at?: string
          vendor_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "receipts_expense_id_fkey"
            columns: ["expense_id"]
            isOneToOne: false
            referencedRelation: "business_expenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipts_parent_receipt_id_fkey"
            columns: ["parent_receipt_id"]
            isOneToOne: false
            referencedRelation: "receipts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipts_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          bill_total: number
          client_names: string[] | null
          created_at: string
          deleted_at: string | null
          group_size: number | null
          id: string
          lesson_status: Database["public"]["Enums"]["lesson_status"] | null
          lesson_type_key: string | null
          notes: string | null
          paid: number
          session_time: string | null
          tip: number | null
        }
        Insert: {
          bill_total?: number
          client_names?: string[] | null
          created_at?: string
          deleted_at?: string | null
          group_size?: number | null
          id?: string
          lesson_status?: Database["public"]["Enums"]["lesson_status"] | null
          lesson_type_key?: string | null
          notes?: string | null
          paid?: number
          session_time?: string | null
          tip?: number | null
        }
        Update: {
          bill_total?: number
          client_names?: string[] | null
          created_at?: string
          deleted_at?: string | null
          group_size?: number | null
          id?: string
          lesson_status?: Database["public"]["Enums"]["lesson_status"] | null
          lesson_type_key?: string | null
          notes?: string | null
          paid?: number
          session_time?: string | null
          tip?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_lesson_type_key_fk"
            columns: ["lesson_type_key"]
            isOneToOne: false
            referencedRelation: "lesson_types"
            referencedColumns: ["key"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_apply_booking_request_payment: {
        Args: { p_delta_cents: number; p_id: string }
        Returns: {
          amount_paid_cents: number
          approved_session_id: string | null
          balance_cents: number | null
          bill_total_cents: number | null
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string
          decided_at: string | null
          decided_by: string | null
          decision_reason: string | null
          id: string
          manual_bill_total_cents: number | null
          manual_pricing: boolean
          notes: string | null
          party_names: string[] | null
          party_size: number
          requested_date: string
          requested_lesson_type: string
          requested_time_labels: string[]
          requested_time_slots: string | null
          selected_time_slot: string | null
          status: Database["public"]["Enums"]["booking_request_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "booking_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_clear_media_asset_slots: {
        Args: { p_asset_id: string }
        Returns: undefined
      }
      admin_create_business_expense: {
        Args: {
          p_category: Database["public"]["Enums"]["finance_category"]
          p_description?: string
          p_expense_date: string
          p_is_refund?: boolean
          p_notes?: string
          p_parent_expense_id?: string
          p_payment_method?: Database["public"]["Enums"]["payment_method"]
          p_subtotal_cents?: number
          p_tax_cents?: number
          p_tip_cents?: number
          p_total_cents: number
          p_transaction_id?: string
          p_vendor_name?: string
        }
        Returns: {
          category: Database["public"]["Enums"]["finance_category"]
          created_at: string
          description: string | null
          expense_date: string
          id: string
          is_refund: boolean
          notes: string | null
          parent_expense_id: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          subtotal_cents: number | null
          tax_cents: number | null
          tip_cents: number | null
          total_cents: number
          transaction_id: string | null
          updated_at: string
          vendor_name: string | null
        }
        SetofOptions: {
          from: "*"
          to: "business_expenses"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_create_expense_receipt: {
        Args: {
          p_category: Database["public"]["Enums"]["finance_category"]
          p_description?: string
          p_expense_id: string
          p_is_refund?: boolean
          p_notes?: string
          p_parent_receipt_id?: string
          p_payment_method?: Database["public"]["Enums"]["payment_method"]
          p_receipt_date: string
          p_receipt_storage_path: string
          p_source_type?: string
          p_subtotal_cents?: number
          p_tax_cents?: number
          p_tip_cents?: number
          p_total_cents: number
          p_transaction_id?: string
          p_vendor_name?: string
        }
        Returns: {
          category: Database["public"]["Enums"]["finance_category"]
          created_at: string
          description: string | null
          expense_id: string | null
          id: string
          is_refund: boolean
          notes: string | null
          parent_receipt_id: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          receipt_date: string
          receipt_storage_path: string
          session_id: string | null
          source_type: string | null
          subtotal_cents: number | null
          tax_cents: number | null
          tip_cents: number | null
          total_cents: number
          transaction_id: string | null
          updated_at: string
          vendor_name: string | null
        }
        SetofOptions: {
          from: "*"
          to: "receipts"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_create_session: {
        Args: {
          p_client_names?: string[]
          p_group_size?: number
          p_lesson_status?: Database["public"]["Enums"]["lesson_status"]
          p_lesson_type_key?: string
          p_paid?: number
          p_session_time?: string
          p_tip?: number
        }
        Returns: {
          bill_total: number
          client_names: string[] | null
          created_at: string
          deleted_at: string | null
          group_size: number | null
          id: string
          lesson_status: Database["public"]["Enums"]["lesson_status"] | null
          lesson_type_key: string | null
          notes: string | null
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
      admin_decide_booking_request: {
        Args: {
          p_action: string
          p_decision_reason?: string
          p_id: string
          p_selected_time_label?: string
        }
        Returns: {
          amount_paid_cents: number
          approved_session_id: string | null
          balance_cents: number | null
          bill_total_cents: number | null
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string
          decided_at: string | null
          decided_by: string | null
          decision_reason: string | null
          id: string
          manual_bill_total_cents: number | null
          manual_pricing: boolean
          notes: string | null
          party_names: string[] | null
          party_size: number
          requested_date: string
          requested_lesson_type: string
          requested_time_labels: string[]
          requested_time_slots: string | null
          selected_time_slot: string | null
          status: Database["public"]["Enums"]["booking_request_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "booking_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_delete_business_expense: {
        Args: { p_id: string }
        Returns: undefined
      }
      admin_delete_page_content: {
        Args: { p_page_key: string }
        Returns: undefined
      }
      admin_delete_receipt: { Args: { p_id: string }; Returns: undefined }
      admin_delete_session: { Args: { p_id: string }; Returns: undefined }
      admin_get_cms_page_row: {
        Args: { p_page_key: string }
        Returns: {
          approved: boolean
          body_en: string
          body_es_draft: string
          body_es_published: string
          category: string
          id: string
          page_key: string
          sort: number
          updated_at: string
        }[]
      }
      admin_hard_delete_session: { Args: { p_id: string }; Returns: undefined }
      admin_list_booking_requests: {
        Args: { p_show_all?: boolean }
        Returns: {
          amount_paid_cents: number
          approved_session_id: string | null
          balance_cents: number | null
          bill_total_cents: number | null
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string
          decided_at: string | null
          decided_by: string | null
          decision_reason: string | null
          id: string
          manual_bill_total_cents: number | null
          manual_pricing: boolean
          notes: string | null
          party_names: string[] | null
          party_size: number
          requested_date: string
          requested_lesson_type: string
          requested_time_labels: string[]
          requested_time_slots: string | null
          selected_time_slot: string | null
          status: Database["public"]["Enums"]["booking_request_status"]
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "booking_requests"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      admin_list_business_expenses_range: {
        Args: { p_end: string; p_start: string }
        Returns: {
          category: Database["public"]["Enums"]["finance_category"]
          created_at: string
          description: string | null
          expense_date: string
          id: string
          is_refund: boolean
          notes: string | null
          parent_expense_id: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          subtotal_cents: number | null
          tax_cents: number | null
          tip_cents: number | null
          total_cents: number
          transaction_id: string | null
          updated_at: string
          vendor_name: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "business_expenses"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      admin_list_cms_page_content: {
        Args: { p_category: string; p_limit?: number; p_page_key_like?: string }
        Returns: {
          approved: boolean
          body_en: string
          body_es_draft: string
          body_es_published: string
          category: string
          id: string
          page_key: string
          sort: number
          updated_at: string
        }[]
      }
      admin_list_lesson_types: {
        Args: never
        Returns: {
          created_at: string
          description: string | null
          display_name: string
          is_active: boolean
          key: string
          price_per_person_cents: number
          sort_order: number
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "lesson_types"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      admin_list_media_assets: {
        Args: never
        Returns: {
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
      admin_list_media_assets_with_key: {
        Args: never
        Returns: {
          asset_key: string
          asset_type: Database["public"]["Enums"]["asset_type"]
          bucket: string
          category: Database["public"]["Enums"]["photo_category"]
          created_at: string
          description: string
          id: string
          path: string
          public: boolean
          session_id: string
          sort: number
          title: string
          updated_at: string
        }[]
      }
      admin_list_media_slots_by_prefix: {
        Args: { p_prefix: string }
        Returns: {
          asset_bucket: string
          asset_category: Database["public"]["Enums"]["photo_category"]
          asset_id: string
          asset_path: string
          asset_public: boolean
          asset_title: string
          asset_type: Database["public"]["Enums"]["asset_type"]
          slot_key: string
          sort: number
        }[]
      }
      admin_list_receipts_for_expense: {
        Args: { p_expense_id: string }
        Returns: {
          category: Database["public"]["Enums"]["finance_category"]
          created_at: string
          description: string | null
          expense_id: string | null
          id: string
          is_refund: boolean
          notes: string | null
          parent_receipt_id: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          receipt_date: string
          receipt_storage_path: string
          session_id: string | null
          source_type: string | null
          subtotal_cents: number | null
          tax_cents: number | null
          tip_cents: number | null
          total_cents: number
          transaction_id: string | null
          updated_at: string
          vendor_name: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "receipts"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      admin_list_sessions:
        | {
            Args: never
            Returns: {
              bill_total: number
              client_names: string[] | null
              created_at: string
              deleted_at: string | null
              group_size: number | null
              id: string
              lesson_status: Database["public"]["Enums"]["lesson_status"] | null
              lesson_type_key: string | null
              notes: string | null
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
              bill_total: number
              client_names: string[] | null
              created_at: string
              deleted_at: string | null
              group_size: number | null
              id: string
              lesson_status: Database["public"]["Enums"]["lesson_status"] | null
              lesson_type_key: string | null
              notes: string | null
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
      admin_map_session_to_lesson_type: {
        Args: { p_session_ids: string[] }
        Returns: {
          lesson_type: string
          session_id: string
        }[]
      }
      admin_publish_es: { Args: { p_page_key: string }; Returns: undefined }
      admin_replace_gallery_images: {
        Args: { p_asset_ids?: string[]; p_count: number }
        Returns: number
      }
      admin_restore_session: { Args: { p_id: string }; Returns: undefined }
      admin_set_media_slot: {
        Args: { p_asset_id?: string; p_slot_key: string; p_sort?: number }
        Returns: undefined
      }
      admin_update_booking_request: {
        Args: { p_id: string; p_patch: Json }
        Returns: {
          amount_paid_cents: number
          approved_session_id: string | null
          balance_cents: number | null
          bill_total_cents: number | null
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string
          decided_at: string | null
          decided_by: string | null
          decision_reason: string | null
          id: string
          manual_bill_total_cents: number | null
          manual_pricing: boolean
          notes: string | null
          party_names: string[] | null
          party_size: number
          requested_date: string
          requested_lesson_type: string
          requested_time_labels: string[]
          requested_time_slots: string | null
          selected_time_slot: string | null
          status: Database["public"]["Enums"]["booking_request_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "booking_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_update_booking_request_billing: {
        Args: {
          p_amount_paid_cents?: number
          p_bill_total_cents?: number
          p_id: string
        }
        Returns: {
          amount_paid_cents: number
          approved_session_id: string | null
          balance_cents: number | null
          bill_total_cents: number | null
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string
          decided_at: string | null
          decided_by: string | null
          decision_reason: string | null
          id: string
          manual_bill_total_cents: number | null
          manual_pricing: boolean
          notes: string | null
          party_names: string[] | null
          party_size: number
          requested_date: string
          requested_lesson_type: string
          requested_time_labels: string[]
          requested_time_slots: string | null
          selected_time_slot: string | null
          status: Database["public"]["Enums"]["booking_request_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "booking_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_update_business_expense: {
        Args: {
          p_category: Database["public"]["Enums"]["finance_category"]
          p_description?: string
          p_expense_date: string
          p_id: string
          p_is_refund?: boolean
          p_notes?: string
          p_parent_expense_id?: string
          p_payment_method?: Database["public"]["Enums"]["payment_method"]
          p_subtotal_cents?: number
          p_tax_cents?: number
          p_tip_cents?: number
          p_total_cents: number
          p_transaction_id?: string
          p_vendor_name?: string
        }
        Returns: {
          category: Database["public"]["Enums"]["finance_category"]
          created_at: string
          description: string | null
          expense_date: string
          id: string
          is_refund: boolean
          notes: string | null
          parent_expense_id: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          subtotal_cents: number | null
          tax_cents: number | null
          tip_cents: number | null
          total_cents: number
          transaction_id: string | null
          updated_at: string
          vendor_name: string | null
        }
        SetofOptions: {
          from: "*"
          to: "business_expenses"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_update_lesson_type: {
        Args: {
          p_description?: string
          p_display_name?: string
          p_key: string
          p_price_per_person_cents?: number
        }
        Returns: {
          created_at: string
          description: string | null
          display_name: string
          is_active: boolean
          key: string
          price_per_person_cents: number
          sort_order: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "lesson_types"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_update_receipt: {
        Args: {
          p_category: Database["public"]["Enums"]["finance_category"]
          p_description?: string
          p_id: string
          p_is_refund?: boolean
          p_notes?: string
          p_parent_receipt_id?: string
          p_payment_method?: Database["public"]["Enums"]["payment_method"]
          p_receipt_date: string
          p_receipt_storage_path: string
          p_source_type?: string
          p_subtotal_cents?: number
          p_tax_cents?: number
          p_tip_cents?: number
          p_total_cents: number
          p_transaction_id?: string
          p_vendor_name?: string
        }
        Returns: {
          category: Database["public"]["Enums"]["finance_category"]
          created_at: string
          description: string | null
          expense_id: string | null
          id: string
          is_refund: boolean
          notes: string | null
          parent_receipt_id: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          receipt_date: string
          receipt_storage_path: string
          session_id: string | null
          source_type: string | null
          subtotal_cents: number | null
          tax_cents: number | null
          tip_cents: number | null
          total_cents: number
          transaction_id: string | null
          updated_at: string
          vendor_name: string | null
        }
        SetofOptions: {
          from: "*"
          to: "receipts"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_update_session: {
        Args: {
          p_client_names?: string[]
          p_group_size?: number
          p_id: string
          p_lesson_status?: Database["public"]["Enums"]["lesson_status"]
          p_lesson_type_key?: string
          p_paid?: number
          p_session_time?: string
          p_tip?: number
        }
        Returns: {
          bill_total: number
          client_names: string[] | null
          created_at: string
          deleted_at: string | null
          group_size: number | null
          id: string
          lesson_status: Database["public"]["Enums"]["lesson_status"] | null
          lesson_type_key: string | null
          notes: string | null
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
      admin_update_session_v2: {
        Args: {
          p_bill_total?: number
          p_lesson_status?: string
          p_notes?: string
          p_paid?: number
          p_session_id: string
          p_session_time?: string
          p_tip?: number
        }
        Returns: undefined
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
      compute_booking_request_bill_total_cents: {
        Args: { p_lesson_type_key: string; p_party_size: number }
        Returns: number
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
      get_page_content_by_prefix: {
        Args: { p_locale?: string; p_prefix: string }
        Returns: {
          body: string
          locale: string
          page_key: string
          updated_at: string
        }[]
      }
      get_public_media_asset_by_key: {
        Args: { p_slot_key: string }
        Returns: {
          asset_type: Database["public"]["Enums"]["asset_type"]
          bucket: string
          category: Database["public"]["Enums"]["photo_category"]
          created_at: string
          description: string
          id: string
          path: string
          public: boolean
          session_id: string
          slot_key: string
          sort: number
          title: string
          updated_at: string
        }[]
      }
      get_public_media_assets: {
        Args: { p_category?: Database["public"]["Enums"]["photo_category"] }
        Returns: {
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
          asset_type: Database["public"]["Enums"]["asset_type"]
          bucket: string
          category: Database["public"]["Enums"]["photo_category"]
          created_at: string
          description: string
          id: string
          path: string
          public: boolean
          session_id: string
          slot_key: string
          sort: number
          title: string
          updated_at: string
        }[]
      }
      get_public_sessions: {
        Args: never
        Returns: {
          bill_total: number
          client_names: string[] | null
          created_at: string
          deleted_at: string | null
          group_size: number | null
          id: string
          lesson_status: Database["public"]["Enums"]["lesson_status"] | null
          lesson_type_key: string | null
          notes: string | null
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
      is_site_admin: { Args: never; Returns: boolean }
      is_valid_json: { Args: { p_text: string }; Returns: boolean }
      rpc_create_page_section: {
        Args: {
          p_anchor?: string
          p_kind: string
          p_meta?: Json
          p_page_key: string
          p_sort?: number
          p_status?: string
        }
        Returns: string
      }
      rpc_delete_page_section: {
        Args: { p_page_key: string; p_section_id: string }
        Returns: undefined
      }
      rpc_get_page_sections: {
        Args: { p_include_drafts?: boolean; p_page_key: string }
        Returns: {
          anchor: string
          content_source: Json
          created_at: string
          id: string
          kind: string
          media_source: Json
          meta: Json
          page_key: string
          sort: number
          status: string
          updated_at: string
        }[]
      }
      rpc_upsert_page_sections: {
        Args: {
          p_page_key: string
          p_prune_missing?: boolean
          p_sections: Json
        }
        Returns: undefined
      }
      sync_media_assets_from_storage: {
        Args: never
        Returns: {
          inserted: number
          updated: number
        }[]
      }
    }
    Enums: {
      asset_type: "video" | "photo"
      booking_request_status: "pending" | "approved" | "denied" | "canceled"
      Days_of_the_week:
        | "Sunday"
        | "Monday"
        | "Tuesday"
        | "Wednesday"
        | "Thursday"
        | "Friday"
        | "Saturday"
      finance_category:
        | "fuel"
        | "equipment"
        | "advertising"
        | "lessons"
        | "food"
        | "software"
        | "payroll"
        | "other"
      lesson_status:
        | "booked_unpaid"
        | "completed"
        | "canceled_with_refund"
        | "canceled_without_refund"
        | "booked_paid_in_full"
      payment_method: "cash" | "card" | "ach" | "check" | "stripe" | "other"
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
      booking_request_status: ["pending", "approved", "denied", "canceled"],
      Days_of_the_week: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      finance_category: [
        "fuel",
        "equipment",
        "advertising",
        "lessons",
        "food",
        "software",
        "payroll",
        "other",
      ],
      lesson_status: [
        "booked_unpaid",
        "completed",
        "canceled_with_refund",
        "canceled_without_refund",
        "booked_paid_in_full",
      ],
      payment_method: ["cash", "card", "ach", "check", "stripe", "other"],
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
