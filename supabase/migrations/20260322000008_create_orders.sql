create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  quantity integer not null default 1,
  total_price_cents integer not null default 0,
  status text not null default 'pending' check (status in ('pending', 'completed', 'cancelled')),
  pickup_time timestamptz,
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy "Users can read own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Users can insert own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

create policy "Business owners can read orders for their products"
  on public.orders for select
  using (
    auth.uid() = (select user_id from public.products where id = product_id)
  );
