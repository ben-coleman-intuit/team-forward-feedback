-- Run in Supabase SQL Editor (Dashboard → SQL → New query)

create table if not exists public.responses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  ratings jsonb not null default '{}'::jsonb,
  comments text,
  submitted_at timestamptz not null default now()
);

create index if not exists responses_submitted_at_idx on public.responses (submitted_at desc);

alter table public.responses enable row level security;

-- Anonymous access is safe only when RLS policies are restrictive enough for your use case.
-- These policies allow anyone with the anon key to insert and read all rows (public form + dashboard).
-- Tighten (e.g. auth-only SELECT) if you need stricter privacy.

create policy "responses_insert_anon"
  on public.responses
  for insert
  to anon
  with check (true);

create policy "responses_select_anon"
  on public.responses
  for select
  to anon
  using (true);
