import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// Convenience types for common tables
export type LessonType = Tables<'lesson_types'>;
export type TimeSlot = Tables<'time_slots'>;
export type Booking = Tables<'bookings'>;
export type Payment = Tables<'payments'>;
export type AvailabilityRule = Tables<'availability_rules'>;
export type AvailabilityException = Tables<'availability_exceptions'>;

// Convenience types for enums
export type DaysOfWeek = Enums<'Days_of_the_week'>;
