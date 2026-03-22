create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  quantity integer default 1,
  created_at timestamptz not null default now(),
  expired_at timestamptz
);

alter table public.carts enable row level security;

create policy "Users can manage own cart"
  on public.carts for all
  using (auth.uid() = user_id);
