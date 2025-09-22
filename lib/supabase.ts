import { createClient } from '@supabase/supabase-js';

type SupabaseDatabaseClient = ReturnType<typeof createClient>;

let supabaseClient: SupabaseDatabaseClient | null = null;

export function getSupabaseClient(): SupabaseDatabaseClient {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        'Supabase client is not configured. Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.'
      );
    }

    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }

  return supabaseClient;
}

export type Database = {
  public: {
    Tables: {
      lesson_types: {
        Row: {
          id: string;
          name: string;
          description: string;
          price: number;
          duration_minutes: number;
          max_participants: number;
          location: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['lesson_types']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['lesson_types']['Insert']>;
      };
      time_slots: {
        Row: {
          id: string;
          lesson_type_id: string;
          start_time: string;
          end_time: string;
          status: 'available' | 'held' | 'booked';
          max_participants: number;
          current_bookings: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['time_slots']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['time_slots']['Insert']>;
      };
      bookings: {
        Row: {
          id: string;
          time_slot_id: string;
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          party_size: number;
          total_amount: number;
          status: 'pending' | 'confirmed' | 'cancelled';
          payment_intent_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['bookings']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['bookings']['Insert']>;
      };
      payments: {
        Row: {
          id: string;
          booking_id: string;
          stripe_payment_intent_id: string;
          amount: number;
          stripe_fee: number;
          net_amount: number;
          status: 'pending' | 'succeeded' | 'failed';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['payments']['Insert']>;
      };
      media_assets: {
        Row: {
          id: string;
          type: 'photo' | 'video';
          title: string;
          url: string;
          youtube_id: string | null;
          description: string | null;
          is_featured: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['media_assets']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['media_assets']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};