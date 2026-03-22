-- Add a direct FK from products.user_id to business_profiles.user_id so that
-- PostgREST can resolve the relationship when joining products with business_profiles.
-- business_profiles.user_id is UNIQUE, making it a valid FK target.
alter table public.products
  add constraint products_business_profile_fkey
  foreign key (user_id) references public.business_profiles(user_id) on delete cascade;
