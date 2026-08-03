-- Run di Supabase SQL Editor
alter table expenses add column if not exists added_by text default '';
create table if not exists income (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  source text not null default 'gaji',
  description text default '',
  date date not null default current_date,
  added_by text default '',
  created_at timestamptz default now()
);
alter table income enable row level security;
create policy "own income" on income for all using (user_id = auth.uid());