-- Mr. Camden schema

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  credits int not null default 1,
  created_at timestamptz not null default now(),
  stripe_customer_id text unique,
  stripe_subscription_id text,
  subscription_status text,
  subscription_current_period_end timestamptz,
  cancel_at_period_end boolean not null default false
);

create index if not exists profiles_stripe_customer_id_idx on public.profiles(stripe_customer_id);

alter table public.profiles enable row level security;

drop policy if exists "own_profile_select" on public.profiles;
create policy "own_profile_select"
  on public.profiles for select
  using (auth.uid() = id);

-- Auto-create profile on new auth user
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, credits) values (new.id, 1)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Atomically deduct a credit; returns new balance or -1 if none
create or replace function public.deduct_credit(p_user uuid)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  new_balance int;
begin
  update public.profiles
     set credits = credits - 1
   where id = p_user and credits > 0
   returning credits into new_balance;
  if new_balance is null then
    return -1;
  end if;
  return new_balance;
end;
$$;

-- Add credits after purchase
create or replace function public.add_credits(p_user uuid, p_amount int)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  new_balance int;
begin
  update public.profiles
     set credits = credits + p_amount
   where id = p_user
   returning credits into new_balance;
  return coalesce(new_balance, 0);
end;
$$;

grant execute on function public.deduct_credit(uuid) to authenticated;
grant execute on function public.add_credits(uuid, int) to service_role;

-- Idempotency log for Stripe webhook events
create table if not exists public.stripe_events (
  id text primary key,
  processed_at timestamptz not null default now()
);
