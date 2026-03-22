create table if not exists public.business_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  business_name text,
  phone text,
  address text,
  suburb text,
  postcode text,
  default_role text not null default 'business',
  created_at timestamptz not null default now()
);

-- Auto-create business_profile on signup if isBusiness = true
create or replace function public.handle_new_business_user()
returns trigger as $$
begin
  if (new.raw_user_meta_data->>'isBusiness')::boolean then
    insert into public.business_profiles (user_id)
    values (new.id);
  end if;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_business_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_business_user();

-- RLS
alter table public.business_profiles enable row level security;

create policy "Business owners can read own profile"
  on public.business_profiles for select
  using (auth.uid() = user_id);

create policy "Business owners can update own profile"
  on public.business_profiles for update
  using (auth.uid() = user_id);

create policy "Anyone can read business profiles"
  on public.business_profiles for select
  using (true);
