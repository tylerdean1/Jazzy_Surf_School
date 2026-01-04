-- Fix: "query has no destination for result data" in business expense RPCs
-- These functions previously used `... RETURNING *;` without capturing the row in PL/pgSQL.

create or replace function public.admin_create_business_expense(
  p_expense_date date,
  p_category public.finance_category,
  p_total_cents integer,
  p_vendor_name text default null,
  p_description text default null,
  p_payment_method public.payment_method default null,
  p_subtotal_cents integer default null,
  p_tax_cents integer default null,
  p_tip_cents integer default null,
  p_transaction_id text default null,
  p_is_refund boolean default false,
  p_parent_expense_id uuid default null,
  p_notes text default null
) returns public.business_expenses
language plpgsql
security definer
as $$

declare
  v_row public.business_expenses;
  v_is_refund boolean;
  v_session_status public.lesson_status;

begin
  if not public.is_admin() then
    raise exception 'admin only';
  end if;

  v_is_refund := coalesce(p_is_refund, false);

  if p_total_cents is null or p_total_cents < 0 then
    raise exception 'total_cents must be >= 0';
  end if;

  if v_is_refund and p_parent_expense_id is null then
    raise exception 'refund expenses require parent_expense_id';
  end if;

  if not v_is_refund and p_parent_expense_id is not null then
    raise exception 'non-refund expenses cannot have parent_expense_id';
  end if;

  if v_is_refund and p_parent_expense_id is not null then
    select s.lesson_status
      into v_session_status
      from public.sessions s
      where s.id = p_parent_expense_id;

    if not found then
      raise exception 'parent_expense_id must reference an existing session';
    end if;

    if v_session_status is distinct from 'canceled_with_refund'::public.lesson_status
       and v_session_status is distinct from 'booked_paid_in_full'::public.lesson_status then
      raise exception 'parent_expense_id session must be canceled_with_refund or booked_paid_in_full';
    end if;
  end if;

  insert into public.business_expenses (
    expense_date,
    category,
    total_cents,
    vendor_name,
    description,
    payment_method,
    subtotal_cents,
    tax_cents,
    tip_cents,
    transaction_id,
    is_refund,
    parent_expense_id,
    notes
  ) values (
    p_expense_date,
    p_category,
    p_total_cents,
    p_vendor_name,
    p_description,
    p_payment_method,
    p_subtotal_cents,
    p_tax_cents,
    p_tip_cents,
    p_transaction_id,
    v_is_refund,
    p_parent_expense_id,
    p_notes
  )
  returning * into v_row;

  return v_row;
end;

$$;


create or replace function public.admin_update_business_expense(
  p_id uuid,
  p_expense_date date,
  p_category public.finance_category,
  p_total_cents integer,
  p_vendor_name text default null,
  p_description text default null,
  p_payment_method public.payment_method default null,
  p_subtotal_cents integer default null,
  p_tax_cents integer default null,
  p_tip_cents integer default null,
  p_transaction_id text default null,
  p_is_refund boolean default false,
  p_parent_expense_id uuid default null,
  p_notes text default null
) returns public.business_expenses
language plpgsql
security definer
as $$

declare
  v_row public.business_expenses;
  v_is_refund boolean;
  v_session_status public.lesson_status;

begin
  if not public.is_admin() then
    raise exception 'admin only';
  end if;

  v_is_refund := coalesce(p_is_refund, false);

  if p_total_cents is null or p_total_cents < 0 then
    raise exception 'total_cents must be >= 0';
  end if;

  if v_is_refund and p_parent_expense_id is null then
    raise exception 'refund expenses require parent_expense_id';
  end if;

  if not v_is_refund and p_parent_expense_id is not null then
    raise exception 'non-refund expenses cannot have parent_expense_id';
  end if;

  if v_is_refund and p_parent_expense_id is not null then
    select s.lesson_status
      into v_session_status
      from public.sessions s
      where s.id = p_parent_expense_id;

    if not found then
      raise exception 'parent_expense_id must reference an existing session';
    end if;

    if v_session_status is distinct from 'canceled_with_refund'::public.lesson_status
       and v_session_status is distinct from 'booked_paid_in_full'::public.lesson_status then
      raise exception 'parent_expense_id session must be canceled_with_refund or booked_paid_in_full';
    end if;
  end if;

  update public.business_expenses
  set
    expense_date = p_expense_date,
    category = p_category,
    total_cents = p_total_cents,
    vendor_name = p_vendor_name,
    description = p_description,
    payment_method = p_payment_method,
    subtotal_cents = p_subtotal_cents,
    tax_cents = p_tax_cents,
    tip_cents = p_tip_cents,
    transaction_id = p_transaction_id,
    is_refund = v_is_refund,
    parent_expense_id = p_parent_expense_id,
    notes = p_notes,
    updated_at = now()
  where id = p_id
  returning * into v_row;

  if not found then
    raise exception 'expense not found';
  end if;

  return v_row;
end;

$$;
