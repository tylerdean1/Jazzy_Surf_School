/*
  # Availability rules/exceptions and revenue view

  Adds:
  - availability_rules: recurring weekly rules with time windows
  - availability_exceptions: blackout dates/times
  - monthly_revenue view: succeeded payments aggregated by month
*/

CREATE TABLE IF NOT EXISTS availability_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  weekday smallint NOT NULL CHECK (weekday BETWEEN 0 AND 6), -- 0=Sunday
  start_time time NOT NULL,
  end_time time NOT NULL,
  lesson_type_id uuid REFERENCES lesson_types(id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS availability_exceptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  reason text,
  is_blackout boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE availability_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_exceptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read availability rules"
  ON availability_rules FOR SELECT TO anon, authenticated USING (is_active = true);

CREATE POLICY "Admin full availability rules"
  ON availability_rules FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Public read availability exceptions"
  ON availability_exceptions FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admin full availability exceptions"
  ON availability_exceptions FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'admin');

-- Monthly revenue view (succeeded payments)
CREATE OR REPLACE VIEW monthly_revenue AS
SELECT
  to_char(date_trunc('month', created_at), 'YYYY-MM') AS month,
  COUNT(*) AS payments_count,
  SUM(amount) AS gross_amount,
  SUM(stripe_fee) AS stripe_fees,
  SUM(net_amount) AS net_amount
FROM payments
WHERE status = 'succeeded'
GROUP BY 1
ORDER BY 1 DESC;
