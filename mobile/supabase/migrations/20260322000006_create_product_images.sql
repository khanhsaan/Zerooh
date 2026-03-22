create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.product_images enable row level security;

create policy "Anyone can read product images"
  on public.product_images for select
  using (true);

create policy "Product owners can insert images"
  on public.product_images for insert
  with check (
    auth.uid() = (select user_id from public.products where id = product_id)
  );

create policy "Product owners can delete images"
  on public.product_images for delete
  using (
    auth.uid() = (select user_id from public.products where id = product_id)
  );
