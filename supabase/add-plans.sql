create table if not exists plans (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text default '',
  date date not null,
  location text default '',
  budget numeric(12,2) default 0,
  status text default 'rencana',
  created_at timestamptz default now()
);

alter table plans enable row level security;

create policy "own plans" on plans for all using (user_id = auth.uid());

create index if not exists idx_plans_user_date on plans(user_id, date desc);
