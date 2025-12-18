--
-- PostgreSQL database dump
--

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA auth;


--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


--
-- Name: oauth_authorization_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_authorization_status AS ENUM (
    'pending',
    'approved',
    'denied',
    'expired'
);


--
-- Name: oauth_client_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_client_type AS ENUM (
    'public',
    'confidential'
);


--
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);


--
-- Name: oauth_response_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_response_type AS ENUM (
    'code'
);


--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


--
-- Name: Days_of_the_week; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Days_of_the_week" AS ENUM (
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
);


--
-- Name: TYPE "Days_of_the_week"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TYPE public."Days_of_the_week" IS 'days of the week';


--
-- Name: asset_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.asset_type AS ENUM (
    'video',
    'photo'
);


--
-- Name: TYPE asset_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TYPE public.asset_type IS 'video or picture';


--
-- Name: lesson_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.lesson_status AS ENUM (
    'booked',
    'completed',
    'canceled_with_refund',
    'canceled_without_refund'
);


--
-- Name: TYPE lesson_status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TYPE public.lesson_status IS 'the status of the lesson';


--
-- Name: photo_category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.photo_category AS ENUM (
    'logo',
    'hero',
    'lessons',
    'web_content',
    'uncategorized'
);


--
-- Name: TYPE photo_category; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TYPE public.photo_category IS 'what category is this photo ';


--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    session_time timestamp without time zone,
    group_size smallint,
    client_names text[],
    lesson_status public.lesson_status DEFAULT 'booked'::public.lesson_status,
    paid numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    tip numeric(10,2) DEFAULT '0'::numeric,
    deleted_at timestamp with time zone,
    CONSTRAINT sessions_paid_nonnegative CHECK ((paid >= (0)::numeric)),
    CONSTRAINT sessions_tip_nonnegative CHECK (((tip IS NULL) OR (tip >= (0)::numeric)))
);


--
-- Name: TABLE sessions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.sessions IS 'surf session slot';


--
-- Name: COLUMN sessions.lesson_status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.sessions.lesson_status IS 'what is the status of this lesson';


--
-- Name: COLUMN sessions.paid; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.sessions.paid IS 'how much was the base pay';


--
-- Name: COLUMN sessions.tip; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.sessions.tip IS 'what was the tip amount if any';


--
-- Name: admin_create_session(timestamp with time zone, integer, text[], public.lesson_status, numeric, numeric); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_create_session(p_session_time timestamp with time zone DEFAULT NULL::timestamp with time zone, p_group_size integer DEFAULT NULL::integer, p_client_names text[] DEFAULT NULL::text[], p_lesson_status public.lesson_status DEFAULT 'booked'::public.lesson_status, p_paid numeric DEFAULT 0, p_tip numeric DEFAULT NULL::numeric) RETURNS public.sessions
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare r public.sessions;
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  insert into public.sessions (session_time, group_size, client_names, lesson_status, paid, tip)
  values (p_session_time, p_group_size, p_client_names, p_lesson_status, p_paid, p_tip)
  returning * into r;

  return r;
end;
$$;


--
-- Name: admin_delete_page_content(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_delete_page_content(p_page_key text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  delete from public.cms_page_content
  where page_key = p_page_key;
end;
$$;


--
-- Name: admin_delete_session(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_delete_session(p_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  update public.sessions
  set deleted_at = now()
  where id = p_id;

  if not found then
    raise exception 'session not found';
  end if;
end;
$$;


--
-- Name: admin_hard_delete_session(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_hard_delete_session(p_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  delete from public.sessions where id = p_id;

  if not found then
    raise exception 'session not found';
  end if;
end;
$$;


--
-- Name: media_assets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.media_assets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean NOT NULL,
    bucket text NOT NULL,
    path text NOT NULL,
    session_id uuid,
    asset_type public.asset_type DEFAULT 'photo'::public.asset_type NOT NULL,
    sort smallint DEFAULT 32767 NOT NULL,
    category public.photo_category DEFAULT 'uncategorized'::public.photo_category NOT NULL,
    asset_key text,
    CONSTRAINT media_assets_bucket_not_empty CHECK ((length(TRIM(BOTH FROM bucket)) > 0)),
    CONSTRAINT media_assets_path_not_empty CHECK ((length(TRIM(BOTH FROM path)) > 0)),
    CONSTRAINT media_assets_sort_check CHECK (((sort >= '-32768'::integer) AND (sort <= 32767))),
    CONSTRAINT media_assets_title_not_empty CHECK ((length(TRIM(BOTH FROM title)) > 0))
);


--
-- Name: TABLE media_assets; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.media_assets IS 'where photos are stored';


--
-- Name: COLUMN media_assets.public; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.media_assets.public IS 'Boolean is public or not';


--
-- Name: COLUMN media_assets.bucket; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.media_assets.bucket IS 'site_photos vs. galleries';


--
-- Name: COLUMN media_assets.path; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.media_assets.path IS 'where the photos are stored';


--
-- Name: COLUMN media_assets.session_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.media_assets.session_id IS 'what lesson is it from';


--
-- Name: COLUMN media_assets.asset_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.media_assets.asset_type IS 'video or picture';


--
-- Name: COLUMN media_assets.sort; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.media_assets.sort IS 'method to sort best first. -1 is pin to top';


--
-- Name: COLUMN media_assets.category; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.media_assets.category IS 'What category does this fall under (logo, lessons, web content ect.)';


--
-- Name: COLUMN media_assets.asset_key; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.media_assets.asset_key IS 'Stable frontend pointer. Use exact keys for single assets (e.g., home.hero) and prefix namespaces for streams (e.g., home.photo_stream.001).';


--
-- Name: admin_list_media_assets(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_list_media_assets() RETURNS SETOF public.media_assets
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  return query
  select *
  from public.media_assets
  order by public desc, category asc, sort asc, created_at desc;
end;
$$;


--
-- Name: admin_list_sessions(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_list_sessions() RETURNS SETOF public.sessions
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  return query
  select *
  from public.sessions
  where deleted_at is null
  order by session_time desc nulls last, created_at desc;
end;
$$;


--
-- Name: admin_list_sessions(boolean); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_list_sessions(include_deleted boolean DEFAULT false) RETURNS SETOF public.sessions
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  return query
  select *
  from public.sessions
  where
    include_deleted = true
    or deleted_at is null
  order by
    deleted_at asc nulls first,
    session_time desc nulls last,
    created_at desc;
end;
$$;


--
-- Name: admin_publish_es(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_publish_es(p_page_key text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  update public.cms_page_content
  set
    body_es_published = body_es_draft,
    approved = true,
    updated_by = auth.uid()
  where page_key = p_page_key;
end;
$$;


--
-- Name: admin_restore_session(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_restore_session(p_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  update public.sessions
  set deleted_at = null
  where id = p_id;

  if not found then
    raise exception 'session not found';
  end if;
end;
$$;


--
-- Name: admin_update_session(uuid, timestamp with time zone, integer, text[], public.lesson_status, numeric, numeric); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_update_session(p_id uuid, p_session_time timestamp with time zone DEFAULT NULL::timestamp with time zone, p_group_size integer DEFAULT NULL::integer, p_client_names text[] DEFAULT NULL::text[], p_lesson_status public.lesson_status DEFAULT NULL::public.lesson_status, p_paid numeric DEFAULT NULL::numeric, p_tip numeric DEFAULT NULL::numeric) RETURNS public.sessions
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare r public.sessions;
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  update public.sessions
  set
    session_time = coalesce(p_session_time, session_time),
    group_size   = coalesce(p_group_size, group_size),
    client_names = coalesce(p_client_names, client_names),
    lesson_status= coalesce(p_lesson_status, lesson_status),
    paid         = coalesce(p_paid, paid),
    tip          = coalesce(p_tip, tip)
  where id = p_id
  returning * into r;

  if r.id is null then
    raise exception 'session not found';
  end if;

  return r;
end;
$$;


--
-- Name: admin_upsert_media_asset(text, text, text, boolean, public.photo_category, public.asset_type, text, uuid, smallint, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_upsert_media_asset(p_bucket text, p_path text, p_title text, p_public boolean, p_category public.photo_category, p_asset_type public.asset_type, p_description text DEFAULT NULL::text, p_session_id uuid DEFAULT NULL::uuid, p_sort smallint DEFAULT 32767, p_id uuid DEFAULT NULL::uuid) RETURNS public.media_assets
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  result public.media_assets;
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  if p_bucket is null or length(trim(p_bucket)) = 0 then
    raise exception 'bucket is required';
  end if;
  if p_path is null or length(trim(p_path)) = 0 then
    raise exception 'path is required';
  end if;
  if p_title is null or length(trim(p_title)) = 0 then
    raise exception 'title is required';
  end if;

  insert into public.media_assets (
    id, bucket, path, title, public, category, asset_type, description, session_id, sort
  )
  values (
    coalesce(p_id, gen_random_uuid()),
    p_bucket, p_path, p_title, p_public, p_category, p_asset_type,
    p_description, p_session_id, p_sort
  )
  on conflict (bucket, path)
  do update set
    title = excluded.title,
    public = excluded.public,
    category = excluded.category,
    asset_type = excluded.asset_type,
    description = excluded.description,
    session_id = excluded.session_id,
    sort = excluded.sort
  returning * into result;

  return result;
end;
$$;


--
-- Name: admin_upsert_media_asset(text, text, text, boolean, public.photo_category, public.asset_type, text, uuid, smallint, uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_upsert_media_asset(p_bucket text, p_path text, p_title text, p_public boolean, p_category public.photo_category, p_asset_type public.asset_type, p_description text DEFAULT NULL::text, p_session_id uuid DEFAULT NULL::uuid, p_sort smallint DEFAULT 32767, p_id uuid DEFAULT NULL::uuid, p_asset_key text DEFAULT NULL::text) RETURNS public.media_assets
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  result public.media_assets;
  v_asset_key text;
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  if p_bucket is null or length(trim(p_bucket)) = 0 then
    raise exception 'bucket is required';
  end if;

  if p_path is null or length(trim(p_path)) = 0 then
    raise exception 'path is required';
  end if;

  if p_title is null or length(trim(p_title)) = 0 then
    raise exception 'title is required';
  end if;

  v_asset_key := nullif(trim(p_asset_key), '');

  -- Upsert keyed on (bucket, path) as your storage identity.
  insert into public.media_assets (
    id,
    bucket,
    path,
    title,
    public,
    category,
    asset_type,
    description,
    session_id,
    sort,
    asset_key
  )
  values (
    coalesce(p_id, gen_random_uuid()),
    trim(p_bucket),
    trim(p_path),
    trim(p_title),
    p_public,
    p_category,
    p_asset_type,
    p_description,
    p_session_id,
    p_sort,
    v_asset_key
  )
  on conflict (bucket, path)
  do update set
    title = excluded.title,
    public = excluded.public,
    category = excluded.category,
    asset_type = excluded.asset_type,
    description = excluded.description,
    session_id = excluded.session_id,
    sort = excluded.sort,
    asset_key = excluded.asset_key,
    updated_at = now()
  returning * into result;

  return result;
end;
$$;


--
-- Name: admin_upsert_page_content(text, text, text, text, boolean, smallint, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_upsert_page_content(p_page_key text, p_body_en text DEFAULT NULL::text, p_body_es_draft text DEFAULT NULL::text, p_body_es_published text DEFAULT NULL::text, p_approved boolean DEFAULT NULL::boolean, p_sort smallint DEFAULT NULL::smallint, p_category text DEFAULT NULL::text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  insert into public.cms_page_content (
    page_key,
    body_en,
    body_es_draft,
    body_es_published,
    approved,
    sort,
    category,
    created_by,
    updated_by
  )
  values (
    p_page_key,
    p_body_en,
    p_body_es_draft,
    p_body_es_published,
    coalesce(p_approved, false),
    coalesce(p_sort, 32767),
    p_category,
    auth.uid(),
    auth.uid()
  )
  on conflict (page_key) do update
  set
    body_en = coalesce(p_body_en, public.cms_page_content.body_en),
    body_es_draft = coalesce(p_body_es_draft, public.cms_page_content.body_es_draft),
    body_es_published = coalesce(p_body_es_published, public.cms_page_content.body_es_published),
    approved = coalesce(p_approved, public.cms_page_content.approved),
    sort = coalesce(p_sort, public.cms_page_content.sort),
    category = coalesce(p_category, public.cms_page_content.category),
    updated_by = auth.uid();
end;
$$;


--
-- Name: get_page_content(text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_page_content(p_page_key text, p_locale text DEFAULT 'en'::text) RETURNS TABLE(page_key text, locale text, body text, updated_at timestamp with time zone)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
declare
  v_row public.cms_page_content%rowtype;
  v_body text;
  v_locale text;
begin
  select *
    into v_row
  from public.cms_page_content c
  where c.page_key = p_page_key
  limit 1;

  if not found then
    return;
  end if;

  -- Spanish: only show if approved and published exists; otherwise fallback to English
  if lower(coalesce(p_locale,'en')) = 'es'
     and v_row.approved = true
     and v_row.body_es_published is not null
     and length(v_row.body_es_published) > 0
  then
    v_body := v_row.body_es_published;
    v_locale := 'es';
  else
    v_body := v_row.body_en;
    v_locale := 'en';
  end if;

  return query
  select v_row.page_key, v_locale, v_body, v_row.updated_at;
end;
$$;


--
-- Name: get_public_media_asset_by_key(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_public_media_asset_by_key(p_asset_key text) RETURNS SETOF public.media_assets
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select *
  from public.media_assets
  where public = true
    and asset_key = p_asset_key
  order by sort asc, created_at desc;
$$;


--
-- Name: get_public_media_assets(public.photo_category); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_public_media_assets(p_category public.photo_category DEFAULT NULL::public.photo_category) RETURNS SETOF public.media_assets
    LANGUAGE sql STABLE
    SET search_path TO 'public'
    AS $$
  select *
  from public.media_assets
  where public = true
    and (p_category is null or category = p_category)
  order by sort asc, created_at desc;
$$;


--
-- Name: get_public_media_assets_by_prefix(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_public_media_assets_by_prefix(p_prefix text) RETURNS SETOF public.media_assets
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select *
  from public.media_assets
  where public = true
    and asset_key is not null
    and asset_key like (p_prefix || '%')
  order by sort asc, created_at desc;
$$;


--
-- Name: get_public_sessions(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_public_sessions() RETURNS SETOF public.sessions
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select *
  from public.sessions
  where deleted_at is null
    and lesson_status = 'booked'::public.lesson_status
  order by session_time desc nulls last, created_at desc;
$$;


--
-- Name: is_admin(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_admin() RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  select exists (
    select 1
    from public.admin_users au
    where au.id = auth.uid()
  );
$$;


--
-- Name: is_valid_json(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_valid_json(p_text text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$ BEGIN IF p_text IS NULL OR btrim(p_text) = '' THEN RETURN true; END IF; PERFORM p_text::jsonb; RETURN true; EXCEPTION WHEN others THEN RETURN false; END; $$;


--
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  new.updated_at := now();
  return new;
end;
$$;


--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text NOT NULL,
    code_challenge_method auth.code_challenge_method NOT NULL,
    code_challenge text NOT NULL,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone
);


--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.flow_state IS 'stores metadata for pkce logins';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid,
    last_webauthn_challenge_data jsonb
);


--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: COLUMN mfa_factors.last_webauthn_challenge_data; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.mfa_factors.last_webauthn_challenge_data IS 'Stores the latest WebAuthn challenge data including attestation/assertion for customer verification';


--
-- Name: oauth_authorizations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_authorizations (
    id uuid NOT NULL,
    authorization_id text NOT NULL,
    client_id uuid NOT NULL,
    user_id uuid,
    redirect_uri text NOT NULL,
    scope text NOT NULL,
    state text,
    resource text,
    code_challenge text,
    code_challenge_method auth.code_challenge_method,
    response_type auth.oauth_response_type DEFAULT 'code'::auth.oauth_response_type NOT NULL,
    status auth.oauth_authorization_status DEFAULT 'pending'::auth.oauth_authorization_status NOT NULL,
    authorization_code text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '00:03:00'::interval) NOT NULL,
    approved_at timestamp with time zone,
    nonce text,
    CONSTRAINT oauth_authorizations_authorization_code_length CHECK ((char_length(authorization_code) <= 255)),
    CONSTRAINT oauth_authorizations_code_challenge_length CHECK ((char_length(code_challenge) <= 128)),
    CONSTRAINT oauth_authorizations_expires_at_future CHECK ((expires_at > created_at)),
    CONSTRAINT oauth_authorizations_nonce_length CHECK ((char_length(nonce) <= 255)),
    CONSTRAINT oauth_authorizations_redirect_uri_length CHECK ((char_length(redirect_uri) <= 2048)),
    CONSTRAINT oauth_authorizations_resource_length CHECK ((char_length(resource) <= 2048)),
    CONSTRAINT oauth_authorizations_scope_length CHECK ((char_length(scope) <= 4096)),
    CONSTRAINT oauth_authorizations_state_length CHECK ((char_length(state) <= 4096))
);


--
-- Name: oauth_client_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_client_states (
    id uuid NOT NULL,
    provider_type text NOT NULL,
    code_verifier text,
    created_at timestamp with time zone NOT NULL
);


--
-- Name: TABLE oauth_client_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.oauth_client_states IS 'Stores OAuth states for third-party provider authentication flows where Supabase acts as the OAuth client.';


--
-- Name: oauth_clients; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_clients (
    id uuid NOT NULL,
    client_secret_hash text,
    registration_type auth.oauth_registration_type NOT NULL,
    redirect_uris text NOT NULL,
    grant_types text NOT NULL,
    client_name text,
    client_uri text,
    logo_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    client_type auth.oauth_client_type DEFAULT 'confidential'::auth.oauth_client_type NOT NULL,
    CONSTRAINT oauth_clients_client_name_length CHECK ((char_length(client_name) <= 1024)),
    CONSTRAINT oauth_clients_client_uri_length CHECK ((char_length(client_uri) <= 2048)),
    CONSTRAINT oauth_clients_logo_uri_length CHECK ((char_length(logo_uri) <= 2048))
);


--
-- Name: oauth_consents; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_consents (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    client_id uuid NOT NULL,
    scopes text NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone,
    CONSTRAINT oauth_consents_revoked_after_granted CHECK (((revoked_at IS NULL) OR (revoked_at >= granted_at))),
    CONSTRAINT oauth_consents_scopes_length CHECK ((char_length(scopes) <= 2048)),
    CONSTRAINT oauth_consents_scopes_not_empty CHECK ((char_length(TRIM(BOTH FROM scopes)) > 0))
);


--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: -
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text,
    oauth_client_id uuid,
    refresh_token_hmac_key text,
    refresh_token_counter bigint,
    scopes text,
    CONSTRAINT sessions_scopes_length CHECK ((char_length(scopes) <= 4096))
);


--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: COLUMN sessions.refresh_token_hmac_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.refresh_token_hmac_key IS 'Holds a HMAC-SHA256 key used to sign refresh tokens for this session.';


--
-- Name: COLUMN sessions.refresh_token_counter; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.refresh_token_counter IS 'Holds the ID (counter) of the last issued refresh token.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: admin_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_users (
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    name text,
    email text,
    phone_number text
);


--
-- Name: TABLE admin_users; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.admin_users IS 'Who runs this thing anyways';


--
-- Name: cms_page_content; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cms_page_content (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid DEFAULT auth.uid(),
    updated_by uuid DEFAULT auth.uid(),
    page_key text NOT NULL,
    body_en text,
    body_es_draft text,
    body_es_published text,
    approved boolean DEFAULT false NOT NULL,
    sort smallint DEFAULT 32767 NOT NULL,
    category text
);


--
-- Name: TABLE cms_page_content; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.cms_page_content IS 'Lets the admin dashboard change the website content';


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
00000000-0000-0000-0000-000000000000	71ea533c-6981-4dcf-b845-d5226d27839f	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"sunsetsurfacademy@gmail.com","user_id":"e8238f2b-601f-49a6-b837-21b1d5512415","user_phone":""}}	2025-12-15 23:50:54.192699+00	
00000000-0000-0000-0000-000000000000	cf4c59b6-4fde-415a-9d8c-f8cd0f715b8f	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"tyler.adean93@yahoo.com","user_id":"d17a1bd1-5f6c-4c80-8813-30d927cb3809","user_phone":""}}	2025-12-16 00:16:17.583282+00	
00000000-0000-0000-0000-000000000000	830f97ca-66b8-474b-b9c2-680e14a399c1	{"action":"login","actor_id":"d17a1bd1-5f6c-4c80-8813-30d927cb3809","actor_username":"tyler.adean93@yahoo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-16 05:06:37.127524+00	
00000000-0000-0000-0000-000000000000	6455f7d6-03e8-4df0-874d-b6dc4ea7e693	{"action":"login","actor_id":"d17a1bd1-5f6c-4c80-8813-30d927cb3809","actor_username":"tyler.adean93@yahoo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-16 05:07:12.60043+00	
00000000-0000-0000-0000-000000000000	d57f6f4f-4ea7-4942-8dee-36e3fc1c17db	{"action":"login","actor_id":"d17a1bd1-5f6c-4c80-8813-30d927cb3809","actor_username":"tyler.adean93@yahoo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-16 05:18:52.744813+00	
00000000-0000-0000-0000-000000000000	62fc14c3-3b8f-4d86-9163-78c174168231	{"action":"login","actor_id":"d17a1bd1-5f6c-4c80-8813-30d927cb3809","actor_username":"tyler.adean93@yahoo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-16 05:34:20.081945+00	
00000000-0000-0000-0000-000000000000	1f13bccb-94b0-4971-b026-33b7525b5e55	{"action":"token_refreshed","actor_id":"d17a1bd1-5f6c-4c80-8813-30d927cb3809","actor_username":"tyler.adean93@yahoo.com","actor_via_sso":false,"log_type":"token"}	2025-12-16 06:32:23.247774+00	
00000000-0000-0000-0000-000000000000	36388e8a-4e05-44f9-a078-66dd6ed1a489	{"action":"token_revoked","actor_id":"d17a1bd1-5f6c-4c80-8813-30d927cb3809","actor_username":"tyler.adean93@yahoo.com","actor_via_sso":false,"log_type":"token"}	2025-12-16 06:32:23.268223+00	
00000000-0000-0000-0000-000000000000	d4d7a91a-0ea2-4985-a787-c5f430feb658	{"action":"token_refreshed","actor_id":"d17a1bd1-5f6c-4c80-8813-30d927cb3809","actor_username":"tyler.adean93@yahoo.com","actor_via_sso":false,"log_type":"token"}	2025-12-16 07:30:53.050184+00	
00000000-0000-0000-0000-000000000000	7f1877fb-6435-4d5b-8699-53d25111faa8	{"action":"token_revoked","actor_id":"d17a1bd1-5f6c-4c80-8813-30d927cb3809","actor_username":"tyler.adean93@yahoo.com","actor_via_sso":false,"log_type":"token"}	2025-12-16 07:30:53.062224+00	
00000000-0000-0000-0000-000000000000	3ee1f9f1-928e-4cfc-bfef-8a19dbb04f30	{"action":"token_refreshed","actor_id":"d17a1bd1-5f6c-4c80-8813-30d927cb3809","actor_username":"tyler.adean93@yahoo.com","actor_via_sso":false,"log_type":"token"}	2025-12-16 08:29:23.215346+00	
00000000-0000-0000-0000-000000000000	64934479-d0a2-405d-b603-7cf2c36b0e78	{"action":"token_revoked","actor_id":"d17a1bd1-5f6c-4c80-8813-30d927cb3809","actor_username":"tyler.adean93@yahoo.com","actor_via_sso":false,"log_type":"token"}	2025-12-16 08:29:23.229403+00	
00000000-0000-0000-0000-000000000000	c13112ed-1704-459b-94c5-16501d57c0b6	{"action":"token_refreshed","actor_id":"d17a1bd1-5f6c-4c80-8813-30d927cb3809","actor_username":"tyler.adean93@yahoo.com","actor_via_sso":false,"log_type":"token"}	2025-12-16 09:27:53.247512+00	
00000000-0000-0000-0000-000000000000	3e3f467c-e3b2-4d82-9d23-d70ae3e69067	{"action":"token_revoked","actor_id":"d17a1bd1-5f6c-4c80-8813-30d927cb3809","actor_username":"tyler.adean93@yahoo.com","actor_via_sso":false,"log_type":"token"}	2025-12-16 09:27:53.273439+00	
00000000-0000-0000-0000-000000000000	9f4996dc-86a1-48ee-83c4-d70aa6c983c7	{"action":"token_refreshed","actor_id":"d17a1bd1-5f6c-4c80-8813-30d927cb3809","actor_username":"tyler.adean93@yahoo.com","actor_via_sso":false,"log_type":"token"}	2025-12-16 10:26:23.179588+00	
00000000-0000-0000-0000-000000000000	109cc25e-0240-49e4-8fce-d82789526f67	{"action":"token_revoked","actor_id":"d17a1bd1-5f6c-4c80-8813-30d927cb3809","actor_username":"tyler.adean93@yahoo.com","actor_via_sso":false,"log_type":"token"}	2025-12-16 10:26:23.191706+00	
00000000-0000-0000-0000-000000000000	15f857f6-fa4d-4aae-a076-9ba58467f5cb	{"action":"token_refreshed","actor_id":"d17a1bd1-5f6c-4c80-8813-30d927cb3809","actor_username":"tyler.adean93@yahoo.com","actor_via_sso":false,"log_type":"token"}	2025-12-16 11:24:53.180823+00	
00000000-0000-0000-0000-000000000000	77348fd1-c729-4c55-b5da-5ae26832b65b	{"action":"token_revoked","actor_id":"d17a1bd1-5f6c-4c80-8813-30d927cb3809","actor_username":"tyler.adean93@yahoo.com","actor_via_sso":false,"log_type":"token"}	2025-12-16 11:24:53.200089+00	
00000000-0000-0000-0000-000000000000	e9c7f7b7-7a8d-492c-99b2-7169bad7e3d6	{"action":"token_refreshed","actor_id":"d17a1bd1-5f6c-4c80-8813-30d927cb3809","actor_username":"tyler.adean93@yahoo.com","actor_via_sso":false,"log_type":"token"}	2025-12-16 12:23:23.283886+00	
00000000-0000-0000-0000-000000000000	8d9c6efc-b301-4727-b3a2-9e4ff3591512	{"action":"token_revoked","actor_id":"d17a1bd1-5f6c-4c80-8813-30d927cb3809","actor_username":"tyler.adean93@yahoo.com","actor_via_sso":false,"log_type":"token"}	2025-12-16 12:23:23.294349+00	
00000000-0000-0000-0000-000000000000	28b427d7-196c-4945-8baa-06a50b5b1371	{"action":"token_refreshed","actor_id":"d17a1bd1-5f6c-4c80-8813-30d927cb3809","actor_username":"tyler.adean93@yahoo.com","actor_via_sso":false,"log_type":"token"}	2025-12-16 13:21:53.383632+00	
00000000-0000-0000-0000-000000000000	59269160-cce9-4ee6-a50d-3c23fa10faaf	{"action":"token_revoked","actor_id":"d17a1bd1-5f6c-4c80-8813-30d927cb3809","actor_username":"tyler.adean93@yahoo.com","actor_via_sso":false,"log_type":"token"}	2025-12-16 13:21:53.405888+00	
00000000-0000-0000-0000-000000000000	5e4d2a14-3c36-4ea4-a399-ce0f51680ea4	{"action":"login","actor_id":"d17a1bd1-5f6c-4c80-8813-30d927cb3809","actor_username":"tyler.adean93@yahoo.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-16 14:13:05.82302+00	
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at) FROM stdin;
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
e8238f2b-601f-49a6-b837-21b1d5512415	e8238f2b-601f-49a6-b837-21b1d5512415	{"sub": "e8238f2b-601f-49a6-b837-21b1d5512415", "email": "sunsetsurfacademy@gmail.com", "email_verified": false, "phone_verified": false}	email	2025-12-15 23:50:54.186996+00	2025-12-15 23:50:54.188095+00	2025-12-15 23:50:54.188095+00	bf2e51ca-b43d-411b-82c2-762f4fac2e97
d17a1bd1-5f6c-4c80-8813-30d927cb3809	d17a1bd1-5f6c-4c80-8813-30d927cb3809	{"sub": "d17a1bd1-5f6c-4c80-8813-30d927cb3809", "email": "tyler.adean93@yahoo.com", "email_verified": false, "phone_verified": false}	email	2025-12-16 00:16:17.575336+00	2025-12-16 00:16:17.575401+00	2025-12-16 00:16:17.575401+00	9fd9414a-9bea-4f02-97ce-1790e51783cc
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
9b099aba-499d-4777-8a35-ea576f319974	2025-12-16 05:06:37.199431+00	2025-12-16 05:06:37.199431+00	password	a2b2aaaf-dcd0-491e-b1ac-8236678af4b6
9463713b-ba32-4123-8d3c-cf7e5664ea1e	2025-12-16 05:07:12.60414+00	2025-12-16 05:07:12.60414+00	password	29b2db9c-4562-4fe5-a61c-28ef1a23ff11
4acb6be0-74c9-4e18-9351-ea41f43a7089	2025-12-16 05:18:52.781393+00	2025-12-16 05:18:52.781393+00	password	7675fc06-ae5e-4062-b4e4-864031ac9e96
66664f43-54ef-4369-acc3-86608be5887b	2025-12-16 05:34:20.189272+00	2025-12-16 05:34:20.189272+00	password	288eacdf-5173-4f3b-ac3b-fb2e0c108661
1fea6750-eade-4801-9782-1a3b2fa9b65b	2025-12-16 14:13:05.934843+00	2025-12-16 14:13:05.934843+00	password	176ed923-6ac5-4e84-a734-48c786a8fac3
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid, last_webauthn_challenge_data) FROM stdin;
\.


--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_authorizations (id, authorization_id, client_id, user_id, redirect_uri, scope, state, resource, code_challenge, code_challenge_method, response_type, status, authorization_code, created_at, expires_at, approved_at, nonce) FROM stdin;
\.


--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_client_states (id, provider_type, code_verifier, created_at) FROM stdin;
\.


--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_clients (id, client_secret_hash, registration_type, redirect_uris, grant_types, client_name, client_uri, logo_uri, created_at, updated_at, deleted_at, client_type) FROM stdin;
\.


--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_consents (id, user_id, client_id, scopes, granted_at, revoked_at) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
00000000-0000-0000-0000-000000000000	1	e26vzc3zsp3u	d17a1bd1-5f6c-4c80-8813-30d927cb3809	f	2025-12-16 05:06:37.173301+00	2025-12-16 05:06:37.173301+00	\N	9b099aba-499d-4777-8a35-ea576f319974
00000000-0000-0000-0000-000000000000	2	bmotxqixjg2l	d17a1bd1-5f6c-4c80-8813-30d927cb3809	f	2025-12-16 05:07:12.602261+00	2025-12-16 05:07:12.602261+00	\N	9463713b-ba32-4123-8d3c-cf7e5664ea1e
00000000-0000-0000-0000-000000000000	3	xsuts3776ygv	d17a1bd1-5f6c-4c80-8813-30d927cb3809	f	2025-12-16 05:18:52.767933+00	2025-12-16 05:18:52.767933+00	\N	4acb6be0-74c9-4e18-9351-ea41f43a7089
00000000-0000-0000-0000-000000000000	4	z6po4j5et335	d17a1bd1-5f6c-4c80-8813-30d927cb3809	t	2025-12-16 05:34:20.149219+00	2025-12-16 06:32:23.269554+00	\N	66664f43-54ef-4369-acc3-86608be5887b
00000000-0000-0000-0000-000000000000	5	5v42ryryx5ud	d17a1bd1-5f6c-4c80-8813-30d927cb3809	t	2025-12-16 06:32:23.285089+00	2025-12-16 07:30:53.062905+00	z6po4j5et335	66664f43-54ef-4369-acc3-86608be5887b
00000000-0000-0000-0000-000000000000	6	b6y7av7aayhk	d17a1bd1-5f6c-4c80-8813-30d927cb3809	t	2025-12-16 07:30:53.079025+00	2025-12-16 08:29:23.2357+00	5v42ryryx5ud	66664f43-54ef-4369-acc3-86608be5887b
00000000-0000-0000-0000-000000000000	7	wpejxwjr6rtr	d17a1bd1-5f6c-4c80-8813-30d927cb3809	t	2025-12-16 08:29:23.247608+00	2025-12-16 09:27:53.27599+00	b6y7av7aayhk	66664f43-54ef-4369-acc3-86608be5887b
00000000-0000-0000-0000-000000000000	8	ovld73cqbtqv	d17a1bd1-5f6c-4c80-8813-30d927cb3809	t	2025-12-16 09:27:53.294837+00	2025-12-16 10:26:23.194183+00	wpejxwjr6rtr	66664f43-54ef-4369-acc3-86608be5887b
00000000-0000-0000-0000-000000000000	9	e4gxtl3u6iql	d17a1bd1-5f6c-4c80-8813-30d927cb3809	t	2025-12-16 10:26:23.203811+00	2025-12-16 11:24:53.202006+00	ovld73cqbtqv	66664f43-54ef-4369-acc3-86608be5887b
00000000-0000-0000-0000-000000000000	10	2pyvw4cdzfum	d17a1bd1-5f6c-4c80-8813-30d927cb3809	t	2025-12-16 11:24:53.213859+00	2025-12-16 12:23:23.295007+00	e4gxtl3u6iql	66664f43-54ef-4369-acc3-86608be5887b
00000000-0000-0000-0000-000000000000	11	yv6uwrmuvuq4	d17a1bd1-5f6c-4c80-8813-30d927cb3809	t	2025-12-16 12:23:23.306592+00	2025-12-16 13:21:53.407756+00	2pyvw4cdzfum	66664f43-54ef-4369-acc3-86608be5887b
00000000-0000-0000-0000-000000000000	12	4yir7ce77ibz	d17a1bd1-5f6c-4c80-8813-30d927cb3809	f	2025-12-16 13:21:53.42782+00	2025-12-16 13:21:53.42782+00	yv6uwrmuvuq4	66664f43-54ef-4369-acc3-86608be5887b
00000000-0000-0000-0000-000000000000	13	3iu7pfvcrrgi	d17a1bd1-5f6c-4c80-8813-30d927cb3809	f	2025-12-16 14:13:05.890998+00	2025-12-16 14:13:05.890998+00	\N	1fea6750-eade-4801-9782-1a3b2fa9b65b
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
20250717082212
20250731150234
20250804100000
20250901200500
20250903112500
20250904133000
20250925093508
20251007112900
20251104100000
20251111201300
20251201000000
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag, oauth_client_id, refresh_token_hmac_key, refresh_token_counter, scopes) FROM stdin;
9b099aba-499d-4777-8a35-ea576f319974	d17a1bd1-5f6c-4c80-8813-30d927cb3809	2025-12-16 05:06:37.151901+00	2025-12-16 05:06:37.151901+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	76.106.161.12	\N	\N	\N	\N	\N
9463713b-ba32-4123-8d3c-cf7e5664ea1e	d17a1bd1-5f6c-4c80-8813-30d927cb3809	2025-12-16 05:07:12.601426+00	2025-12-16 05:07:12.601426+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	76.106.161.12	\N	\N	\N	\N	\N
4acb6be0-74c9-4e18-9351-ea41f43a7089	d17a1bd1-5f6c-4c80-8813-30d927cb3809	2025-12-16 05:18:52.757574+00	2025-12-16 05:18:52.757574+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	76.106.161.12	\N	\N	\N	\N	\N
66664f43-54ef-4369-acc3-86608be5887b	d17a1bd1-5f6c-4c80-8813-30d927cb3809	2025-12-16 05:34:20.113733+00	2025-12-16 13:21:53.451719+00	\N	aal1	\N	2025-12-16 13:21:53.449354	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	76.106.161.12	\N	\N	\N	\N	\N
1fea6750-eade-4801-9782-1a3b2fa9b65b	d17a1bd1-5f6c-4c80-8813-30d927cb3809	2025-12-16 14:13:05.84819+00	2025-12-16 14:13:05.84819+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	76.106.161.12	\N	\N	\N	\N	\N
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at, disabled) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
00000000-0000-0000-0000-000000000000	e8238f2b-601f-49a6-b837-21b1d5512415	authenticated	authenticated	sunsetsurfacademy@gmail.com	$2a$10$e8SW3.NRsF10rGP6hNLVZObQ53IixhAa8AkZzDMCChFFJI/5SV6tO	2025-12-15 23:50:54.198465+00	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2025-12-15 23:50:54.170638+00	2025-12-15 23:50:54.204739+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	d17a1bd1-5f6c-4c80-8813-30d927cb3809	authenticated	authenticated	tyler.adean93@yahoo.com	$2a$10$qxKnDUaauQ1saQ0qIoJsfOIwsmlYvizRST2Xj.PRRUsegQ3Tw1vjq	2025-12-16 00:16:17.594882+00	\N		\N		\N			\N	2025-12-16 14:13:05.847469+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2025-12-16 00:16:17.555897+00	2025-12-16 14:13:05.925312+00	\N	\N			\N		0	\N		\N	f	\N	f
\.


--
-- Data for Name: admin_users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admin_users (id, created_at, name, email, phone_number) FROM stdin;
d17a1bd1-5f6c-4c80-8813-30d927cb3809	2025-12-16 00:16:43+00	Tyler Dean	tyler.adean93@yahoo.com	+1 (619) 665-0411
e8238f2b-601f-49a6-b837-21b1d5512415	2025-12-16 00:14:23+00	Jazmine Dean Perez	sunsetsurfacademy@gmail.com	+1 (939) 525-0307
\.


--
-- Data for Name: cms_page_content; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) FROM stdin;
\.


--
-- Data for Name: media_assets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.media_assets (id, title, description, created_at, updated_at, public, bucket, path, session_id, asset_type, sort, category, asset_key) FROM stdin;
15466f82-4c54-4a68-8fc4-585f680ea6c8	image_6483441 (1)	surf school content	2025-12-15 22:56:39.915498+00	2025-12-15 22:56:39.915498+00	t	Lesson_Photos	image_6483441 (1).JPG	\N	photo	32767	lessons	\N
213d091e-9a44-4771-a732-b4b13e8b98d0	IMG_3856	surf school content	2025-12-15 22:56:39.915498+00	2025-12-15 22:56:39.915498+00	t	Lesson_Photos	IMG_3856.JPG	\N	photo	32767	lessons	\N
3ed412c2-8fd6-486c-8bb0-4d323f57b55d	surfSchoolShot	surf school content	2025-12-15 22:56:39.915498+00	2025-12-15 22:56:39.915498+00	t	Lesson_Photos	surfSchoolShot.png	\N	photo	32767	lessons	\N
47c9d39d-b885-4a77-93d1-78a877aac0da	IMG_2505	surf school content	2025-12-15 22:56:39.915498+00	2025-12-15 22:56:39.915498+00	t	Lesson_Photos	IMG_2505.JPG	\N	photo	32767	lessons	\N
5553fefc-7593-4d79-b146-e28a5524b9fe	IMG_3633	surf school content	2025-12-15 22:56:39.915498+00	2025-12-15 22:56:39.915498+00	t	Lesson_Photos	IMG_3633.JPG	\N	photo	32767	lessons	\N
568c4677-2653-4861-9aab-5d73389964d1	IMG_2505 2	surf school content	2025-12-15 22:56:39.915498+00	2025-12-15 22:56:39.915498+00	t	Lesson_Photos	IMG_2505 2.JPG	\N	photo	32767	lessons	\N
626ad533-3bbc-4700-bf37-e6699f1735ca	IMG_3627	surf school content	2025-12-15 22:56:39.915498+00	2025-12-15 22:56:39.915498+00	t	Lesson_Photos	IMG_3627.JPG	\N	photo	32767	lessons	\N
8dff0ad0-1944-4a5a-9138-027c5135b74d	IMG_3855	surf school content	2025-12-15 22:56:39.915498+00	2025-12-15 22:56:39.915498+00	t	Lesson_Photos	IMG_3855.JPG	\N	photo	32767	lessons	\N
98c04638-721e-4b79-bb67-7288d175abae	IMG_3629	surf school content	2025-12-15 22:56:39.915498+00	2025-12-15 22:56:39.915498+00	t	Lesson_Photos	IMG_3629.JPG	\N	photo	32767	lessons	\N
9cdfcc3f-a3d7-4a2c-b42a-218a8f0b1e7d	image_6483441 (5)	surf school content	2025-12-15 22:56:39.915498+00	2025-12-15 22:56:39.915498+00	t	Lesson_Photos	image_6483441 (5).JPG	\N	photo	32767	lessons	\N
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sessions (id, created_at, session_time, group_size, client_names, lesson_status, paid, tip, deleted_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: -
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 13, true);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_code_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_code_key UNIQUE (authorization_code);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_id_key UNIQUE (authorization_id);


--
-- Name: oauth_authorizations oauth_authorizations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_pkey PRIMARY KEY (id);


--
-- Name: oauth_client_states oauth_client_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_client_states
    ADD CONSTRAINT oauth_client_states_pkey PRIMARY KEY (id);


--
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_user_client_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_client_unique UNIQUE (user_id, client_id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: admin_users admin_users_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_id_key UNIQUE (id);


--
-- Name: admin_users admin_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_pkey PRIMARY KEY (id);


--
-- Name: cms_page_content cms_page_content_page_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cms_page_content
    ADD CONSTRAINT cms_page_content_page_key_key UNIQUE (page_key);


--
-- Name: cms_page_content cms_page_content_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cms_page_content
    ADD CONSTRAINT cms_page_content_pkey PRIMARY KEY (id);


--
-- Name: media_assets media_assets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media_assets
    ADD CONSTRAINT media_assets_pkey PRIMARY KEY (id);


--
-- Name: sessions session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT session_pkey PRIMARY KEY (id);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_oauth_client_states_created_at; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_oauth_client_states_created_at ON auth.oauth_client_states USING btree (created_at);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: oauth_auth_pending_exp_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_auth_pending_exp_idx ON auth.oauth_authorizations USING btree (expires_at) WHERE (status = 'pending'::auth.oauth_authorization_status);


--
-- Name: oauth_clients_deleted_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at);


--
-- Name: oauth_consents_active_client_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_active_client_idx ON auth.oauth_consents USING btree (client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_active_user_client_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_active_user_client_idx ON auth.oauth_consents USING btree (user_id, client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_user_order_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_user_order_idx ON auth.oauth_consents USING btree (user_id, granted_at DESC);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_oauth_client_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_oauth_client_id_idx ON auth.sessions USING btree (oauth_client_id);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: admin_users_email_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX admin_users_email_unique ON public.admin_users USING btree (email) WHERE (email IS NOT NULL);


--
-- Name: media_assets_asset_key_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX media_assets_asset_key_idx ON public.media_assets USING btree (asset_key);


--
-- Name: media_assets_asset_key_pattern_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX media_assets_asset_key_pattern_idx ON public.media_assets USING btree (asset_key text_pattern_ops);


--
-- Name: media_assets_asset_key_unique_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX media_assets_asset_key_unique_idx ON public.media_assets USING btree (asset_key) WHERE (asset_key IS NOT NULL);


--
-- Name: media_assets_bucket_path_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX media_assets_bucket_path_unique ON public.media_assets USING btree (bucket, path);


--
-- Name: media_assets_public_category_sort_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX media_assets_public_category_sort_idx ON public.media_assets USING btree (public, category, sort, created_at);


--
-- Name: media_assets_session_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX media_assets_session_idx ON public.media_assets USING btree (session_id);


--
-- Name: sessions_deleted_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sessions_deleted_at_idx ON public.sessions USING btree (deleted_at);


--
-- Name: sessions_public_list_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sessions_public_list_idx ON public.sessions USING btree (lesson_status, session_time, created_at) WHERE (deleted_at IS NULL);


--
-- Name: cms_page_content trg_cms_page_content_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_cms_page_content_updated_at BEFORE UPDATE ON public.cms_page_content FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: media_assets trg_media_assets_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_media_assets_updated_at BEFORE UPDATE ON public.media_assets FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_oauth_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_oauth_client_id_fkey FOREIGN KEY (oauth_client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: admin_users admin_users_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: media_assets media_assets_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media_assets
    ADD CONSTRAINT media_assets_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON UPDATE CASCADE;


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: media_assets Allow admin full access on media_assets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow admin full access on media_assets" ON public.media_assets TO authenticated USING (((auth.jwt() ->> 'role'::text) = 'admin'::text));


--
-- Name: media_assets Allow public read on media_assets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read on media_assets" ON public.media_assets FOR SELECT TO authenticated, anon USING (true);


--
-- Name: cms_page_content admin_all_cms_page_content; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY admin_all_cms_page_content ON public.cms_page_content TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: admin_users; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

--
-- Name: cms_page_content; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cms_page_content ENABLE ROW LEVEL SECURITY;

--
-- Name: media_assets; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--

