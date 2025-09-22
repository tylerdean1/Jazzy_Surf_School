/*
  # Seed Initial Data for Surf School

  1. Seed Data
    - Insert basic lesson types (Beginner, Advanced)
    - Insert sample media assets
    - Insert sample time slots for the next few weeks

  2. Sample Data
    - Beginner Lesson: $75, 60 minutes, Rincón to Isabela/Jobos
    - Advanced Coaching: $120, flexible duration, various locations
*/

-- Insert lesson types
INSERT INTO lesson_types (name, description, price, duration_minutes, max_participants, location, is_active) VALUES
(
  'Beginner Lesson',
  'Perfect for first-time surfers. Learn water safety, board handling, and catch your first waves with professional instruction.',
  75.00,
  60,
  6,
  'Rincón to Isabela/Jobos',
  true
),
(
  'Advanced Coaching',
  'Video analysis, technique refinement, and competition preparation for experienced surfers. Flexible scheduling and custom programs available.',
  120.00,
  90,
  4,
  'Various locations based on conditions',
  true
);

-- Insert sample media assets
INSERT INTO media_assets (type, title, url, description, is_featured, sort_order) VALUES
(
  'photo',
  'Surf Lesson Action Shot',
  'https://images.pexels.com/photos/416978/pexels-photo-416978.jpeg',
  'Students learning to surf in perfect conditions',
  true,
  1
),
(
  'photo',
  'Sunset Surf Session',
  'https://images.pexels.com/photos/390051/surfer-wave-sunset-the-indian-ocean-390051.jpeg',
  'Beautiful sunset surf session with advanced students',
  true,
  2
),
(
  'photo',
  'Group Lesson Fun',
  'https://images.pexels.com/photos/1654698/pexels-photo-1654698.jpeg',
  'Happy students after a successful beginner lesson',
  false,
  3
),
(
  'video',
  'Beginner Lesson Highlights',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'See what a typical beginner lesson looks like',
  true,
  4
),
(
  'video',
  'Advanced Techniques Tutorial',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'Advanced surfing techniques demonstration',
  false,
  5
);

-- Generate time slots for the next 30 days
-- This is a simplified version - in production, you'd want a more sophisticated scheduling system
DO $$
DECLARE
  lesson_type_record RECORD;
  current_date_iter DATE;
  time_slot TIME;
  slot_start TIMESTAMPTZ;
  slot_end TIMESTAMPTZ;
BEGIN
  -- Loop through lesson types
  FOR lesson_type_record IN SELECT id, duration_minutes FROM lesson_types WHERE is_active = true LOOP
    
    -- Loop through next 30 days
    current_date_iter := CURRENT_DATE;
    WHILE current_date_iter <= CURRENT_DATE + INTERVAL '30 days' LOOP
      
      -- Skip Sundays (day of week 0)
      IF EXTRACT(DOW FROM current_date_iter) != 0 THEN
        
        -- Create morning slots: 8:00, 10:00, 12:00
        FOR time_slot IN VALUES ('08:00'::TIME), ('10:00'::TIME), ('12:00'::TIME) LOOP
          slot_start := current_date_iter + time_slot;
          slot_end := slot_start + (lesson_type_record.duration_minutes || ' minutes')::INTERVAL;
          
          INSERT INTO time_slots (
            lesson_type_id, 
            start_time, 
            end_time, 
            status, 
            max_participants,
            current_bookings
          ) VALUES (
            lesson_type_record.id,
            slot_start,
            slot_end,
            'available',
            6,
            0
          );
        END LOOP;
        
        -- Create afternoon slots: 14:00, 16:00 (2:00 PM, 4:00 PM)
        FOR time_slot IN VALUES ('14:00'::TIME), ('16:00'::TIME) LOOP
          slot_start := current_date_iter + time_slot;
          slot_end := slot_start + (lesson_type_record.duration_minutes || ' minutes')::INTERVAL;
          
          INSERT INTO time_slots (
            lesson_type_id, 
            start_time, 
            end_time, 
            status, 
            max_participants,
            current_bookings
          ) VALUES (
            lesson_type_record.id,
            slot_start,
            slot_end,
            'available',
            6,
            0
          );
        END LOOP;
        
      END IF;
      
      current_date_iter := current_date_iter + INTERVAL '1 day';
    END LOOP;
    
  END LOOP;
END $$;