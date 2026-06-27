-- ============================================================
--  Flower Oil Reviews — Supabase setup
--  Run this once in Supabase → SQL Editor → New query → Run
-- ============================================================

create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  rating      integer not null check (rating between 1 and 5),
  text        text not null,
  approved    boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Turn on Row Level Security so the rules below are the ONLY way in.
alter table public.reviews enable row level security;

-- Visitors can READ only the reviews you have approved.
create policy "Public can read approved reviews"
  on public.reviews
  for select
  to anon
  using (approved = true);

-- Visitors can SUBMIT a review, but it always starts unapproved.
-- The WITH CHECK (approved = false) stops anyone from sneaking in
-- a pre-approved review from the browser.
create policy "Public can submit pending reviews"
  on public.reviews
  for insert
  to anon
  with check (approved = false);

-- ============================================================
--  How to approve a review:
--  Supabase → Table Editor → reviews → find the row →
--  set "approved" to true. It appears on the site instantly.
-- ============================================================
