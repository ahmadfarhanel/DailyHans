create table if not exists savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) <= 160),
  target_amount numeric(12,2) not null check (target_amount > 0),
  target_date date,
  created_at timestamptz not null default now()
);

create table if not exists savings_deposits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_id uuid not null references savings_goals(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  note text default '',
  deposited_at timestamptz not null default now()
);

alter table savings_goals enable row level security;
alter table savings_deposits enable row level security;

create policy "own savings goals" on savings_goals for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own savings deposits" on savings_deposits for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create index if not exists idx_savings_goals_user on savings_goals(user_id, created_at);
create index if not exists idx_savings_deposits_user_goal on savings_deposits(user_id, goal_id, deposited_at desc);
