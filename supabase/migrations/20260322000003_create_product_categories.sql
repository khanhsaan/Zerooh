create table if not exists public.product_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  emoji text,
  created_at timestamptz not null default now()
);

-- Seed categories
insert into public.product_categories (name, emoji) values
  ('Bakery', '🥐'),
  ('Cafe', '☕'),
  ('Meals', '🍱'),
  ('Drinks', '🧃'),
  ('Grocery', '🛒')
on conflict (name) do nothing;

-- RLS
alter table public.product_categories enable row level security;

create policy "Anyone can read categories"
  on public.product_categories for select
  using (true);
