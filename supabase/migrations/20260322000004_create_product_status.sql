create table if not exists public.product_status (
  id uuid primary key default gen_random_uuid(),
  status_name text not null unique,
  created_at timestamptz not null default now()
);

insert into public.product_status (status_name) values
  ('active'),
  ('sold_out')
on conflict (status_name) do nothing;

alter table public.product_status enable row level security;

create policy "Anyone can read product status"
  on public.product_status for select
  using (true);
