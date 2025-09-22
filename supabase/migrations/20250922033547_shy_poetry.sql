/*
  # Surf School Database Schema

  1. New Tables
    - `lesson_types`
      - `id` (uuid, primary key)
      - `name` (text) - lesson name
      - `description` (text) - lesson description
      - `price` (decimal) - price per person
      - `duration_minutes` (integer) - lesson duration
      - `max_participants` (integer) - maximum students
      - `location` (text) - lesson location
      - `is_active` (boolean) - whether lesson is available
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `time_slots`
      - `id` (uuid, primary key)
      - `lesson_type_id` (uuid, foreign key)
      - `start_time` (timestamptz) - lesson start time
      - `end_time` (timestamptz) - lesson end time
      - `status` (text) - available, held, booked
      - `max_participants` (integer)
      - `current_bookings` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `bookings`
      - `id` (uuid, primary key)
      - `time_slot_id` (uuid, foreign key)
      - `customer_name` (text)
      - `customer_email` (text)
      - `customer_phone` (text)
      - `party_size` (integer)
      - `total_amount` (decimal)
      - `status` (text) - pending, confirmed, cancelled
      - `payment_intent_id` (text) - Stripe payment intent ID
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `payments`
      - `id` (uuid, primary key)
      - `booking_id` (uuid, foreign key)
      - `stripe_payment_intent_id` (text)
      - `amount` (decimal)
      - `stripe_fee` (decimal)
      - `net_amount` (decimal)
      - `status` (text) - pending, succeeded, failed
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `media_assets`
      - `id` (uuid, primary key)
      - `type` (text) - photo, video
      - `title` (text)
      - `url` (text)
      - `youtube_id` (text) - for YouTube videos
      - `description` (text)
      - `is_featured` (boolean)
      - `sort_order` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access on lesson_types and media_assets
    - Add policies for authenticated admin access on all operations
*/

-- Create lesson_types table
CREATE TABLE IF NOT EXISTS lesson_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price decimal(10,2) NOT NULL DEFAULT 0,
  duration_minutes integer NOT NULL DEFAULT 60,
  max_participants integer NOT NULL DEFAULT 6,
  location text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create time_slots table
CREATE TABLE IF NOT EXISTS time_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_type_id uuid NOT NULL REFERENCES lesson_types(id) ON DELETE CASCADE,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'held', 'booked')),
  max_participants integer NOT NULL DEFAULT 6,
  current_bookings integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  time_slot_id uuid NOT NULL REFERENCES time_slots(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  party_size integer NOT NULL DEFAULT 1,
  total_amount decimal(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  payment_intent_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  stripe_payment_intent_id text NOT NULL,
  amount decimal(10,2) NOT NULL DEFAULT 0,
  stripe_fee decimal(10,2) NOT NULL DEFAULT 0,
  net_amount decimal(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create media_assets table
CREATE TABLE IF NOT EXISTS media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('photo', 'video')),
  title text NOT NULL,
  url text NOT NULL,
  youtube_id text,
  description text,
  is_featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE lesson_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;

-- Policies for lesson_types (public read, admin write)
CREATE POLICY "Allow public read on lesson_types"
  ON lesson_types
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Allow admin full access on lesson_types"
  ON lesson_types
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Policies for time_slots (public read available slots, admin write)
CREATE POLICY "Allow public read on available time_slots"
  ON time_slots
  FOR SELECT
  TO anon, authenticated
  USING (status = 'available');

CREATE POLICY "Allow admin full access on time_slots"
  ON time_slots
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Policies for bookings (customers can create, admin manages)
CREATE POLICY "Allow customers to create bookings"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow admin full access on bookings"
  ON bookings
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Policies for payments (admin only)
CREATE POLICY "Allow admin full access on payments"
  ON payments
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Policies for media_assets (public read, admin write)
CREATE POLICY "Allow public read on media_assets"
  ON media_assets
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow admin full access on media_assets"
  ON media_assets
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_time_slots_lesson_type ON time_slots(lesson_type_id);
CREATE INDEX IF NOT EXISTS idx_time_slots_status ON time_slots(status);
CREATE INDEX IF NOT EXISTS idx_time_slots_start_time ON time_slots(start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_time_slot ON bookings(time_slot_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_type ON media_assets(type);
CREATE INDEX IF NOT EXISTS idx_media_assets_featured ON media_assets(is_featured);