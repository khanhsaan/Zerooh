create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid references public.product_categories(id),
  status_id uuid references public.product_status(id),
  product_name text not null,
  short_description text,
  long_description text,
  original_price_cents integer not null default 0,
  discounted_price_cents integer not null default 0,
  stock integer not null default 0,
  pickup_start timestamptz,
  pickup_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "Anyone can read products"
  on public.products for select
  using (true);

create policy "Business owners can insert products"
  on public.products for insert
  with check (auth.uid() = user_id);

create policy "Business owners can update own products"
  on public.products for update
  using (auth.uid() = user_id);

create policy "Business owners can delete own products"
  on public.products for delete
  using (auth.uid() = user_id);
