-- Admin booking-request decision via RPC (approve/deny/cancel)
-- This avoids relying on app-layer cookie auth for critical mutations.

CREATE OR REPLACE FUNCTION public.admin_decide_booking_request(
  p_id uuid,
  p_action text,
  p_selected_time_label text DEFAULT NULL,
  p_decision_reason text DEFAULT NULL
) RETURNS public.booking_requests
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_req public.booking_requests;
  v_updated public.booking_requests;
  v_action text;

  v_m text[];
  v_hour12 int;
  v_minute int;
  v_ampm text;
  v_hour24 int;
  v_time time;
  v_session_time text;

  v_bill_total_cents int;
  v_amount_paid_cents int;
  v_bill_total numeric;
  v_paid numeric;
  v_lesson_status public.lesson_status;

  v_session public.sessions;
  v_client_names text[];
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  v_action := lower(coalesce(p_action, ''));
  IF v_action NOT IN ('approve', 'deny', 'cancel') THEN
    RAISE EXCEPTION 'invalid action';
  END IF;

  SELECT * INTO v_req
  FROM public.booking_requests
  WHERE id = p_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'booking_request not found';
  END IF;

  -- deny
  IF v_action = 'deny' THEN
    UPDATE public.booking_requests
    SET
      status = 'denied',
      decided_at = now(),
      decided_by = auth.uid(),
      decision_reason = p_decision_reason,
      updated_at = now()
    WHERE id = p_id
    RETURNING * INTO v_updated;

    RETURN v_updated;
  END IF;

  -- cancel
  IF v_action = 'cancel' THEN
    IF v_req.approved_session_id IS NULL THEN
      -- Pending cancel: delete booking request row.
      DELETE FROM public.booking_requests WHERE id = p_id;
      RETURN v_req;
    END IF;

    -- Approved cancel: cancel linked session when it's still booked.
    UPDATE public.sessions
    SET lesson_status = 'canceled_without_refund'
    WHERE id = v_req.approved_session_id
      AND (lesson_status IN ('booked_unpaid', 'booked_paid_in_full') OR lesson_status IS NULL);

    UPDATE public.booking_requests
    SET
      decided_at = now(),
      decided_by = auth.uid(),
      decision_reason = p_decision_reason,
      updated_at = now()
    WHERE id = p_id
    RETURNING * INTO v_updated;

    RETURN v_updated;
  END IF;

  -- approve
  IF v_req.status <> 'pending' THEN
    RAISE EXCEPTION 'booking_request is not pending';
  END IF;

  IF coalesce(p_selected_time_label, '') = '' THEN
    RAISE EXCEPTION 'missing selected time';
  END IF;

  -- Parse time label like "11:30 AM" or "7:00 pm".
  SELECT regexp_matches(trim(p_selected_time_label), '^([0-9]{1,2}):([0-9]{2})\\s*(AM|PM)$', 'i') INTO v_m;
  IF v_m IS NULL OR array_length(v_m, 1) < 3 THEN
    RAISE EXCEPTION 'invalid time label';
  END IF;

  v_hour12 := v_m[1]::int;
  v_minute := v_m[2]::int;
  v_ampm := upper(v_m[3]);

  IF v_hour12 < 1 OR v_hour12 > 12 THEN
    RAISE EXCEPTION 'invalid time label';
  END IF;

  IF v_minute NOT IN (0, 30) THEN
    RAISE EXCEPTION 'invalid time label';
  END IF;

  v_hour24 := v_hour12 % 12;
  IF v_ampm = 'PM' THEN
    v_hour24 := v_hour24 + 12;
  END IF;

  v_time := make_time(v_hour24, v_minute, 0);

  -- Business hours: 07:00–15:30 (inclusive)
  IF v_time < time '07:00' OR v_time > time '15:30' THEN
    RAISE EXCEPTION 'selected time must be within business hours';
  END IF;

  v_session_time := to_char(v_req.requested_date::date, 'YYYY-MM-DD') || 'T' || to_char(v_time, 'HH24:MI:SS');

  v_bill_total_cents := coalesce(v_req.bill_total_cents, 0);
  v_amount_paid_cents := coalesce(v_req.amount_paid_cents, 0);

  v_bill_total := v_bill_total_cents / 100.0;
  v_paid := v_amount_paid_cents / 100.0;

  IF v_req.bill_total_cents IS NOT NULL AND v_amount_paid_cents >= v_bill_total_cents THEN
    v_lesson_status := 'booked_paid_in_full';
  ELSE
    v_lesson_status := 'booked_unpaid';
  END IF;

  -- Build client names: customer name + party names (dedupe, keep first occurrence order).
  v_client_names := array(
    SELECT DISTINCT ON (x) x
    FROM unnest(array_prepend(v_req.customer_name, coalesce(v_req.party_names, ARRAY[]::text[]))) WITH ORDINALITY t(x, ord)
    ORDER BY x, ord
  );

  INSERT INTO public.sessions (client_names, group_size, session_time, lesson_status, paid, tip, bill_total)
  VALUES (v_client_names, v_req.party_size, v_session_time, v_lesson_status, v_paid, 0, v_bill_total)
  RETURNING * INTO v_session;

  UPDATE public.booking_requests
  SET
    status = 'approved',
    decided_at = now(),
    decided_by = auth.uid(),
    decision_reason = p_decision_reason,
    approved_session_id = v_session.id,
    -- Preserve all requested_time_labels; record selected_time_slot for the approved session.
    selected_time_slot = v_time,
    requested_time_slots = v_time,
    updated_at = now()
  WHERE id = p_id
  RETURNING * INTO v_updated;

  RETURN v_updated;
END;
$$;

-- Allow authenticated users (Supabase sessions) to invoke this RPC.
GRANT EXECUTE ON FUNCTION public.admin_decide_booking_request(uuid, text, text, text) TO authenticated;
