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
    SET search_path TO 'public'
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
-- Name: admin_list_media_assets(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_list_media_assets() RETURNS SETOF public.media_assets
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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
    SET search_path TO 'public'
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
    SET search_path TO 'public'
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
    SET search_path TO 'public'
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

CREATE FUNCTION public.get_public_media_asset_by_key(p_slot_key text) RETURNS TABLE(slot_key text, sort smallint, id uuid, title text, description text, created_at timestamp with time zone, updated_at timestamp with time zone, public boolean, bucket text, path text, session_id uuid, asset_type public.asset_type, category public.photo_category)
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select
    ms.slot_key,
    ms.sort,
    ma.id,
    ma.title,
    ma.description,
    ma.created_at,
    ma.updated_at,
    ma.public,
    ma.bucket,
    ma.path,
    ma.session_id,
    ma.asset_type,
    ma.category
  from public.media_slots ms
  join public.media_assets ma on ma.id = ms.asset_id
  where ms.slot_key = p_slot_key
    and ma.public = true
  limit 1;
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

CREATE FUNCTION public.get_public_media_assets_by_prefix(p_prefix text) RETURNS TABLE(slot_key text, sort smallint, id uuid, title text, description text, created_at timestamp with time zone, updated_at timestamp with time zone, public boolean, bucket text, path text, session_id uuid, asset_type public.asset_type, category public.photo_category)
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select
    ms.slot_key,
    ms.sort,
    ma.id,
    ma.title,
    ma.description,
    ma.created_at,
    ma.updated_at,
    ma.public,
    ma.bucket,
    ma.path,
    ma.session_id,
    ma.asset_type,
    ma.category
  from public.media_slots ms
  join public.media_assets ma on ma.id = ms.asset_id
  where ms.slot_key like (p_prefix || '%')
    and ma.public = true
  order by ms.sort asc, ms.slot_key asc;
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
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
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
    SET search_path TO 'public'
    AS $$ BEGIN IF p_text IS NULL OR btrim(p_text) = '' THEN RETURN true; END IF; PERFORM p_text::jsonb; RETURN true; EXCEPTION WHEN others THEN RETURN false; END; $$;


--
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
begin
  new.updated_at := now();
  return new;
end;
$$;


--
-- Name: sync_media_assets_from_storage(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.sync_media_assets_from_storage() RETURNS TABLE(inserted integer, updated integer)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'storage'
    AS $_$
declare
  v_inserted int := 0;
  v_updated  int := 0;
begin
  with src as (
    select
      o.bucket_id::text as bucket,
      o.name::text      as path,

      -- filename (last path segment) without extension
      regexp_replace(
        (string_to_array(o.name::text, '/'))[
          array_length(string_to_array(o.name::text, '/'), 1)
        ],
        '\.[^.]+$',
        ''
      ) as title,

      coalesce(b.public, false) as is_public,

      case
        when lower(regexp_replace(o.name::text, '^.*\.', '')) in
          ('jpg','jpeg','png','webp','gif','avif','heic','heif')
          then 'photo'::public.asset_type
        when lower(regexp_replace(o.name::text, '^.*\.', '')) in
          ('mp4','mov','webm','m4v')
          then 'video'::public.asset_type
        else
          'photo'::public.asset_type
      end as asset_type
    from storage.objects o
    join storage.buckets b on b.id = o.bucket_id
    where o.name is not null
      and o.name <> ''
      and right(o.name::text, 1) <> '/'  -- skip folder markers
  ),
  upserted as (
    insert into public.media_assets (
      bucket,
      path,
      title,
      description,
      public,
      asset_type,
      sort,
      category
    )
    select
      s.bucket,
      s.path,
      s.title,
      null::text,
      s.is_public,
      s.asset_type,
      32767::smallint,
      'lessons'::public.photo_category  -- default; change if you want
    from src s
    on conflict (bucket, path) do update
      set
        title      = excluded.title,
        public     = excluded.public,
        asset_type = excluded.asset_type,
        updated_at = now()
    returning (xmax = 0) as was_inserted
  )
  select
    count(*) filter (where was_inserted),
    count(*) filter (where not was_inserted)
  into v_inserted, v_updated
  from upserted;

  return query select v_inserted, v_updated;
end;
$_$;


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
-- Name: media_slots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.media_slots (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    slot_key text NOT NULL,
    asset_id uuid,
    sort smallint DEFAULT 32767 NOT NULL
);


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
00000000-0000-0000-0000-000000000000	6fc0f392-91dd-473f-b1cd-da537047dfdb	{"action":"token_refreshed","actor_id":"d17a1bd1-5f6c-4c80-8813-30d927cb3809","actor_username":"tyler.adean93@yahoo.com","actor_via_sso":false,"log_type":"token"}	2025-12-18 22:37:40.201275+00	
00000000-0000-0000-0000-000000000000	f9bf6f5f-2c5c-40d1-b327-02876d00b6e0	{"action":"token_revoked","actor_id":"d17a1bd1-5f6c-4c80-8813-30d927cb3809","actor_username":"tyler.adean93@yahoo.com","actor_via_sso":false,"log_type":"token"}	2025-12-18 22:37:40.22831+00	
00000000-0000-0000-0000-000000000000	ac95dbc5-ae80-4713-b920-0ccbce3a882d	{"action":"token_refreshed","actor_id":"d17a1bd1-5f6c-4c80-8813-30d927cb3809","actor_username":"tyler.adean93@yahoo.com","actor_via_sso":false,"log_type":"token"}	2025-12-19 00:26:13.330356+00	
00000000-0000-0000-0000-000000000000	251ed620-8272-4a5d-9f21-f325943d43c6	{"action":"token_revoked","actor_id":"d17a1bd1-5f6c-4c80-8813-30d927cb3809","actor_username":"tyler.adean93@yahoo.com","actor_via_sso":false,"log_type":"token"}	2025-12-19 00:26:13.343325+00	
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
00000000-0000-0000-0000-000000000000	13	3iu7pfvcrrgi	d17a1bd1-5f6c-4c80-8813-30d927cb3809	t	2025-12-16 14:13:05.890998+00	2025-12-18 22:37:40.229027+00	\N	1fea6750-eade-4801-9782-1a3b2fa9b65b
00000000-0000-0000-0000-000000000000	14	7v5ztaqphjq7	d17a1bd1-5f6c-4c80-8813-30d927cb3809	t	2025-12-18 22:37:40.251213+00	2025-12-19 00:26:13.344094+00	3iu7pfvcrrgi	1fea6750-eade-4801-9782-1a3b2fa9b65b
00000000-0000-0000-0000-000000000000	15	egfmr73apx7p	d17a1bd1-5f6c-4c80-8813-30d927cb3809	f	2025-12-19 00:26:13.358349+00	2025-12-19 00:26:13.358349+00	7v5ztaqphjq7	1fea6750-eade-4801-9782-1a3b2fa9b65b
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
1fea6750-eade-4801-9782-1a3b2fa9b65b	d17a1bd1-5f6c-4c80-8813-30d927cb3809	2025-12-16 14:13:05.84819+00	2025-12-19 00:26:13.374316+00	\N	aal1	\N	2025-12-19 00:26:13.373118	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	76.106.161.12	\N	\N	\N	\N	\N
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
00000000-0000-0000-0000-000000000000	d17a1bd1-5f6c-4c80-8813-30d927cb3809	authenticated	authenticated	tyler.adean93@yahoo.com	$2a$10$qxKnDUaauQ1saQ0qIoJsfOIwsmlYvizRST2Xj.PRRUsegQ3Tw1vjq	2025-12-16 00:16:17.594882+00	\N		\N		\N			\N	2025-12-16 14:13:05.847469+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2025-12-16 00:16:17.555897+00	2025-12-19 00:26:13.365808+00	\N	\N			\N		0	\N		\N	f	\N	f
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
760fa9d5-316e-48bf-86c5-d38c5180aa95	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	navigation.home	Home	Inicio	Inicio	t	32767	messages
4c333d75-6b6e-4a29-9e85-3a00bda35583	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	navigation.lessons	Lessons	Lecciones	Lecciones	t	32767	messages
38179c07-b6fc-4b2f-936f-c2b16c7abf62	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	navigation.schedule	Book Now	Reservar	Reservar	t	32767	messages
0a919283-e9d4-40f0-b34c-9ba8a34f57b8	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	navigation.gallery	Gallery	Galería	Galería	t	32767	messages
8c901b2c-432b-4bff-b019-10762b0d47c0	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	navigation.about	About	Acerca de	Acerca de	t	32767	messages
11d5eb3b-eda7-4caf-bfa2-f8ca88965a69	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	navigation.faq	FAQ	Preguntas	Preguntas	t	32767	messages
41d9f9cf-409b-4273-a5e4-4ccb560cdbee	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	navigation.contact	Contact	Contacto	Contacto	t	32767	messages
9a7c560a-bac0-4aee-b6b6-9aa64fd04dde	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	home.heroTitle	Learn to Surf at Sunset Surf Academy	Aprende a surfear en Sunset Surf Academy	Aprende a surfear en Sunset Surf Academy	t	32767	messages
7ce559f6-1ac5-4c3a-a7e0-c608235c3199	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	home.heroSubtitle	Professional surf instruction in the beautiful waters of Rincón, Puerto Rico	Instrucción profesional de surf en las hermosas aguas de Rincón, Puerto Rico	Instrucción profesional de surf en las hermosas aguas de Rincón, Puerto Rico	t	32767	messages
2f35fe0e-96be-448c-ab09-a063f4166242	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	home.bookNow	Book Your Lesson	Reserva tu lección	Reserva tu lección	t	32767	messages
27417dd4-90a2-4939-853e-e990b791436d	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	home.learnMore	Learn More	Saber más	Saber más	t	32767	messages
81b98972-8770-413c-af6f-680cf1e6e3c5	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	home.aboutPreview	Learn from some of the best surfers in the world.	Aprende con algunos de los mejores surfistas del mundo.	Aprende con algunos de los mejores surfistas del mundo.	t	32767	messages
00efa412-55e3-4547-bb24-879b03319905	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	home.lessonsTitle	Surf Lessons	Lecciones de surf	Lecciones de surf	t	32767	messages
7de4b4b8-c24f-4f9e-b401-815d8b87b9e4	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	home.lessonsDescription	From beginner-friendly sessions to advanced coaching	Desde sesiones para principiantes hasta coaching avanzado	Desde sesiones para principiantes hasta coaching avanzado	t	32767	messages
46a4be42-c0e6-426b-a28d-8c0ae44f775d	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	home.galleryTitle	Experience the Journey	Vive la experiencia	Vive la experiencia	t	32767	messages
46bd6ebb-213c-4d89-a77d-dd92f7ffdf66	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	home.galleryDescription	Watch videos and see photos from our surf adventures	Mira videos y fotos de nuestras aventuras de surf	Mira videos y fotos de nuestras aventuras de surf	t	32767	messages
30fe8bc6-7e01-4831-818a-ae5841a0e43f	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	home.teamTitle	Meet the Team	Conoce al equipo	Conoce al equipo	t	32767	messages
9c2abbe0-80ea-443e-b6a8-0d8ee4db8a8f	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	home.teamDescription	Get to know the coaches who make Sunset Surf Academy special	Conoce a los entrenadores que hacen especial a Sunset Surf Academy	Conoce a los entrenadores que hacen especial a Sunset Surf Academy	t	32767	messages
46b6614c-e851-4708-9bab-d65996aa9111	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	lessons.title	Surf Lessons	Lecciones de surf	Lecciones de surf	t	32767	messages
a0315bfd-e033-4b03-abd8-246737c1350b	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	lessons.subtitle	Professional instruction tailored to your skill level	Instrucción profesional adaptada a tu nivel	Instrucción profesional adaptada a tu nivel	t	32767	messages
52296c4e-2ccc-4285-bed0-5c4d82e74172	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	lessons.beginner.title	Lessons	Lecciones	Lecciones	t	32767	messages
01593580-2c50-4213-9429-534bc799290b	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	lessons.beginner.price	$100	$100	$100	t	32767	messages
4fc13111-e239-4e20-a234-248e9a8d203b	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	lessons.beginner.duration	2 hours	2 horas	2 horas	t	32767	messages
8ca8d5c2-ab9e-4c00-946f-e2846caa121e	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	lessons.beginner.location	Rincón to Isabela/Jobos	Rincón a Isabela/Jobos	Rincón a Isabela/Jobos	t	32767	messages
ac44fe56-15f6-4e7c-ba3b-b3ac8e1f1c09	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	lessons.beginner.description	The beginner lessons teach the fundamentals of surfing.	Las lecciones para principiantes enseñan los fundamentos del surf.	Las lecciones para principiantes enseñan los fundamentos del surf.	t	32767	messages
e74051b4-0413-48a8-984b-2a2e0117a32e	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	lessons.beginner.includes.0	Surfboard rental	Alquiler de tabla de surf	Alquiler de tabla de surf	t	32767	messages
8177b659-a1a8-4b8b-a962-611be19ae10d	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	lessons.beginner.includes.1	Safety briefing	Briefing de seguridad	Briefing de seguridad	t	32767	messages
aefe7f2a-1a03-4f3e-a8c3-acf2ed546ff5	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	lessons.beginner.includes.2	Personalized beach & water coaching	Coaching personalizado en playa y agua	Coaching personalizado en playa y agua	t	32767	messages
73e77bc3-459f-4887-8618-836931f42d92	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	lessons.beginner.includes.3	Photos of your session	Fotos de tu sesión	Fotos de tu sesión	t	32767	messages
bed7e86a-eaff-4f05-849e-1421d5df7103	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	lessons.intermediate.title	Advanced Coaching	Coaching avanzado	Coaching avanzado	t	32767	messages
f391351b-5f62-4063-a08e-62e225c4f0d0	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	lessons.intermediate.price	$100	$100	$100	t	32767	messages
9cb6e12c-97f6-48d3-a417-e4d7c8e042e7	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	lessons.intermediate.duration	2 hours	2 horas	2 horas	t	32767	messages
6d64d2cc-f5e3-4467-9c77-6219e28d2950	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	lessons.intermediate.location	Rincón to Isabela/Jobos	Rincón a Isabela/Jobos	Rincón a Isabela/Jobos	t	32767	messages
fc3e282d-90de-4a4a-b3d9-da0ee7925067	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	lessons.intermediate.description	Intermediate lessons teach how to read waves, interact in any lineup, and gain practical skills to surf more confidently.	Las lecciones intermedias enseñan a leer las olas, interactuar en cualquier line up y desarrollar habilidades prácticas para surfear con más confianza.	Las lecciones intermedias enseñan a leer las olas, interactuar en cualquier line up y desarrollar habilidades prácticas para surfear con más confianza.	t	32767	messages
d5438f49-13b4-44ed-81a7-bd8951964dd9	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	lessons.intermediate.includes.0	Surfboard rental	Alquiler de tabla de surf	Alquiler de tabla de surf	t	32767	messages
eeb40f15-43c9-4d28-a498-3bd5b43cf42b	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	lessons.intermediate.includes.1	Wave reading & lineup etiquette	Lectura de olas y etiqueta en el line up	Lectura de olas y etiqueta en el line up	t	32767	messages
d90f7470-1c7e-44c8-8b38-7db6a32f82b0	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	lessons.intermediate.includes.2	Skills development	Desarrollo de habilidades	Desarrollo de habilidades	t	32767	messages
89e88ca2-ac4c-47ac-a9ba-83ed7c784231	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	lessons.intermediate.includes.3	Photos and short video clips	Fotos y clips cortos de video	Fotos y clips cortos de video	t	32767	messages
ec891b25-6df4-4941-9b8b-fbb4105b37eb	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	lessons.advanced.title	Surf Guide	Guía de surf	Guía de surf	t	32767	messages
9bc32b42-780b-4512-9fd9-8eaa191ab82c	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	lessons.advanced.price	$100	$100	$100	t	32767	messages
743f1b1c-2130-4b8a-af0c-62dcf9159704	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	lessons.advanced.duration	2 hours	2 horas	2 horas	t	32767	messages
b887f9ae-ea46-4e64-a4b1-6d03039d85de	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	lessons.advanced.location	Various locations	Varias ubicaciones	Varias ubicaciones	t	32767	messages
52903d25-e381-45aa-a46a-e8e75f8f0923	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	faq.questions.6.question	What's your refund policy?	¿Cuál es su política de reembolso?	¿Cuál es su política de reembolso?	t	32767	messages
159fa519-b513-41eb-91f5-5577907a4762	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	lessons.advanced.description	Advanced lessons cover advanced skills, video analysis, competition preparation, and custom programs.	Las lecciones avanzadas cubren habilidades avanzadas, análisis de video, preparación para competencias y programas personalizados.	Las lecciones avanzadas cubren habilidades avanzadas, análisis de video, preparación para competencias y programas personalizados.	t	32767	messages
01aba9c5-47bc-42b1-8561-e467de29480f	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	lessons.advanced.includes.0	Video review	Revisión de video	Revisión de video	t	32767	messages
11226537-9602-4098-a87e-5c996ba5fcab	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	lessons.advanced.includes.1	Technique analysis	Análisis de técnica	Análisis de técnica	t	32767	messages
71ef26ea-40ca-44c6-9c3f-7ab2961bea4d	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	lessons.advanced.includes.2	Competition prep	Preparación para competencias	Preparación para competencias	t	32767	messages
6f2828d4-b638-4a09-85d9-459ae49c932c	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	lessons.advanced.includes.3	Custom programs	Programas personalizados	Programas personalizados	t	32767	messages
4a2f2061-6d3a-4c7a-910c-a5fe8536c61c	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	booking.title	Book Your Lesson	Reserva tu lección	Reserva tu lección	t	32767	messages
ba5ee7f5-38f2-47d6-af92-7d483697bc5e	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	booking.selectDate	Select Date	Selecciona una fecha	Selecciona una fecha	t	32767	messages
2bb75792-21e5-463f-b5b3-5d4c349cb531	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	booking.selectTime	Select Time	Selecciona una hora	Selecciona una hora	t	32767	messages
c373ef25-b9e3-45f0-89ee-0c2a8b6b0a5a	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	booking.partySize	Party Size	Tamaño del grupo	Tamaño del grupo	t	32767	messages
b2bf256d-5457-4fb4-b040-f2e1b47f8cc2	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	booking.lessonType	Lesson Type	Tipo de lección	Tipo de lección	t	32767	messages
73dd1e24-9f75-4ed7-b0db-b8352f53be82	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	booking.totalPrice	Total Price	Precio total	Precio total	t	32767	messages
a4c0cdc8-ecf2-454a-98a7-8e442518a7e5	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	booking.customerInfo	Customer Information	Información del cliente	Información del cliente	t	32767	messages
9c07821f-c9fa-48a0-ad94-d9b2d988bf8d	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	booking.name	Full Name	Nombre completo	Nombre completo	t	32767	messages
eee444fb-0274-4ddf-800f-8471f74bb4e9	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	booking.email	Email Address	Correo electrónico	Correo electrónico	t	32767	messages
420cfdaa-0cad-490c-a992-077b2c4780c9	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	booking.phone	Phone Number	Número de teléfono	Número de teléfono	t	32767	messages
834b5d67-13ec-4827-93a7-90e301ec6b77	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	booking.proceedToPayment	Proceed to Payment	Continuar al pago	Continuar al pago	t	32767	messages
da6d9f6f-0a44-4a89-b71e-8d7173f7d1eb	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	about.title	About Jazmine Dean Perez	Sobre Jazmine Dean Perez	Sobre Jazmine Dean Perez	t	32767	messages
57ca93f9-81b1-4003-b0f3-a7bfcedfaf8c	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	about.subtitle	Professional Surfer & Instructor	Surfista profesional e instructora	Surfista profesional e instructora	t	32767	messages
84eef7bb-6a3d-4b4e-bdf7-49067f09f07a	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	about.bio	Jazmine Dean is a professional surfer representing Team Puerto Rico with an impressive competitive record. Based in the world-renowned surf town of Rincón, she brings years of experience and passion to every lesson.	Jazmine Dean es una surfista profesional que representa al Equipo Puerto Rico con un impresionante historial competitivo. Basada en el mundialmente reconocido pueblo de surf de Rincón, aporta años de experiencia y pasión a cada lección.	Jazmine Dean es una surfista profesional que representa al Equipo Puerto Rico con un impresionante historial competitivo. Basada en el mundialmente reconocido pueblo de surf de Rincón, aporta años de experiencia y pasión a cada lección.	t	32767	messages
90b4cfeb-cf3e-4d85-8f2c-90e74d324959	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	about.achievements	Achievements	Logros	Logros	t	32767	messages
f9533725-bf69-432c-947e-099891972eee	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	about.accolades.0	4x East Coast Champion	4x campeona de la Costa Este	4x campeona de la Costa Este	t	32767	messages
669d2655-effa-4c73-ac32-acd6e0f3ee3f	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	about.accolades.1	Pan-American Games 2nd Place	2.º lugar en los Juegos Panamericanos	2.º lugar en los Juegos Panamericanos	t	32767	messages
2a67ee68-e58d-437a-976c-450b92df767e	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	about.accolades.2	ISA World Surfing Games Competitor	Competidora en los Juegos Mundiales de Surf ISA	Competidora en los Juegos Mundiales de Surf ISA	t	32767	messages
b5bb3436-ba8a-48f6-8af6-05230a542da3	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	about.accolades.3	Team Puerto Rico Member	Miembro del Equipo Puerto Rico	Miembro del Equipo Puerto Rico	t	32767	messages
d233132d-85b0-49db-aee8-ab2e601d6f9b	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	about.accolades.4	Professional Surf Instructor	Instructora profesional de surf	Instructora profesional de surf	t	32767	messages
2bee4830-834a-4c13-8990-e7fd166782a5	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	mission.title	Our Mission	Nuestra misión	Nuestra misión	t	32767	messages
a6965150-c71e-4a44-bec7-387a5094f1e7	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	mission.subtitle	Take Every Surfer To The Next Level	Llevar a cada surfista al siguiente nivel	Llevar a cada surfista al siguiente nivel	t	32767	messages
fc420830-e002-46bf-8603-5525ee6e1969	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	mission.lead	At Sunset Surf Academy our mission is simple: to help every surfer — from complete beginners to seasoned competitors — progress, have more fun, and get better results in the water.	En Sunset Surf Academy nuestra misión es simple: ayudar a cada surfista — desde principiantes completos hasta competidores experimentados — a progresar, divertirse más y obtener mejores resultados en el agua.	En Sunset Surf Academy nuestra misión es simple: ayudar a cada surfista — desde principiantes completos hasta competidores experimentados — a progresar, divertirse más y obtener mejores resultados en el agua.	t	32767	messages
bff309aa-5983-4d89-be70-dcd5d4dcfa87	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	mission.body1	We believe surfing is for everyone. For first-timers we focus on water safety, confidence-building and the fundamentals so your first waves are empowering and memorable. For intermediate and advanced surfers we offer technique work, video analysis and competition preparation that targets measurable improvement.	Creemos que el surf es para todos. Para quienes lo prueban por primera vez, nos enfocamos en la seguridad en el agua, construir confianza y los fundamentos para que tus primeras olas sean empoderadoras y memorables. Para surfistas intermedios y avanzados, ofrecemos técnica, análisis de video y preparación para competencias con mejoras medibles.	Creemos que el surf es para todos. Para quienes lo prueban por primera vez, nos enfocamos en la seguridad en el agua, construir confianza y los fundamentos para que tus primeras olas sean empoderadoras y memorables. Para surfistas intermedios y avanzados, ofrecemos técnica, análisis de video y preparación para competencias con mejoras medibles.	t	32767	messages
7792a7c8-7498-4353-bbed-c990dd4d02c8	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	faq.questions.6.answer	We offer full refunds for cancellations due to unsafe weather conditions. Other cancellations require 24-hour notice.	Ofrecemos reembolsos completos por cancelaciones debido a condiciones climáticas inseguras. Otras cancelaciones requieren aviso con 24 horas de anticipación.	Ofrecemos reembolsos completos por cancelaciones debido a condiciones climáticas inseguras. Otras cancelaciones requieren aviso con 24 horas de anticipación.	t	32767	messages
9d59ee0a-edc1-4dc3-aa55-e524fa6fa399	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	contact.title	Contact Jazmine	Contacta a Jazmine	Contacta a Jazmine	t	32767	messages
502905b4-183e-4d56-9ac6-daec8ebef242	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	mission.body2	Our coaches design lessons around your goals — whether that’s catching your first wave, improving your bottom turns, boosting aerials, or nailing contest-worthy maneuvers. We emphasize clear coaching, practical drills, and a supportive environment that accelerates learning while keeping the stoke alive.	Nuestros entrenadores diseñan lecciones según tus objetivos — ya sea atrapar tu primera ola, mejorar tus bottom turns, perfeccionar aéreos o dominar maniobras dignas de competencia. Enfatizamos coaching claro, ejercicios prácticos y un ambiente de apoyo que acelera el aprendizaje manteniendo la emoción viva.	Nuestros entrenadores diseñan lecciones según tus objetivos — ya sea atrapar tu primera ola, mejorar tus bottom turns, perfeccionar aéreos o dominar maniobras dignas de competencia. Enfatizamos coaching claro, ejercicios prácticos y un ambiente de apoyo que acelera el aprendizaje manteniendo la emoción viva.	t	32767	messages
6593ceb7-9d73-4630-8c0b-6c5994dfa6ba	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	mission.conclusion	Ultimately, success at Sunset Surf Academy isn’t just measured in scores; it’s measured in smiles, confidence and the endless pursuit of better surfing. Come surf with us and let’s take your surfing to the next level.	En última instancia, el éxito en Sunset Surf Academy no se mide solo en puntuaciones; se mide en sonrisas, confianza y la búsqueda interminable de un mejor surf. Ven a surfear con nosotros y llevemos tu surf al siguiente nivel.	En última instancia, el éxito en Sunset Surf Academy no se mide solo en puntuaciones; se mide en sonrisas, confianza y la búsqueda interminable de un mejor surf. Ven a surfear con nosotros y llevemos tu surf al siguiente nivel.	t	32767	messages
bc9ece66-a6b1-4723-99df-bbc2ba2e36f4	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	faq.title	Frequently Asked Questions	Preguntas frecuentes	Preguntas frecuentes	t	32767	messages
92cf0a54-0a85-49f6-8524-6fa20caa83be	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	faq.questions.0.question	Where do we meet for lessons?	¿Dónde nos encontramos para las lecciones?	¿Dónde nos encontramos para las lecciones?	t	32767	messages
00111e42-0f29-4c3c-ba40-e7493dcaf00b	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	faq.questions.0.answer	We are based out of Rincón, Puerto Rico, and primarily conduct lessons at our local beach breaks. However, when conditions are favorable and upon request, we're happy to travel anywhere along the coast from Rincón up to Jobos and all the spots in between to find the perfect waves for your lesson.	Estamos ubicados en Rincón, Puerto Rico, y principalmente realizamos lecciones en nuestras playas locales. Sin embargo, cuando las condiciones son favorables y bajo pedido, podemos viajar a cualquier lugar a lo largo de la costa desde Rincón hasta Jobos y todos los lugares intermedios para encontrar las olas perfectas para tu lección.	Estamos ubicados en Rincón, Puerto Rico, y principalmente realizamos lecciones en nuestras playas locales. Sin embargo, cuando las condiciones son favorables y bajo pedido, podemos viajar a cualquier lugar a lo largo de la costa desde Rincón hasta Jobos y todos los lugares intermedios para encontrar las olas perfectas para tu lección.	t	32767	messages
7e95692c-b5e9-49c6-b517-1be6da4d538d	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	faq.questions.1.question	What's included in beginner lessons?	¿Qué incluyen las lecciones para principiantes?	¿Qué incluyen las lecciones para principiantes?	t	32767	messages
60212e37-2334-4dec-ba36-29fac278f054	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	faq.questions.1.answer	Beginner lessons include surfboard rental, comprehensive safety briefing, personalized coaching both on the beach and in the water, and photos of your surf session to capture your progress and memorable moments.	Las lecciones para principiantes incluyen alquiler de tabla de surf, un briefing de seguridad completo, coaching personalizado en la playa y en el agua, y fotos de tu sesión para capturar tu progreso y momentos memorables.	Las lecciones para principiantes incluyen alquiler de tabla de surf, un briefing de seguridad completo, coaching personalizado en la playa y en el agua, y fotos de tu sesión para capturar tu progreso y momentos memorables.	t	32767	messages
9ccd3140-e00a-4e7b-b749-9e81fd1b69f6	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	faq.questions.2.question	What's included in advanced coaching?	¿Qué incluye el coaching avanzado?	¿Qué incluye el coaching avanzado?	t	32767	messages
8ad9e73e-8b72-4dcd-b959-ed9d852805ce	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	faq.questions.2.answer	Advanced coaching is a comprehensive multi-session program that includes video analysis of your surfing. We start with a baseline session where we film your surfing, then review the footage together to identify areas for improvement. This is followed by a theory-to-practice session where you apply the techniques we've discussed, creating a complete learning cycle for advanced skill development.	El coaching avanzado es un programa completo de varias sesiones que incluye análisis de video de tu surf. Comenzamos con una sesión base donde filmamos tu surf, luego revisamos el material juntos para identificar áreas de mejora. Después, realizamos una sesión de teoría a práctica donde aplicas las técnicas discutidas, creando un ciclo completo de aprendizaje para el desarrollo de habilidades avanzadas.	El coaching avanzado es un programa completo de varias sesiones que incluye análisis de video de tu surf. Comenzamos con una sesión base donde filmamos tu surf, luego revisamos el material juntos para identificar áreas de mejora. Después, realizamos una sesión de teoría a práctica donde aplicas las técnicas discutidas, creando un ciclo completo de aprendizaje para el desarrollo de habilidades avanzadas.	t	32767	messages
d1792923-0c5c-40ea-824a-444ec6f52455	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	faq.questions.3.question	Can I reschedule my lesson?	¿Puedo reprogramar mi lección?	¿Puedo reprogramar mi lección?	t	32767	messages
5c39c886-3c91-4db3-a00c-942a38e5e409	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	faq.questions.3.answer	Yes, we offer flexible rescheduling options based on weather conditions and your availability.	Sí, ofrecemos opciones flexibles de reprogramación según las condiciones del clima y tu disponibilidad.	Sí, ofrecemos opciones flexibles de reprogramación según las condiciones del clima y tu disponibilidad.	t	32767	messages
bb3239ea-9972-4175-a1bc-8dac73e2414d	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	faq.questions.4.question	Are lessons suitable for complete beginners?	¿Las lecciones son adecuadas para principiantes completos?	¿Las lecciones son adecuadas para principiantes completos?	t	32767	messages
0d1ab06d-5c42-4d13-a1a5-7c0562aaf026	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	faq.questions.4.answer	Absolutely! Our beginner lessons are specifically designed for first-time surfers of all ages.	¡Absolutamente! Nuestras lecciones para principiantes están diseñadas específicamente para surfistas primerizos de todas las edades.	¡Absolutamente! Nuestras lecciones para principiantes están diseñadas específicamente para surfistas primerizos de todas las edades.	t	32767	messages
ffe9ab1f-a3fa-498e-a770-6fabf968b818	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	faq.questions.5.question	Do you offer group and family lessons?	¿Ofrecen lecciones grupales y familiares?	¿Ofrecen lecciones grupales y familiares?	t	32767	messages
8fd9e901-ae02-436e-8d53-936f8aa8a728	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	faq.questions.5.answer	Yes, we welcome groups and families. Contact us for special group rates and custom arrangements.	Sí, damos la bienvenida a grupos y familias. Contáctanos para tarifas especiales para grupos y arreglos personalizados.	Sí, damos la bienvenida a grupos y familias. Contáctanos para tarifas especiales para grupos y arreglos personalizados.	t	32767	messages
bb6580bd-581a-4b26-86e0-5196dfa9f628	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	contact.subtitle	Ready to book or have questions? Get in touch!	¿Listo para reservar o tienes preguntas? ¡Ponte en contacto!	¿Listo para reservar o tienes preguntas? ¡Ponte en contacto!	t	32767	messages
df35c836-1890-42b3-b454-af78f9e21624	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	contact.location	Rincón, Puerto Rico	Rincón, Puerto Rico	Rincón, Puerto Rico	t	32767	messages
0f4296ab-5a49-46fa-ab0e-61a7da3f9473	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	contact.followUs	Follow Us	Síguenos	Síguenos	t	32767	messages
700a8b44-5331-4307-8e23-3a86abfd9c9d	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	team.title	Meet the Team	Conoce al equipo	Conoce al equipo	t	32767	messages
959278c4-67f3-458a-a87e-339ba2167d62	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	team.subtitle	Learn from some of the best surfers in the world.	Aprende con algunos de los mejores surfistas del mundo.	Aprende con algunos de los mejores surfistas del mundo.	t	32767	messages
0556376d-d41a-4b63-a15d-16c1d496e69a	2025-12-21 12:59:48.629543+00	2025-12-21 12:59:48.629543+00	\N	\N	team.intro	These are our top coaches who will take you to the next level in your surfing. Click on their profiles to learn a little about them!	Estos son nuestros mejores entrenadores que te llevarán al siguiente nivel en tu surf. Haz clic en sus perfiles para conocer un poco más sobre ellos.	Estos son nuestros mejores entrenadores que te llevarán al siguiente nivel en tu surf. Haz clic en sus perfiles para conocer un poco más sobre ellos.	t	32767	messages
\.


--
-- Data for Name: media_assets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.media_assets (id, title, description, created_at, updated_at, public, bucket, path, session_id, asset_type, sort, category) FROM stdin;
49000f45-9f99-444a-8257-ba9f1c7d5bb1	IMG_3859	synced from storage	2025-12-22 21:19:52.02167+00	2025-12-22 21:19:52.02167+00	t	Lesson_Photos	IMG_3859.JPG	\N	photo	32767	lessons
36cb9cd0-7609-4602-ae76-6ac39ef2dcab	palmTree	synced from storage	2025-12-22 21:19:52.02167+00	2025-12-22 21:19:52.02167+00	t	Lesson_Photos	palmTree.png	\N	photo	32767	lessons
896760f0-a364-4f17-b1aa-a0ca80085115	MVI_3628	synced from storage	2025-12-22 21:19:52.02167+00	2025-12-22 21:19:52.02167+00	t	Lesson_Photos	MVI_3628.MP4	\N	video	32767	lessons
87094a4d-b038-4c75-8e96-fc0a6332974d	SSA_gentle waves	synced from storage	2025-12-22 21:19:52.02167+00	2025-12-22 21:19:52.02167+00	t	Lesson_Photos	SSA_gentle waves.mp4	\N	video	32767	lessons
3fe3618b-73da-4127-b3ae-1565e2fa9784	SSA_Orange_Logo	synced from storage	2025-12-22 21:19:52.02167+00	2025-12-22 21:19:52.02167+00	t	Lesson_Photos	SSA_Orange_Logo.png	\N	photo	32767	lessons
c4b18176-3271-435f-9398-4b081923df89	isasilver	synced from storage	2025-12-22 21:19:52.02167+00	2025-12-22 21:19:52.02167+00	t	Lesson_Photos	isasilver.png	\N	photo	32767	lessons
f0314672-4e7e-413d-bc67-f6c1cac0da71	isa	synced from storage	2025-12-22 21:19:52.02167+00	2025-12-22 21:19:52.02167+00	t	Lesson_Photos	isa.png	\N	photo	32767	lessons
e3c9dfab-9c02-4a36-89de-d0d7d4f3f69d	sbsnap	synced from storage	2025-12-22 21:19:52.02167+00	2025-12-22 21:19:52.02167+00	t	Lesson_Photos	sbsnap.png	\N	photo	32767	lessons
178a898f-a085-4363-8eb9-06a344c5586f	Want to learn cross stepping 2	synced from storage	2025-12-22 21:19:52.02167+00	2025-12-22 21:19:52.02167+00	t	Lesson_Photos	Want to learn cross stepping 2.mp4	\N	video	32767	lessons
9a841c26-b762-45eb-8bbd-94eda57a94ac	prices	synced from storage	2025-12-22 21:19:52.02167+00	2025-12-22 21:19:52.02167+00	t	Lesson_Photos	prices.png	\N	photo	32767	lessons
5ba1e743-3d5e-48a5-b3e6-d7fb611dca49	image_6483441 (1)	synced from storage	2025-12-22 19:48:26.642098+00	2025-12-22 19:48:26.642098+00	t	Lesson_Photos	image_6483441 (1).JPG	\N	photo	32767	lessons
5342e269-d6db-4d31-abab-d736cb021066	image_6483441 (5)	synced from storage	2025-12-22 19:48:26.642098+00	2025-12-22 19:48:26.642098+00	t	Lesson_Photos	image_6483441 (5).JPG	\N	photo	32767	lessons
47895a11-af43-4cc6-999c-26ecf72351df	surfSchoolShot	synced from storage	2025-12-22 19:48:26.642098+00	2025-12-22 19:48:26.642098+00	t	Lesson_Photos	surfSchoolShot.png	\N	photo	32767	lessons
7ac0a6a4-b505-4229-9a18-2580b34c5a9e	IMG_3855	synced from storage	2025-12-22 19:48:26.642098+00	2025-12-22 19:48:26.642098+00	t	Lesson_Photos	IMG_3855.JPG	\N	photo	32767	lessons
0d680a3d-60ab-4e46-9007-5a2a5f5f772b	IMG_3856	synced from storage	2025-12-22 19:48:26.642098+00	2025-12-22 19:48:26.642098+00	t	Lesson_Photos	IMG_3856.JPG	\N	photo	32767	lessons
6b9275d1-6e88-4e78-8fe1-ef1b042ee441	IMG_2505 2	synced from storage	2025-12-22 19:48:26.642098+00	2025-12-22 19:48:26.642098+00	t	Lesson_Photos	IMG_2505 2.JPG	\N	photo	32767	lessons
ec79eb3f-a158-43be-ab1e-56a79474e75f	IMG_2505	synced from storage	2025-12-22 19:48:26.642098+00	2025-12-22 19:48:26.642098+00	t	Lesson_Photos	IMG_2505.JPG	\N	photo	32767	lessons
c6460107-d0de-4748-94e6-3a261efccbb0	IMG_3633	synced from storage	2025-12-22 19:48:26.642098+00	2025-12-22 19:48:26.642098+00	t	Lesson_Photos	IMG_3633.JPG	\N	photo	32767	lessons
01593177-0e92-41fe-94b4-20fb108027ba	IMG_3629	synced from storage	2025-12-22 19:48:26.642098+00	2025-12-22 19:48:26.642098+00	t	Lesson_Photos	IMG_3629.JPG	\N	photo	32767	lessons
305ffcac-91cf-4670-81ac-e8aa2e4705f5	IMG_3627	synced from storage	2025-12-22 19:48:26.642098+00	2025-12-22 19:48:26.642098+00	t	Lesson_Photos	IMG_3627.JPG	\N	photo	32767	lessons
67b9bc0b-65ae-4a74-873b-36463fcb4522	contact_card	synced from storage	2025-12-22 21:19:52.02167+00	2025-12-22 21:19:52.02167+00	t	Lesson_Photos	contact_card.png	\N	photo	32767	lessons
7693ee08-1215-4561-92ae-7f91eb11e7ee	2	synced from storage	2025-12-22 21:19:52.02167+00	2025-12-22 21:19:52.02167+00	t	Lesson_Photos	2.png	\N	photo	32767	lessons
719d5909-b4d7-42c4-875c-4ca5563160b1	4	synced from storage	2025-12-22 21:19:52.02167+00	2025-12-22 21:19:52.02167+00	t	Lesson_Photos	4.png	\N	photo	32767	lessons
95851b90-3a70-4d6f-8a61-7316c0fd5985	3	synced from storage	2025-12-22 21:19:52.02167+00	2025-12-22 21:19:52.02167+00	t	Lesson_Photos	3.png	\N	photo	32767	lessons
bca089ce-4bd6-4c5a-9e32-51dfb9f8c768	Dress	synced from storage	2025-12-22 21:19:52.02167+00	2025-12-22 21:19:52.02167+00	t	Lesson_Photos	Dress.png	\N	photo	32767	lessons
2db64cd2-d0e6-4dfc-a308-f20733a7c9fc	dress2	synced from storage	2025-12-22 21:19:52.02167+00	2025-12-22 21:19:52.02167+00	t	Lesson_Photos	dress2.png	\N	photo	32767	lessons
23c089ca-3815-4873-b932-cffad1859bf7	5	synced from storage	2025-12-22 21:19:52.02167+00	2025-12-22 21:19:52.02167+00	t	Lesson_Photos	5.png	\N	photo	32767	lessons
55402377-6aed-4953-be21-4aea15c56fc2	1	synced from storage	2025-12-22 21:19:52.02167+00	2025-12-22 21:19:52.02167+00	t	Lesson_Photos	1.png	\N	photo	32767	lessons
da79e1c8-8676-4b8f-b863-bc31211a0322	hero_shot	synced from storage	2025-12-22 21:19:52.02167+00	2025-12-22 21:19:52.02167+00	t	Lesson_Photos	hero_shot.png	\N	photo	32767	lessons
85e71f86-4c80-4a27-aa49-f29be5f701cb	hang10	synced from storage	2025-12-22 21:19:52.02167+00	2025-12-22 21:19:52.02167+00	t	Lesson_Photos	hang10.png	\N	photo	32767	lessons
88a40d13-203f-496d-b76c-6007c2f53b61	SSA_BW_Logo	synced from storage	2025-12-22 21:19:52.02167+00	2025-12-22 21:19:52.02167+00	t	Lesson_Photos	SSA_BW_Logo.png	\N	photo	32767	lessons
43f332cb-4f08-452b-8281-9108e53d1870	lbturn	synced from storage	2025-12-22 21:19:52.02167+00	2025-12-22 21:19:52.02167+00	t	Lesson_Photos	lbturn.png	\N	photo	32767	lessons
ea54ad52-932a-4d3f-b657-00a1f32a6961	SSA_ Enter and exit	synced from storage	2025-12-22 21:19:52.02167+00	2025-12-22 21:19:52.02167+00	t	Lesson_Photos	SSA_ Enter and exit.mp4	\N	video	32767	lessons
\.


--
-- Data for Name: media_slots; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.media_slots (id, created_at, updated_at, slot_key, asset_id, sort) FROM stdin;
2b75297a-e03b-400a-9d06-0a96eae5c538	2025-12-24 03:39:44.611036+00	2025-12-24 03:39:44.611036+00	nav.logo	3fe3618b-73da-4127-b3ae-1565e2fa9784	0
fcfb1e69-754c-4e97-ae0d-b5546f34a91b	2025-12-24 03:39:44.611036+00	2025-12-24 03:39:44.611036+00	contact.logo	3fe3618b-73da-4127-b3ae-1565e2fa9784	0
fd095d85-307b-4c5d-9083-33b4a1f8ae4c	2025-12-24 03:39:44.611036+00	2025-12-24 03:39:44.611036+00	mission.logo	3fe3618b-73da-4127-b3ae-1565e2fa9784	0
fbbf35c8-2fbf-44d8-9f0f-feb529388891	2025-12-24 03:39:44.611036+00	2025-12-24 03:39:44.611036+00	team.logo	88a40d13-203f-496d-b76c-6007c2f53b61	0
f6215b15-0026-40c1-bb13-30cf8000b0ab	2025-12-24 03:39:44.611036+00	2025-12-24 03:39:44.611036+00	home.hero	da79e1c8-8676-4b8f-b863-bc31211a0322	0
60010e47-ac57-4cc6-98bf-7360d1362347	2025-12-24 03:39:44.611036+00	2025-12-24 03:39:44.611036+00	home.cards.team.image	c4b18176-3271-435f-9398-4b081923df89	0
321cea48-46c5-4cd3-b522-0e29d2489ef6	2025-12-24 03:39:44.611036+00	2025-12-24 03:39:44.611036+00	lessons.prices	9a841c26-b762-45eb-8bbd-94eda57a94ac	0
16b5a0d4-bcea-443d-9f7f-2114dbd0b78e	2025-12-24 03:39:44.611036+00	2025-12-24 03:39:44.611036+00	team.jaz.photos.001	c4b18176-3271-435f-9398-4b081923df89	1
5d643798-472e-43ee-aa5b-175965d4e6af	2025-12-24 03:39:44.611036+00	2025-12-24 03:39:44.611036+00	team.jaz.photos.002	f0314672-4e7e-413d-bc67-f6c1cac0da71	2
945ce536-b891-42d9-a4cb-f2a4fa8a6a99	2025-12-24 03:39:44.611036+00	2025-12-24 03:39:44.611036+00	team.jaz.photos.003	e3c9dfab-9c02-4a36-89de-d0d7d4f3f69d	3
20a0a3f1-ff6b-48a3-88bd-1a66e9524857	2025-12-24 03:39:44.611036+00	2025-12-24 03:39:44.611036+00	home.target_audience.001	55402377-6aed-4953-be21-4aea15c56fc2	1
a2160b39-a36b-45e5-8c74-6966ceacfbec	2025-12-24 03:39:44.611036+00	2025-12-24 03:39:44.611036+00	home.target_audience.002	7693ee08-1215-4561-92ae-7f91eb11e7ee	2
df415d65-8c74-4be8-917e-90f035f86179	2025-12-24 03:39:44.611036+00	2025-12-24 03:39:44.611036+00	home.target_audience.003	95851b90-3a70-4d6f-8a61-7316c0fd5985	3
b7e403fe-990d-4baf-8b36-ed3b550af9cf	2025-12-24 03:39:44.611036+00	2025-12-24 03:39:44.611036+00	home.target_audience.004	719d5909-b4d7-42c4-875c-4ca5563160b1	4
ad6d7e22-411d-4352-a089-afc39ec66b61	2025-12-24 03:39:44.611036+00	2025-12-24 03:39:44.611036+00	home.target_audience.005	23c089ca-3815-4873-b932-cffad1859bf7	5
54e7bf14-8bda-4e8d-9657-3fca57f4e0b9	2025-12-24 03:39:44.611036+00	2025-12-24 03:39:44.611036+00	home.target_audience.006	bca089ce-4bd6-4c5a-9e32-51dfb9f8c768	6
27d4205a-1831-46d6-911f-8064c625be25	2025-12-24 03:39:44.611036+00	2025-12-24 03:39:44.611036+00	home.target_audience.007	2db64cd2-d0e6-4dfc-a308-f20733a7c9fc	7
4a7b4894-ad8c-441a-bcf4-e2586e06bd6c	2025-12-24 03:39:44.611036+00	2025-12-24 03:39:44.611036+00	home.target_audience.008	85e71f86-4c80-4a27-aa49-f29be5f701cb	8
c3750f8a-8733-46f2-a69c-8f4bfc5db146	2025-12-24 03:39:44.611036+00	2025-12-24 03:39:44.611036+00	home.target_audience.009	43f332cb-4f08-452b-8281-9108e53d1870	9
30aee2f1-cc3d-4334-8f15-407aad6f95c7	2025-12-24 03:39:44.611036+00	2025-12-24 03:39:44.611036+00	home.cards.gallery.images.001	7ac0a6a4-b505-4229-9a18-2580b34c5a9e	1
2b29b9d8-083b-422e-96b8-4f929dd1e2a4	2025-12-24 03:39:44.611036+00	2025-12-24 03:39:44.611036+00	home.cards.gallery.images.002	0d680a3d-60ab-4e46-9007-5a2a5f5f772b	2
9fcef6a1-71de-46b1-89d5-edf7e43af73b	2025-12-24 03:39:44.611036+00	2025-12-24 03:39:44.611036+00	home.cards.gallery.images.003	ec79eb3f-a158-43be-ab1e-56a79474e75f	3
561367bc-7247-41d1-9a71-c2369ac273fe	2025-12-24 03:39:44.611036+00	2025-12-24 03:39:44.611036+00	home.cards.gallery.images.004	6b9275d1-6e88-4e78-8fe1-ef1b042ee441	4
d74c9b84-d86f-452c-a690-e67d8900acf7	2025-12-24 03:39:44.611036+00	2025-12-24 03:39:44.611036+00	home.cards.gallery.images.005	305ffcac-91cf-4670-81ac-e8aa2e4705f5	5
7a7e0608-b553-4bef-a743-8806a92c51ff	2025-12-24 03:39:44.611036+00	2025-12-24 03:39:44.611036+00	home.cards.gallery.images.006	01593177-0e92-41fe-94b4-20fb108027ba	6
dbb22ed8-50a7-4c57-809d-ed5ad79df60f	2025-12-24 03:39:44.611036+00	2025-12-24 03:39:44.611036+00	home.cards.gallery.images.007	c6460107-d0de-4748-94e6-3a261efccbb0	7
44c31824-960a-4bac-b4a7-30495441ae43	2025-12-24 03:39:44.611036+00	2025-12-24 03:39:44.611036+00	home.cards.gallery.images.008	47895a11-af43-4cc6-999c-26ecf72351df	8
89762bbc-6ca1-41e4-9c39-e1953ed0627d	2025-12-24 03:45:23.392821+00	2025-12-24 03:45:23.392821+00	site.favicon	3fe3618b-73da-4127-b3ae-1565e2fa9784	0
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sessions (id, created_at, session_time, group_size, client_names, lesson_status, paid, tip, deleted_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: -
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 15, true);


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
-- Name: media_slots media_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media_slots
    ADD CONSTRAINT media_slots_pkey PRIMARY KEY (id);


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
-- Name: media_slots_asset_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX media_slots_asset_id_idx ON public.media_slots USING btree (asset_id);


--
-- Name: media_slots_slot_key_pattern_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX media_slots_slot_key_pattern_idx ON public.media_slots USING btree (slot_key text_pattern_ops);


--
-- Name: media_slots_slot_key_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX media_slots_slot_key_unique ON public.media_slots USING btree (slot_key);


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
-- Name: media_slots media_slots_asset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media_slots
    ADD CONSTRAINT media_slots_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.media_assets(id) ON DELETE SET NULL;


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
-- Name: media_slots Public can read slots for public assets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can read slots for public assets" ON public.media_slots FOR SELECT TO authenticated, anon USING (((asset_id IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM public.media_assets ma
  WHERE ((ma.id = media_slots.asset_id) AND (ma.public = true))))));


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
-- Name: media_slots; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.media_slots ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--



-- ------------------------------------------------------------
-- DATA: public.media_assets + public.cms_page_content
-- ------------------------------------------------------------

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
-- Data for Name: cms_page_content; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('760fa9d5-316e-48bf-86c5-d38c5180aa95', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'navigation.home', 'Home', 'Inicio', 'Inicio', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('4c333d75-6b6e-4a29-9e85-3a00bda35583', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'navigation.lessons', 'Lessons', 'Lecciones', 'Lecciones', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('38179c07-b6fc-4b2f-936f-c2b16c7abf62', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'navigation.schedule', 'Book Now', 'Reservar', 'Reservar', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('0a919283-e9d4-40f0-b34c-9ba8a34f57b8', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'navigation.gallery', 'Gallery', 'Galería', 'Galería', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('8c901b2c-432b-4bff-b019-10762b0d47c0', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'navigation.about', 'About', 'Acerca de', 'Acerca de', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('11d5eb3b-eda7-4caf-bfa2-f8ca88965a69', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'navigation.faq', 'FAQ', 'Preguntas', 'Preguntas', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('41d9f9cf-409b-4273-a5e4-4ccb560cdbee', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'navigation.contact', 'Contact', 'Contacto', 'Contacto', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('9a7c560a-bac0-4aee-b6b6-9aa64fd04dde', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'home.heroTitle', 'Learn to Surf at Sunset Surf Academy', 'Aprende a surfear en Sunset Surf Academy', 'Aprende a surfear en Sunset Surf Academy', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('7ce559f6-1ac5-4c3a-a7e0-c608235c3199', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'home.heroSubtitle', 'Professional surf instruction in the beautiful waters of Rincón, Puerto Rico', 'Instrucción profesional de surf en las hermosas aguas de Rincón, Puerto Rico', 'Instrucción profesional de surf en las hermosas aguas de Rincón, Puerto Rico', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('2f35fe0e-96be-448c-ab09-a063f4166242', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'home.bookNow', 'Book Your Lesson', 'Reserva tu lección', 'Reserva tu lección', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('27417dd4-90a2-4939-853e-e990b791436d', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'home.learnMore', 'Learn More', 'Saber más', 'Saber más', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('81b98972-8770-413c-af6f-680cf1e6e3c5', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'home.aboutPreview', 'Learn from some of the best surfers in the world.', 'Aprende con algunos de los mejores surfistas del mundo.', 'Aprende con algunos de los mejores surfistas del mundo.', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('00efa412-55e3-4547-bb24-879b03319905', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'home.lessonsTitle', 'Surf Lessons', 'Lecciones de surf', 'Lecciones de surf', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('7de4b4b8-c24f-4f9e-b401-815d8b87b9e4', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'home.lessonsDescription', 'From beginner-friendly sessions to advanced coaching', 'Desde sesiones para principiantes hasta coaching avanzado', 'Desde sesiones para principiantes hasta coaching avanzado', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('46a4be42-c0e6-426b-a28d-8c0ae44f775d', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'home.galleryTitle', 'Experience the Journey', 'Vive la experiencia', 'Vive la experiencia', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('46bd6ebb-213c-4d89-a77d-dd92f7ffdf66', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'home.galleryDescription', 'Watch videos and see photos from our surf adventures', 'Mira videos y fotos de nuestras aventuras de surf', 'Mira videos y fotos de nuestras aventuras de surf', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('30fe8bc6-7e01-4831-818a-ae5841a0e43f', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'home.teamTitle', 'Meet the Team', 'Conoce al equipo', 'Conoce al equipo', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('9c2abbe0-80ea-443e-b6a8-0d8ee4db8a8f', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'home.teamDescription', 'Get to know the coaches who make Sunset Surf Academy special', 'Conoce a los entrenadores que hacen especial a Sunset Surf Academy', 'Conoce a los entrenadores que hacen especial a Sunset Surf Academy', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('46b6614c-e851-4708-9bab-d65996aa9111', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'lessons.title', 'Surf Lessons', 'Lecciones de surf', 'Lecciones de surf', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('a0315bfd-e033-4b03-abd8-246737c1350b', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'lessons.subtitle', 'Professional instruction tailored to your skill level', 'Instrucción profesional adaptada a tu nivel', 'Instrucción profesional adaptada a tu nivel', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('52296c4e-2ccc-4285-bed0-5c4d82e74172', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'lessons.beginner.title', 'Lessons', 'Lecciones', 'Lecciones', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('01593580-2c50-4213-9429-534bc799290b', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'lessons.beginner.price', '$100', '$100', '$100', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('4fc13111-e239-4e20-a234-248e9a8d203b', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'lessons.beginner.duration', '2 hours', '2 horas', '2 horas', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('8ca8d5c2-ab9e-4c00-946f-e2846caa121e', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'lessons.beginner.location', 'Rincón to Isabela/Jobos', 'Rincón a Isabela/Jobos', 'Rincón a Isabela/Jobos', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('ac44fe56-15f6-4e7c-ba3b-b3ac8e1f1c09', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'lessons.beginner.description', 'The beginner lessons teach the fundamentals of surfing.', 'Las lecciones para principiantes enseñan los fundamentos del surf.', 'Las lecciones para principiantes enseñan los fundamentos del surf.', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('e74051b4-0413-48a8-984b-2a2e0117a32e', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'lessons.beginner.includes.0', 'Surfboard rental', 'Alquiler de tabla de surf', 'Alquiler de tabla de surf', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('8177b659-a1a8-4b8b-a962-611be19ae10d', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'lessons.beginner.includes.1', 'Safety briefing', 'Briefing de seguridad', 'Briefing de seguridad', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('aefe7f2a-1a03-4f3e-a8c3-acf2ed546ff5', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'lessons.beginner.includes.2', 'Personalized beach & water coaching', 'Coaching personalizado en playa y agua', 'Coaching personalizado en playa y agua', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('73e77bc3-459f-4887-8618-836931f42d92', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'lessons.beginner.includes.3', 'Photos of your session', 'Fotos de tu sesión', 'Fotos de tu sesión', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('bed7e86a-eaff-4f05-849e-1421d5df7103', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'lessons.intermediate.title', 'Advanced Coaching', 'Coaching avanzado', 'Coaching avanzado', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('f391351b-5f62-4063-a08e-62e225c4f0d0', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'lessons.intermediate.price', '$100', '$100', '$100', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('9cb6e12c-97f6-48d3-a417-e4d7c8e042e7', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'lessons.intermediate.duration', '2 hours', '2 horas', '2 horas', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('6d64d2cc-f5e3-4467-9c77-6219e28d2950', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'lessons.intermediate.location', 'Rincón to Isabela/Jobos', 'Rincón a Isabela/Jobos', 'Rincón a Isabela/Jobos', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('fc3e282d-90de-4a4a-b3d9-da0ee7925067', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'lessons.intermediate.description', 'Intermediate lessons teach how to read waves, interact in any lineup, and gain practical skills to surf more confidently.', 'Las lecciones intermedias enseñan a leer las olas, interactuar en cualquier line up y desarrollar habilidades prácticas para surfear con más confianza.', 'Las lecciones intermedias enseñan a leer las olas, interactuar en cualquier line up y desarrollar habilidades prácticas para surfear con más confianza.', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('d5438f49-13b4-44ed-81a7-bd8951964dd9', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'lessons.intermediate.includes.0', 'Surfboard rental', 'Alquiler de tabla de surf', 'Alquiler de tabla de surf', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('eeb40f15-43c9-4d28-a498-3bd5b43cf42b', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'lessons.intermediate.includes.1', 'Wave reading & lineup etiquette', 'Lectura de olas y etiqueta en el line up', 'Lectura de olas y etiqueta en el line up', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('d90f7470-1c7e-44c8-8b38-7db6a32f82b0', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'lessons.intermediate.includes.2', 'Skills development', 'Desarrollo de habilidades', 'Desarrollo de habilidades', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('89e88ca2-ac4c-47ac-a9ba-83ed7c784231', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'lessons.intermediate.includes.3', 'Photos and short video clips', 'Fotos y clips cortos de video', 'Fotos y clips cortos de video', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('ec891b25-6df4-4941-9b8b-fbb4105b37eb', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'lessons.advanced.title', 'Surf Guide', 'Guía de surf', 'Guía de surf', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('9bc32b42-780b-4512-9fd9-8eaa191ab82c', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'lessons.advanced.price', '$100', '$100', '$100', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('743f1b1c-2130-4b8a-af0c-62dcf9159704', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'lessons.advanced.duration', '2 hours', '2 horas', '2 horas', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('b887f9ae-ea46-4e64-a4b1-6d03039d85de', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'lessons.advanced.location', 'Various locations', 'Varias ubicaciones', 'Varias ubicaciones', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('52903d25-e381-45aa-a46a-e8e75f8f0923', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'faq.questions.6.question', 'What''s your refund policy?', '¿Cuál es su política de reembolso?', '¿Cuál es su política de reembolso?', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('159fa519-b513-41eb-91f5-5577907a4762', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'lessons.advanced.description', 'Advanced lessons cover advanced skills, video analysis, competition preparation, and custom programs.', 'Las lecciones avanzadas cubren habilidades avanzadas, análisis de video, preparación para competencias y programas personalizados.', 'Las lecciones avanzadas cubren habilidades avanzadas, análisis de video, preparación para competencias y programas personalizados.', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('01aba9c5-47bc-42b1-8561-e467de29480f', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'lessons.advanced.includes.0', 'Video review', 'Revisión de video', 'Revisión de video', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('11226537-9602-4098-a87e-5c996ba5fcab', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'lessons.advanced.includes.1', 'Technique analysis', 'Análisis de técnica', 'Análisis de técnica', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('71ef26ea-40ca-44c6-9c3f-7ab2961bea4d', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'lessons.advanced.includes.2', 'Competition prep', 'Preparación para competencias', 'Preparación para competencias', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('6f2828d4-b638-4a09-85d9-459ae49c932c', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'lessons.advanced.includes.3', 'Custom programs', 'Programas personalizados', 'Programas personalizados', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('4a2f2061-6d3a-4c7a-910c-a5fe8536c61c', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'booking.title', 'Book Your Lesson', 'Reserva tu lección', 'Reserva tu lección', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('ba5ee7f5-38f2-47d6-af92-7d483697bc5e', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'booking.selectDate', 'Select Date', 'Selecciona una fecha', 'Selecciona una fecha', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('2bb75792-21e5-463f-b5b3-5d4c349cb531', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'booking.selectTime', 'Select Time', 'Selecciona una hora', 'Selecciona una hora', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('c373ef25-b9e3-45f0-89ee-0c2a8b6b0a5a', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'booking.partySize', 'Party Size', 'Tamaño del grupo', 'Tamaño del grupo', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('b2bf256d-5457-4fb4-b040-f2e1b47f8cc2', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'booking.lessonType', 'Lesson Type', 'Tipo de lección', 'Tipo de lección', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('73dd1e24-9f75-4ed7-b0db-b8352f53be82', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'booking.totalPrice', 'Total Price', 'Precio total', 'Precio total', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('a4c0cdc8-ecf2-454a-98a7-8e442518a7e5', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'booking.customerInfo', 'Customer Information', 'Información del cliente', 'Información del cliente', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('9c07821f-c9fa-48a0-ad94-d9b2d988bf8d', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'booking.name', 'Full Name', 'Nombre completo', 'Nombre completo', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('eee444fb-0274-4ddf-800f-8471f74bb4e9', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'booking.email', 'Email Address', 'Correo electrónico', 'Correo electrónico', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('420cfdaa-0cad-490c-a992-077b2c4780c9', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'booking.phone', 'Phone Number', 'Número de teléfono', 'Número de teléfono', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('834b5d67-13ec-4827-93a7-90e301ec6b77', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'booking.proceedToPayment', 'Proceed to Payment', 'Continuar al pago', 'Continuar al pago', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('da6d9f6f-0a44-4a89-b71e-8d7173f7d1eb', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'about.title', 'About Jazmine Dean Perez', 'Sobre Jazmine Dean Perez', 'Sobre Jazmine Dean Perez', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('57ca93f9-81b1-4003-b0f3-a7bfcedfaf8c', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'about.subtitle', 'Professional Surfer & Instructor', 'Surfista profesional e instructora', 'Surfista profesional e instructora', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('84eef7bb-6a3d-4b4e-bdf7-49067f09f07a', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'about.bio', 'Jazmine Dean is a professional surfer representing Team Puerto Rico with an impressive competitive record. Based in the world-renowned surf town of Rincón, she brings years of experience and passion to every lesson.', 'Jazmine Dean es una surfista profesional que representa al Equipo Puerto Rico con un impresionante historial competitivo. Basada en el mundialmente reconocido pueblo de surf de Rincón, aporta años de experiencia y pasión a cada lección.', 'Jazmine Dean es una surfista profesional que representa al Equipo Puerto Rico con un impresionante historial competitivo. Basada en el mundialmente reconocido pueblo de surf de Rincón, aporta años de experiencia y pasión a cada lección.', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('90b4cfeb-cf3e-4d85-8f2c-90e74d324959', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'about.achievements', 'Achievements', 'Logros', 'Logros', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('f9533725-bf69-432c-947e-099891972eee', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'about.accolades.0', '4x East Coast Champion', '4x campeona de la Costa Este', '4x campeona de la Costa Este', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('669d2655-effa-4c73-ac32-acd6e0f3ee3f', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'about.accolades.1', 'Pan-American Games 2nd Place', '2.º lugar en los Juegos Panamericanos', '2.º lugar en los Juegos Panamericanos', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('2a67ee68-e58d-437a-976c-450b92df767e', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'about.accolades.2', 'ISA World Surfing Games Competitor', 'Competidora en los Juegos Mundiales de Surf ISA', 'Competidora en los Juegos Mundiales de Surf ISA', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('b5bb3436-ba8a-48f6-8af6-05230a542da3', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'about.accolades.3', 'Team Puerto Rico Member', 'Miembro del Equipo Puerto Rico', 'Miembro del Equipo Puerto Rico', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('d233132d-85b0-49db-aee8-ab2e601d6f9b', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'about.accolades.4', 'Professional Surf Instructor', 'Instructora profesional de surf', 'Instructora profesional de surf', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('2bee4830-834a-4c13-8990-e7fd166782a5', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'mission.title', 'Our Mission', 'Nuestra misión', 'Nuestra misión', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('a6965150-c71e-4a44-bec7-387a5094f1e7', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'mission.subtitle', 'Take Every Surfer To The Next Level', 'Llevar a cada surfista al siguiente nivel', 'Llevar a cada surfista al siguiente nivel', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('fc420830-e002-46bf-8603-5525ee6e1969', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'mission.lead', 'At Sunset Surf Academy our mission is simple: to help every surfer — from complete beginners to seasoned competitors — progress, have more fun, and get better results in the water.', 'En Sunset Surf Academy nuestra misión es simple: ayudar a cada surfista — desde principiantes completos hasta competidores experimentados — a progresar, divertirse más y obtener mejores resultados en el agua.', 'En Sunset Surf Academy nuestra misión es simple: ayudar a cada surfista — desde principiantes completos hasta competidores experimentados — a progresar, divertirse más y obtener mejores resultados en el agua.', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('bff309aa-5983-4d89-be70-dcd5d4dcfa87', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'mission.body1', 'We believe surfing is for everyone. For first-timers we focus on water safety, confidence-building and the fundamentals so your first waves are empowering and memorable. For intermediate and advanced surfers we offer technique work, video analysis and competition preparation that targets measurable improvement.', 'Creemos que el surf es para todos. Para quienes lo prueban por primera vez, nos enfocamos en la seguridad en el agua, construir confianza y los fundamentos para que tus primeras olas sean empoderadoras y memorables. Para surfistas intermedios y avanzados, ofrecemos técnica, análisis de video y preparación para competencias con mejoras medibles.', 'Creemos que el surf es para todos. Para quienes lo prueban por primera vez, nos enfocamos en la seguridad en el agua, construir confianza y los fundamentos para que tus primeras olas sean empoderadoras y memorables. Para surfistas intermedios y avanzados, ofrecemos técnica, análisis de video y preparación para competencias con mejoras medibles.', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('7792a7c8-7498-4353-bbed-c990dd4d02c8', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'faq.questions.6.answer', 'We offer full refunds for cancellations due to unsafe weather conditions. Other cancellations require 24-hour notice.', 'Ofrecemos reembolsos completos por cancelaciones debido a condiciones climáticas inseguras. Otras cancelaciones requieren aviso con 24 horas de anticipación.', 'Ofrecemos reembolsos completos por cancelaciones debido a condiciones climáticas inseguras. Otras cancelaciones requieren aviso con 24 horas de anticipación.', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('9d59ee0a-edc1-4dc3-aa55-e524fa6fa399', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'contact.title', 'Contact Jazmine', 'Contacta a Jazmine', 'Contacta a Jazmine', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('502905b4-183e-4d56-9ac6-daec8ebef242', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'mission.body2', 'Our coaches design lessons around your goals — whether that’s catching your first wave, improving your bottom turns, boosting aerials, or nailing contest-worthy maneuvers. We emphasize clear coaching, practical drills, and a supportive environment that accelerates learning while keeping the stoke alive.', 'Nuestros entrenadores diseñan lecciones según tus objetivos — ya sea atrapar tu primera ola, mejorar tus bottom turns, perfeccionar aéreos o dominar maniobras dignas de competencia. Enfatizamos coaching claro, ejercicios prácticos y un ambiente de apoyo que acelera el aprendizaje manteniendo la emoción viva.', 'Nuestros entrenadores diseñan lecciones según tus objetivos — ya sea atrapar tu primera ola, mejorar tus bottom turns, perfeccionar aéreos o dominar maniobras dignas de competencia. Enfatizamos coaching claro, ejercicios prácticos y un ambiente de apoyo que acelera el aprendizaje manteniendo la emoción viva.', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('6593ceb7-9d73-4630-8c0b-6c5994dfa6ba', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'mission.conclusion', 'Ultimately, success at Sunset Surf Academy isn’t just measured in scores; it’s measured in smiles, confidence and the endless pursuit of better surfing. Come surf with us and let’s take your surfing to the next level.', 'En última instancia, el éxito en Sunset Surf Academy no se mide solo en puntuaciones; se mide en sonrisas, confianza y la búsqueda interminable de un mejor surf. Ven a surfear con nosotros y llevemos tu surf al siguiente nivel.', 'En última instancia, el éxito en Sunset Surf Academy no se mide solo en puntuaciones; se mide en sonrisas, confianza y la búsqueda interminable de un mejor surf. Ven a surfear con nosotros y llevemos tu surf al siguiente nivel.', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('bc9ece66-a6b1-4723-99df-bbc2ba2e36f4', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'faq.title', 'Frequently Asked Questions', 'Preguntas frecuentes', 'Preguntas frecuentes', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('92cf0a54-0a85-49f6-8524-6fa20caa83be', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'faq.questions.0.question', 'Where do we meet for lessons?', '¿Dónde nos encontramos para las lecciones?', '¿Dónde nos encontramos para las lecciones?', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('00111e42-0f29-4c3c-ba40-e7493dcaf00b', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'faq.questions.0.answer', 'We are based out of Rincón, Puerto Rico, and primarily conduct lessons at our local beach breaks. However, when conditions are favorable and upon request, we''re happy to travel anywhere along the coast from Rincón up to Jobos and all the spots in between to find the perfect waves for your lesson.', 'Estamos ubicados en Rincón, Puerto Rico, y principalmente realizamos lecciones en nuestras playas locales. Sin embargo, cuando las condiciones son favorables y bajo pedido, podemos viajar a cualquier lugar a lo largo de la costa desde Rincón hasta Jobos y todos los lugares intermedios para encontrar las olas perfectas para tu lección.', 'Estamos ubicados en Rincón, Puerto Rico, y principalmente realizamos lecciones en nuestras playas locales. Sin embargo, cuando las condiciones son favorables y bajo pedido, podemos viajar a cualquier lugar a lo largo de la costa desde Rincón hasta Jobos y todos los lugares intermedios para encontrar las olas perfectas para tu lección.', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('7e95692c-b5e9-49c6-b517-1be6da4d538d', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'faq.questions.1.question', 'What''s included in beginner lessons?', '¿Qué incluyen las lecciones para principiantes?', '¿Qué incluyen las lecciones para principiantes?', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('60212e37-2334-4dec-ba36-29fac278f054', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'faq.questions.1.answer', 'Beginner lessons include surfboard rental, comprehensive safety briefing, personalized coaching both on the beach and in the water, and photos of your surf session to capture your progress and memorable moments.', 'Las lecciones para principiantes incluyen alquiler de tabla de surf, un briefing de seguridad completo, coaching personalizado en la playa y en el agua, y fotos de tu sesión para capturar tu progreso y momentos memorables.', 'Las lecciones para principiantes incluyen alquiler de tabla de surf, un briefing de seguridad completo, coaching personalizado en la playa y en el agua, y fotos de tu sesión para capturar tu progreso y momentos memorables.', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('9ccd3140-e00a-4e7b-b749-9e81fd1b69f6', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'faq.questions.2.question', 'What''s included in advanced coaching?', '¿Qué incluye el coaching avanzado?', '¿Qué incluye el coaching avanzado?', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('8ad9e73e-8b72-4dcd-b959-ed9d852805ce', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'faq.questions.2.answer', 'Advanced coaching is a comprehensive multi-session program that includes video analysis of your surfing. We start with a baseline session where we film your surfing, then review the footage together to identify areas for improvement. This is followed by a theory-to-practice session where you apply the techniques we''ve discussed, creating a complete learning cycle for advanced skill development.', 'El coaching avanzado es un programa completo de varias sesiones que incluye análisis de video de tu surf. Comenzamos con una sesión base donde filmamos tu surf, luego revisamos el material juntos para identificar áreas de mejora. Después, realizamos una sesión de teoría a práctica donde aplicas las técnicas discutidas, creando un ciclo completo de aprendizaje para el desarrollo de habilidades avanzadas.', 'El coaching avanzado es un programa completo de varias sesiones que incluye análisis de video de tu surf. Comenzamos con una sesión base donde filmamos tu surf, luego revisamos el material juntos para identificar áreas de mejora. Después, realizamos una sesión de teoría a práctica donde aplicas las técnicas discutidas, creando un ciclo completo de aprendizaje para el desarrollo de habilidades avanzadas.', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('d1792923-0c5c-40ea-824a-444ec6f52455', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'faq.questions.3.question', 'Can I reschedule my lesson?', '¿Puedo reprogramar mi lección?', '¿Puedo reprogramar mi lección?', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('5c39c886-3c91-4db3-a00c-942a38e5e409', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'faq.questions.3.answer', 'Yes, we offer flexible rescheduling options based on weather conditions and your availability.', 'Sí, ofrecemos opciones flexibles de reprogramación según las condiciones del clima y tu disponibilidad.', 'Sí, ofrecemos opciones flexibles de reprogramación según las condiciones del clima y tu disponibilidad.', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('bb3239ea-9972-4175-a1bc-8dac73e2414d', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'faq.questions.4.question', 'Are lessons suitable for complete beginners?', '¿Las lecciones son adecuadas para principiantes completos?', '¿Las lecciones son adecuadas para principiantes completos?', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('0d1ab06d-5c42-4d13-a1a5-7c0562aaf026', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'faq.questions.4.answer', 'Absolutely! Our beginner lessons are specifically designed for first-time surfers of all ages.', '¡Absolutamente! Nuestras lecciones para principiantes están diseñadas específicamente para surfistas primerizos de todas las edades.', '¡Absolutamente! Nuestras lecciones para principiantes están diseñadas específicamente para surfistas primerizos de todas las edades.', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('ffe9ab1f-a3fa-498e-a770-6fabf968b818', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'faq.questions.5.question', 'Do you offer group and family lessons?', '¿Ofrecen lecciones grupales y familiares?', '¿Ofrecen lecciones grupales y familiares?', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('8fd9e901-ae02-436e-8d53-936f8aa8a728', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'faq.questions.5.answer', 'Yes, we welcome groups and families. Contact us for special group rates and custom arrangements.', 'Sí, damos la bienvenida a grupos y familias. Contáctanos para tarifas especiales para grupos y arreglos personalizados.', 'Sí, damos la bienvenida a grupos y familias. Contáctanos para tarifas especiales para grupos y arreglos personalizados.', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('bb6580bd-581a-4b26-86e0-5196dfa9f628', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'contact.subtitle', 'Ready to book or have questions? Get in touch!', '¿Listo para reservar o tienes preguntas? ¡Ponte en contacto!', '¿Listo para reservar o tienes preguntas? ¡Ponte en contacto!', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('df35c836-1890-42b3-b454-af78f9e21624', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'contact.location', 'Rincón, Puerto Rico', 'Rincón, Puerto Rico', 'Rincón, Puerto Rico', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('0f4296ab-5a49-46fa-ab0e-61a7da3f9473', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'contact.followUs', 'Follow Us', 'Síguenos', 'Síguenos', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('700a8b44-5331-4307-8e23-3a86abfd9c9d', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'team.title', 'Meet the Team', 'Conoce al equipo', 'Conoce al equipo', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('959278c4-67f3-458a-a87e-339ba2167d62', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'team.subtitle', 'Learn from some of the best surfers in the world.', 'Aprende con algunos de los mejores surfistas del mundo.', 'Aprende con algunos de los mejores surfistas del mundo.', true, 32767, 'messages');
INSERT INTO public.cms_page_content (id, created_at, updated_at, created_by, updated_by, page_key, body_en, body_es_draft, body_es_published, approved, sort, category) VALUES ('0556376d-d41a-4b63-a15d-16c1d496e69a', '2025-12-21 12:59:48.629543+00', '2025-12-21 12:59:48.629543+00', NULL, NULL, 'team.intro', 'These are our top coaches who will take you to the next level in your surfing. Click on their profiles to learn a little about them!', 'Estos son nuestros mejores entrenadores que te llevarán al siguiente nivel en tu surf. Haz clic en sus perfiles para conocer un poco más sobre ellos.', 'Estos son nuestros mejores entrenadores que te llevarán al siguiente nivel en tu surf. Haz clic en sus perfiles para conocer un poco más sobre ellos.', true, 32767, 'messages');


--
-- Data for Name: media_assets; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.media_assets (id, title, description, created_at, updated_at, public, bucket, path, session_id, asset_type, sort, category) VALUES ('49000f45-9f99-444a-8257-ba9f1c7d5bb1', 'IMG_3859', 'synced from storage', '2025-12-22 21:19:52.02167+00', '2025-12-22 21:19:52.02167+00', true, 'Lesson_Photos', 'IMG_3859.JPG', NULL, 'photo', 32767, 'lessons');
INSERT INTO public.media_assets (id, title, description, created_at, updated_at, public, bucket, path, session_id, asset_type, sort, category) VALUES ('36cb9cd0-7609-4602-ae76-6ac39ef2dcab', 'palmTree', 'synced from storage', '2025-12-22 21:19:52.02167+00', '2025-12-22 21:19:52.02167+00', true, 'Lesson_Photos', 'palmTree.png', NULL, 'photo', 32767, 'lessons');
INSERT INTO public.media_assets (id, title, description, created_at, updated_at, public, bucket, path, session_id, asset_type, sort, category) VALUES ('896760f0-a364-4f17-b1aa-a0ca80085115', 'MVI_3628', 'synced from storage', '2025-12-22 21:19:52.02167+00', '2025-12-22 21:19:52.02167+00', true, 'Lesson_Photos', 'MVI_3628.MP4', NULL, 'video', 32767, 'lessons');
INSERT INTO public.media_assets (id, title, description, created_at, updated_at, public, bucket, path, session_id, asset_type, sort, category) VALUES ('87094a4d-b038-4c75-8e96-fc0a6332974d', 'SSA_gentle waves', 'synced from storage', '2025-12-22 21:19:52.02167+00', '2025-12-22 21:19:52.02167+00', true, 'Lesson_Photos', 'SSA_gentle waves.mp4', NULL, 'video', 32767, 'lessons');
INSERT INTO public.media_assets (id, title, description, created_at, updated_at, public, bucket, path, session_id, asset_type, sort, category) VALUES ('3fe3618b-73da-4127-b3ae-1565e2fa9784', 'SSA_Orange_Logo', 'synced from storage', '2025-12-22 21:19:52.02167+00', '2025-12-22 21:19:52.02167+00', true, 'Lesson_Photos', 'SSA_Orange_Logo.png', NULL, 'photo', 32767, 'lessons');
INSERT INTO public.media_assets (id, title, description, created_at, updated_at, public, bucket, path, session_id, asset_type, sort, category) VALUES ('c4b18176-3271-435f-9398-4b081923df89', 'isasilver', 'synced from storage', '2025-12-22 21:19:52.02167+00', '2025-12-22 21:19:52.02167+00', true, 'Lesson_Photos', 'isasilver.png', NULL, 'photo', 32767, 'lessons');
INSERT INTO public.media_assets (id, title, description, created_at, updated_at, public, bucket, path, session_id, asset_type, sort, category) VALUES ('f0314672-4e7e-413d-bc67-f6c1cac0da71', 'isa', 'synced from storage', '2025-12-22 21:19:52.02167+00', '2025-12-22 21:19:52.02167+00', true, 'Lesson_Photos', 'isa.png', NULL, 'photo', 32767, 'lessons');
INSERT INTO public.media_assets (id, title, description, created_at, updated_at, public, bucket, path, session_id, asset_type, sort, category) VALUES ('e3c9dfab-9c02-4a36-89de-d0d7d4f3f69d', 'sbsnap', 'synced from storage', '2025-12-22 21:19:52.02167+00', '2025-12-22 21:19:52.02167+00', true, 'Lesson_Photos', 'sbsnap.png', NULL, 'photo', 32767, 'lessons');
INSERT INTO public.media_assets (id, title, description, created_at, updated_at, public, bucket, path, session_id, asset_type, sort, category) VALUES ('178a898f-a085-4363-8eb9-06a344c5586f', 'Want to learn cross stepping 2', 'synced from storage', '2025-12-22 21:19:52.02167+00', '2025-12-22 21:19:52.02167+00', true, 'Lesson_Photos', 'Want to learn cross stepping 2.mp4', NULL, 'video', 32767, 'lessons');
INSERT INTO public.media_assets (id, title, description, created_at, updated_at, public, bucket, path, session_id, asset_type, sort, category) VALUES ('9a841c26-b762-45eb-8bbd-94eda57a94ac', 'prices', 'synced from storage', '2025-12-22 21:19:52.02167+00', '2025-12-22 21:19:52.02167+00', true, 'Lesson_Photos', 'prices.png', NULL, 'photo', 32767, 'lessons');
INSERT INTO public.media_assets (id, title, description, created_at, updated_at, public, bucket, path, session_id, asset_type, sort, category) VALUES ('5ba1e743-3d5e-48a5-b3e6-d7fb611dca49', 'image_6483441 (1)', 'synced from storage', '2025-12-22 19:48:26.642098+00', '2025-12-22 19:48:26.642098+00', true, 'Lesson_Photos', 'image_6483441 (1).JPG', NULL, 'photo', 32767, 'lessons');
INSERT INTO public.media_assets (id, title, description, created_at, updated_at, public, bucket, path, session_id, asset_type, sort, category) VALUES ('5342e269-d6db-4d31-abab-d736cb021066', 'image_6483441 (5)', 'synced from storage', '2025-12-22 19:48:26.642098+00', '2025-12-22 19:48:26.642098+00', true, 'Lesson_Photos', 'image_6483441 (5).JPG', NULL, 'photo', 32767, 'lessons');
INSERT INTO public.media_assets (id, title, description, created_at, updated_at, public, bucket, path, session_id, asset_type, sort, category) VALUES ('47895a11-af43-4cc6-999c-26ecf72351df', 'surfSchoolShot', 'synced from storage', '2025-12-22 19:48:26.642098+00', '2025-12-22 19:48:26.642098+00', true, 'Lesson_Photos', 'surfSchoolShot.png', NULL, 'photo', 32767, 'lessons');
INSERT INTO public.media_assets (id, title, description, created_at, updated_at, public, bucket, path, session_id, asset_type, sort, category) VALUES ('7ac0a6a4-b505-4229-9a18-2580b34c5a9e', 'IMG_3855', 'synced from storage', '2025-12-22 19:48:26.642098+00', '2025-12-22 19:48:26.642098+00', true, 'Lesson_Photos', 'IMG_3855.JPG', NULL, 'photo', 32767, 'lessons');
INSERT INTO public.media_assets (id, title, description, created_at, updated_at, public, bucket, path, session_id, asset_type, sort, category) VALUES ('0d680a3d-60ab-4e46-9007-5a2a5f5f772b', 'IMG_3856', 'synced from storage', '2025-12-22 19:48:26.642098+00', '2025-12-22 19:48:26.642098+00', true, 'Lesson_Photos', 'IMG_3856.JPG', NULL, 'photo', 32767, 'lessons');
INSERT INTO public.media_assets (id, title, description, created_at, updated_at, public, bucket, path, session_id, asset_type, sort, category) VALUES ('6b9275d1-6e88-4e78-8fe1-ef1b042ee441', 'IMG_2505 2', 'synced from storage', '2025-12-22 19:48:26.642098+00', '2025-12-22 19:48:26.642098+00', true, 'Lesson_Photos', 'IMG_2505 2.JPG', NULL, 'photo', 32767, 'lessons');
INSERT INTO public.media_assets (id, title, description, created_at, updated_at, public, bucket, path, session_id, asset_type, sort, category) VALUES ('ec79eb3f-a158-43be-ab1e-56a79474e75f', 'IMG_2505', 'synced from storage', '2025-12-22 19:48:26.642098+00', '2025-12-22 19:48:26.642098+00', true, 'Lesson_Photos', 'IMG_2505.JPG', NULL, 'photo', 32767, 'lessons');
INSERT INTO public.media_assets (id, title, description, created_at, updated_at, public, bucket, path, session_id, asset_type, sort, category) VALUES ('c6460107-d0de-4748-94e6-3a261efccbb0', 'IMG_3633', 'synced from storage', '2025-12-22 19:48:26.642098+00', '2025-12-22 19:48:26.642098+00', true, 'Lesson_Photos', 'IMG_3633.JPG', NULL, 'photo', 32767, 'lessons');
INSERT INTO public.media_assets (id, title, description, created_at, updated_at, public, bucket, path, session_id, asset_type, sort, category) VALUES ('01593177-0e92-41fe-94b4-20fb108027ba', 'IMG_3629', 'synced from storage', '2025-12-22 19:48:26.642098+00', '2025-12-22 19:48:26.642098+00', true, 'Lesson_Photos', 'IMG_3629.JPG', NULL, 'photo', 32767, 'lessons');
INSERT INTO public.media_assets (id, title, description, created_at, updated_at, public, bucket, path, session_id, asset_type, sort, category) VALUES ('305ffcac-91cf-4670-81ac-e8aa2e4705f5', 'IMG_3627', 'synced from storage', '2025-12-22 19:48:26.642098+00', '2025-12-22 19:48:26.642098+00', true, 'Lesson_Photos', 'IMG_3627.JPG', NULL, 'photo', 32767, 'lessons');
INSERT INTO public.media_assets (id, title, description, created_at, updated_at, public, bucket, path, session_id, asset_type, sort, category) VALUES ('67b9bc0b-65ae-4a74-873b-36463fcb4522', 'contact_card', 'synced from storage', '2025-12-22 21:19:52.02167+00', '2025-12-22 21:19:52.02167+00', true, 'Lesson_Photos', 'contact_card.png', NULL, 'photo', 32767, 'lessons');
INSERT INTO public.media_assets (id, title, description, created_at, updated_at, public, bucket, path, session_id, asset_type, sort, category) VALUES ('7693ee08-1215-4561-92ae-7f91eb11e7ee', '2', 'synced from storage', '2025-12-22 21:19:52.02167+00', '2025-12-22 21:19:52.02167+00', true, 'Lesson_Photos', '2.png', NULL, 'photo', 32767, 'lessons');
INSERT INTO public.media_assets (id, title, description, created_at, updated_at, public, bucket, path, session_id, asset_type, sort, category) VALUES ('719d5909-b4d7-42c4-875c-4ca5563160b1', '4', 'synced from storage', '2025-12-22 21:19:52.02167+00', '2025-12-22 21:19:52.02167+00', true, 'Lesson_Photos', '4.png', NULL, 'photo', 32767, 'lessons');
INSERT INTO public.media_assets (id, title, description, created_at, updated_at, public, bucket, path, session_id, asset_type, sort, category) VALUES ('95851b90-3a70-4d6f-8a61-7316c0fd5985', '3', 'synced from storage', '2025-12-22 21:19:52.02167+00', '2025-12-22 21:19:52.02167+00', true, 'Lesson_Photos', '3.png', NULL, 'photo', 32767, 'lessons');
INSERT INTO public.media_assets (id, title, description, created_at, updated_at, public, bucket, path, session_id, asset_type, sort, category) VALUES ('bca089ce-4bd6-4c5a-9e32-51dfb9f8c768', 'Dress', 'synced from storage', '2025-12-22 21:19:52.02167+00', '2025-12-22 21:19:52.02167+00', true, 'Lesson_Photos', 'Dress.png', NULL, 'photo', 32767, 'lessons');
INSERT INTO public.media_assets (id, title, description, created_at, updated_at, public, bucket, path, session_id, asset_type, sort, category) VALUES ('2db64cd2-d0e6-4dfc-a308-f20733a7c9fc', 'dress2', 'synced from storage', '2025-12-22 21:19:52.02167+00', '2025-12-22 21:19:52.02167+00', true, 'Lesson_Photos', 'dress2.png', NULL, 'photo', 32767, 'lessons');
INSERT INTO public.media_assets (id, title, description, created_at, updated_at, public, bucket, path, session_id, asset_type, sort, category) VALUES ('23c089ca-3815-4873-b932-cffad1859bf7', '5', 'synced from storage', '2025-12-22 21:19:52.02167+00', '2025-12-22 21:19:52.02167+00', true, 'Lesson_Photos', '5.png', NULL, 'photo', 32767, 'lessons');
INSERT INTO public.media_assets (id, title, description, created_at, updated_at, public, bucket, path, session_id, asset_type, sort, category) VALUES ('55402377-6aed-4953-be21-4aea15c56fc2', '1', 'synced from storage', '2025-12-22 21:19:52.02167+00', '2025-12-22 21:19:52.02167+00', true, 'Lesson_Photos', '1.png', NULL, 'photo', 32767, 'lessons');
INSERT INTO public.media_assets (id, title, description, created_at, updated_at, public, bucket, path, session_id, asset_type, sort, category) VALUES ('da79e1c8-8676-4b8f-b863-bc31211a0322', 'hero_shot', 'synced from storage', '2025-12-22 21:19:52.02167+00', '2025-12-22 21:19:52.02167+00', true, 'Lesson_Photos', 'hero_shot.png', NULL, 'photo', 32767, 'lessons');
INSERT INTO public.media_assets (id, title, description, created_at, updated_at, public, bucket, path, session_id, asset_type, sort, category) VALUES ('85e71f86-4c80-4a27-aa49-f29be5f701cb', 'hang10', 'synced from storage', '2025-12-22 21:19:52.02167+00', '2025-12-22 21:19:52.02167+00', true, 'Lesson_Photos', 'hang10.png', NULL, 'photo', 32767, 'lessons');
INSERT INTO public.media_assets (id, title, description, created_at, updated_at, public, bucket, path, session_id, asset_type, sort, category) VALUES ('88a40d13-203f-496d-b76c-6007c2f53b61', 'SSA_BW_Logo', 'synced from storage', '2025-12-22 21:19:52.02167+00', '2025-12-22 21:19:52.02167+00', true, 'Lesson_Photos', 'SSA_BW_Logo.png', NULL, 'photo', 32767, 'lessons');
INSERT INTO public.media_assets (id, title, description, created_at, updated_at, public, bucket, path, session_id, asset_type, sort, category) VALUES ('43f332cb-4f08-452b-8281-9108e53d1870', 'lbturn', 'synced from storage', '2025-12-22 21:19:52.02167+00', '2025-12-22 21:19:52.02167+00', true, 'Lesson_Photos', 'lbturn.png', NULL, 'photo', 32767, 'lessons');
INSERT INTO public.media_assets (id, title, description, created_at, updated_at, public, bucket, path, session_id, asset_type, sort, category) VALUES ('ea54ad52-932a-4d3f-b657-00a1f32a6961', 'SSA_ Enter and exit', 'synced from storage', '2025-12-22 21:19:52.02167+00', '2025-12-22 21:19:52.02167+00', true, 'Lesson_Photos', 'SSA_ Enter and exit.mp4', NULL, 'video', 32767, 'lessons');


--
-- PostgreSQL database dump complete
--

