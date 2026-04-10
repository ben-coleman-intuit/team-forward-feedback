-- Run in Supabase SQL Editor (Dashboard → SQL → New query)

create table if not exists public.leadership_responses (
  id uuid primary key default gen_random_uuid(),
  ratings jsonb not null default '{}'::jsonb,
  free_text text,
  submitted_at timestamptz not null default now()
);

create index if not exists leadership_responses_submitted_at_idx
  on public.leadership_responses (submitted_at desc);

alter table public.leadership_responses enable row level security;

create policy "leadership_insert_anon"
  on public.leadership_responses
  for insert to anon
  with check (true);

create policy "leadership_select_anon"
  on public.leadership_responses
  for select to anon
  using (true);
