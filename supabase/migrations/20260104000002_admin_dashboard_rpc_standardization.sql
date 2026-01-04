-- Standardize admin dashboard DB access via RPCs
-- Goal: admin UI should rely on SECURITY DEFINER RPCs guarded by public.is_admin().

CREATE OR REPLACE FUNCTION public.admin_list_booking_requests(
  p_show_all boolean DEFAULT false
) RETURNS SETOF public.booking_requests
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  IF coalesce(p_show_all, false) THEN
    RETURN QUERY
      SELECT *
      FROM public.booking_requests
      ORDER BY created_at DESC;
  ELSE
    RETURN QUERY
      SELECT *
      FROM public.booking_requests
      WHERE status = 'pending'
      ORDER BY created_at DESC;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_booking_requests(boolean) TO authenticated;


CREATE OR REPLACE FUNCTION public.admin_update_booking_request(
  p_id uuid,
  p_patch jsonb
) RETURNS public.booking_requests
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_req public.booking_requests;
  v_updated public.booking_requests;

  v_selected_time_slot time;
  v_has_selected_time_slot boolean;

  v_bill_total_cents int;
  v_amount_paid_cents int;
  v_paid numeric;
  v_bill_total numeric;
  v_target_status public.lesson_status;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  SELECT * INTO v_req
  FROM public.booking_requests
  WHERE id = p_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'booking_request not found';
  END IF;

  IF p_patch IS NULL THEN
    p_patch := '{}'::jsonb;
  END IF;

  -- selected_time_slot: expects "HH:MM:SS" or null
  v_has_selected_time_slot := (p_patch ? 'selected_time_slot');
  IF v_has_selected_time_slot THEN
    IF (p_patch->'selected_time_slot') IS NULL OR jsonb_typeof(p_patch->'selected_time_slot') = 'null' THEN
      v_selected_time_slot := NULL;
    ELSE
      v_selected_time_slot := (p_patch->>'selected_time_slot')::time;
    END IF;
  END IF;

  UPDATE public.booking_requests
  SET
    customer_name = CASE WHEN p_patch ? 'customer_name' THEN coalesce(nullif(trim(p_patch->>'customer_name'), ''), v_req.customer_name) ELSE v_req.customer_name END,
    customer_email = CASE WHEN p_patch ? 'customer_email' THEN coalesce(nullif(trim(p_patch->>'customer_email'), ''), v_req.customer_email) ELSE v_req.customer_email END,
    customer_phone = CASE WHEN p_patch ? 'customer_phone' THEN coalesce(nullif(trim(p_patch->>'customer_phone'), ''), v_req.customer_phone) ELSE v_req.customer_phone END,

    party_size = CASE WHEN p_patch ? 'party_size' THEN greatest(1, floor(coalesce((p_patch->>'party_size')::numeric, v_req.party_size::numeric))::int) ELSE v_req.party_size END,

    party_names = CASE
      WHEN p_patch ? 'party_names' THEN
        CASE
          WHEN (p_patch->'party_names') IS NULL OR jsonb_typeof(p_patch->'party_names') = 'null' THEN NULL
          WHEN jsonb_typeof(p_patch->'party_names') = 'array' THEN
            array(
              SELECT nullif(trim(x), '')
              FROM jsonb_array_elements_text(p_patch->'party_names') t(x)
              WHERE nullif(trim(x), '') IS NOT NULL
            )
          ELSE v_req.party_names
        END
      ELSE v_req.party_names
    END,

    requested_lesson_type = CASE WHEN p_patch ? 'requested_lesson_type' THEN coalesce(nullif(trim(p_patch->>'requested_lesson_type'), ''), v_req.requested_lesson_type) ELSE v_req.requested_lesson_type END,

    requested_date = CASE
      WHEN p_patch ? 'requested_date' THEN
        CASE
          WHEN nullif(trim(p_patch->>'requested_date'), '') IS NULL THEN v_req.requested_date
          ELSE (p_patch->>'requested_date')::date
        END
      ELSE v_req.requested_date
    END,

    requested_time_labels = CASE
      WHEN p_patch ? 'requested_time_labels' THEN
        CASE
          WHEN jsonb_typeof(p_patch->'requested_time_labels') = 'array' THEN
            array(
              SELECT nullif(trim(x), '')
              FROM jsonb_array_elements_text(p_patch->'requested_time_labels') t(x)
              WHERE nullif(trim(x), '') IS NOT NULL
            )
          ELSE v_req.requested_time_labels
        END
      ELSE v_req.requested_time_labels
    END,

    selected_time_slot = CASE WHEN v_has_selected_time_slot THEN v_selected_time_slot ELSE v_req.selected_time_slot END,

    notes = CASE
      WHEN p_patch ? 'notes' THEN
        CASE
          WHEN (p_patch->'notes') IS NULL OR jsonb_typeof(p_patch->'notes') = 'null' THEN NULL
          ELSE nullif(trim(p_patch->>'notes'), '')
        END
      ELSE v_req.notes
    END,

    amount_paid_cents = CASE
      WHEN p_patch ? 'amount_paid_cents' THEN
        greatest(0, floor(coalesce((p_patch->>'amount_paid_cents')::numeric, 0))::int)
      ELSE v_req.amount_paid_cents
    END,

    manual_pricing = CASE
      WHEN p_patch ? 'manual_pricing' THEN
        coalesce((p_patch->>'manual_pricing')::boolean, v_req.manual_pricing)
      ELSE v_req.manual_pricing
    END,

    manual_bill_total_cents = CASE
      WHEN p_patch ? 'manual_bill_total_cents' THEN
        CASE
          WHEN (p_patch->'manual_bill_total_cents') IS NULL OR jsonb_typeof(p_patch->'manual_bill_total_cents') = 'null' THEN NULL
          ELSE greatest(0, floor(coalesce((p_patch->>'manual_bill_total_cents')::numeric, 0))::int)
        END
      ELSE v_req.manual_bill_total_cents
    END,

    updated_at = now()
  WHERE id = p_id
  RETURNING * INTO v_updated;

  -- If manual_pricing was turned off in this update, force manual_bill_total_cents NULL.
  IF (p_patch ? 'manual_pricing') AND v_updated.manual_pricing = false THEN
    UPDATE public.booking_requests
    SET manual_bill_total_cents = NULL, updated_at = now()
    WHERE id = p_id
    RETURNING * INTO v_updated;
  END IF;

  -- Keep linked session billing/status in sync when the request is already approved.
  IF v_updated.approved_session_id IS NOT NULL THEN
    v_bill_total_cents := v_updated.bill_total_cents;
    v_amount_paid_cents := coalesce(v_updated.amount_paid_cents, 0);

    v_paid := v_amount_paid_cents / 100.0;
    v_bill_total := CASE WHEN v_bill_total_cents IS NULL THEN NULL ELSE v_bill_total_cents / 100.0 END;

    v_target_status := CASE
      WHEN v_bill_total_cents IS NOT NULL AND v_amount_paid_cents >= v_bill_total_cents THEN 'booked_paid_in_full'::public.lesson_status
      ELSE 'booked_unpaid'::public.lesson_status
    END;

    UPDATE public.sessions s
    SET
      paid = v_paid,
      bill_total = COALESCE(v_bill_total, s.bill_total),
      lesson_status = CASE
        WHEN s.lesson_status IN ('booked_unpaid', 'booked_paid_in_full') OR s.lesson_status IS NULL THEN v_target_status
        ELSE s.lesson_status
      END
    WHERE s.id = v_updated.approved_session_id;
  END IF;

  -- Return the freshest row.
  SELECT * INTO v_updated
  FROM public.booking_requests
  WHERE id = p_id;

  RETURN v_updated;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_update_booking_request(uuid, jsonb) TO authenticated;


CREATE OR REPLACE FUNCTION public.admin_list_lesson_types()
RETURNS SETOF public.lesson_types
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  RETURN QUERY
    SELECT *
    FROM public.lesson_types
    ORDER BY sort_order ASC, key ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_lesson_types() TO authenticated;


CREATE OR REPLACE FUNCTION public.admin_update_lesson_type(
  p_key text,
  p_display_name text DEFAULT NULL,
  p_description text DEFAULT NULL,
  p_price_per_person_cents int DEFAULT NULL
) RETURNS public.lesson_types
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_row public.lesson_types;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  IF coalesce(trim(p_key), '') = '' THEN
    RAISE EXCEPTION 'missing key';
  END IF;

  UPDATE public.lesson_types
  SET
    display_name = COALESCE(p_display_name, display_name),
    description = COALESCE(p_description, description),
    price_per_person_cents = COALESCE(p_price_per_person_cents, price_per_person_cents),
    updated_at = now()
  WHERE key = trim(p_key)
  RETURNING * INTO v_row;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'lesson type not found';
  END IF;

  RETURN v_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_update_lesson_type(text, text, text, int) TO authenticated;


CREATE OR REPLACE FUNCTION public.admin_list_business_expenses_range(
  p_start date,
  p_end date
) RETURNS SETOF public.business_expenses
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  RETURN QUERY
    SELECT *
    FROM public.business_expenses
    WHERE expense_date >= p_start
      AND expense_date < p_end
    ORDER BY expense_date ASC, created_at ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_business_expenses_range(date, date) TO authenticated;


CREATE OR REPLACE FUNCTION public.admin_map_session_to_lesson_type(
  p_session_ids uuid[]
) RETURNS TABLE(session_id uuid, lesson_type text)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  RETURN QUERY
    SELECT br.approved_session_id AS session_id,
           br.requested_lesson_type AS lesson_type
    FROM public.booking_requests br
    WHERE br.approved_session_id = ANY(p_session_ids);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_map_session_to_lesson_type(uuid[]) TO authenticated;


CREATE OR REPLACE FUNCTION public.admin_list_media_assets_with_key()
RETURNS TABLE(
  id uuid,
  asset_key text,
  title text,
  description text,
  public boolean,
  bucket text,
  path text,
  category public.photo_category,
  asset_type public.asset_type,
  sort smallint,
  session_id uuid,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  RETURN QUERY
    SELECT
      a.id,
      (
        SELECT min(ms.slot_key)
        FROM public.media_slots ms
        WHERE ms.asset_id = a.id
      ) AS asset_key,
      a.title,
      a.description,
      a.public,
      a.bucket,
      a.path,
      a.category,
      a.asset_type,
      a.sort,
      a.session_id,
      a.created_at,
      a.updated_at
    FROM public.media_assets a
    ORDER BY a.public DESC, a.category ASC, a.sort ASC, a.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_media_assets_with_key() TO authenticated;


CREATE OR REPLACE FUNCTION public.admin_list_media_slots_by_prefix(
  p_prefix text
) RETURNS TABLE(
  slot_key text,
  sort int,
  asset_id uuid,
  asset_title text,
  asset_bucket text,
  asset_path text,
  asset_public boolean,
  asset_type public.asset_type,
  asset_category public.photo_category
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  IF coalesce(trim(p_prefix), '') = '' THEN
    RAISE EXCEPTION 'missing prefix';
  END IF;

  RETURN QUERY
    SELECT
      ms.slot_key,
      ms.sort,
      ms.asset_id,
      a.title,
      a.bucket,
      a.path,
      a.public,
      a.asset_type,
      a.category
    FROM public.media_slots ms
    LEFT JOIN public.media_assets a ON a.id = ms.asset_id
    WHERE ms.slot_key LIKE (trim(p_prefix) || '%')
    ORDER BY ms.sort ASC NULLS LAST, ms.slot_key ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_media_slots_by_prefix(text) TO authenticated;


CREATE OR REPLACE FUNCTION public.admin_set_media_slot(
  p_slot_key text,
  p_asset_id uuid DEFAULT NULL,
  p_sort int DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_key text;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  v_key := trim(coalesce(p_slot_key, ''));
  IF v_key = '' THEN
    RAISE EXCEPTION 'missing slot_key';
  END IF;
  IF length(v_key) > 128 THEN
    RAISE EXCEPTION 'slot_key too long';
  END IF;

  IF p_asset_id IS NULL THEN
    DELETE FROM public.media_slots WHERE slot_key = v_key;
    RETURN;
  END IF;

  INSERT INTO public.media_slots (slot_key, asset_id, sort)
  VALUES (v_key, p_asset_id, CASE WHEN p_sort IS NULL THEN NULL ELSE greatest(-32768, least(32767, p_sort)) END)
  ON CONFLICT (slot_key)
  DO UPDATE SET asset_id = excluded.asset_id, sort = excluded.sort;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_set_media_slot(text, uuid, int) TO authenticated;


CREATE OR REPLACE FUNCTION public.admin_clear_media_asset_slots(
  p_asset_id uuid
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  IF p_asset_id IS NULL THEN
    RAISE EXCEPTION 'missing asset_id';
  END IF;

  DELETE FROM public.media_slots WHERE asset_id = p_asset_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_clear_media_asset_slots(uuid) TO authenticated;


CREATE OR REPLACE FUNCTION public.admin_replace_gallery_images(
  p_count int,
  p_asset_ids uuid[] DEFAULT NULL
) RETURNS int
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_count int;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  v_count := greatest(0, least(100, coalesce(p_count, 0)));

  DELETE FROM public.media_slots WHERE slot_key LIKE 'gallery.images.%';

  IF v_count > 0 THEN
    INSERT INTO public.media_slots (slot_key, asset_id, sort)
    SELECT
      ('gallery.images.' || (i - 1))::text,
      CASE
        WHEN p_asset_ids IS NULL THEN NULL
        WHEN array_length(p_asset_ids, 1) >= i THEN p_asset_ids[i]
        ELSE NULL
      END AS asset_id,
      (i - 1) AS sort
    FROM generate_series(1, v_count) AS i;
  END IF;

  RETURN v_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_replace_gallery_images(int, uuid[]) TO authenticated;


CREATE OR REPLACE FUNCTION public.admin_get_cms_page_row(
  p_page_key text
) RETURNS TABLE(
  id uuid,
  page_key text,
  category text,
  sort smallint,
  body_en text,
  body_es_draft text,
  body_es_published text,
  approved boolean,
  updated_at timestamptz
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  RETURN QUERY
    SELECT
      c.id,
      c.page_key,
      c.category,
      c.sort,
      c.body_en,
      c.body_es_draft,
      c.body_es_published,
      c.approved,
      c.updated_at
    FROM public.cms_page_content c
    WHERE c.page_key = trim(coalesce(p_page_key, ''))
    LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_get_cms_page_row(text) TO authenticated;


CREATE OR REPLACE FUNCTION public.admin_list_cms_page_content(
  p_category text,
  p_page_key_like text DEFAULT NULL,
  p_limit int DEFAULT 500
) RETURNS TABLE(
  id uuid,
  page_key text,
  category text,
  sort smallint,
  body_en text,
  body_es_draft text,
  body_es_published text,
  approved boolean,
  updated_at timestamptz
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_limit int;
  v_like text;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  IF coalesce(trim(p_category), '') = '' THEN
    RAISE EXCEPTION 'missing category';
  END IF;

  v_limit := coalesce(p_limit, 500);
  IF v_limit < 1 THEN
    RAISE EXCEPTION 'limit must be >= 1';
  END IF;
  IF v_limit > 2000 THEN
    RAISE EXCEPTION 'limit too large';
  END IF;

  v_like := NULLIF(trim(coalesce(p_page_key_like, '')), '');
  IF v_like IS NOT NULL THEN
    IF length(v_like) > 256 THEN
      RAISE EXCEPTION 'page_key_like too long';
    END IF;
    IF v_like !~ '^[a-z0-9._%:-]+$' THEN
      RAISE EXCEPTION 'invalid page_key_like';
    END IF;
  END IF;

  RETURN QUERY
    SELECT
      c.id,
      c.page_key,
      c.category,
      c.sort,
      c.body_en,
      c.body_es_draft,
      c.body_es_published,
      c.approved,
      c.updated_at
    FROM public.cms_page_content c
    WHERE c.category = trim(p_category)
      AND (v_like IS NULL OR c.page_key LIKE v_like)
    ORDER BY c.sort ASC, c.page_key ASC
    LIMIT v_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_cms_page_content(text, text, int) TO authenticated;
