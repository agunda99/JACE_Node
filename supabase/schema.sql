create table if not exists public.jace_event_attendees (
  session_id text primary key,
  event text not null,
  name text not null,
  phone text not null,
  created_at timestamptz not null default now()
);

alter table public.jace_event_attendees  enable row level security;