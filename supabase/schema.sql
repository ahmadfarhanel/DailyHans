create extension if not exists "uuid-ossp";

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  created_at timestamptz default now()
);

create table if not exists expenses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  category text not null default 'lainnya',
  description text default '',
  date date not null default current_date,
  created_at timestamptz default now()
);

create table if not exists chores (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  assignee text default '',
  done boolean default false,
  due_date date,
  repeat_days int default 0,
  created_at timestamptz default now()
);

create table if not exists shopping_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  quantity text default '1',
  bought boolean default false,
  category text default 'umum',
  created_at timestamptz default now()
);

create table if not exists bills (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  amount numeric(12,2) not null check (amount > 0),
  due_date date not null,
  paid boolean default false,
  recurring text default 'bulanan',
  category text default 'lainnya',
  created_at timestamptz default now()
);

alter table profiles enable row level security;
alter table expenses enable row level security;
alter table chores enable row level security;
alter table shopping_items enable row level security;
alter table bills enable row level security;

create policy "own profile" on profiles for all using (id = auth.uid());
create policy "own expenses" on expenses for all using (user_id = auth.uid());
create policy "own chores" on chores for all using (user_id = auth.uid());
create policy "own shopping" on shopping_items for all using (user_id = auth.uid());
create policy "own bills" on bills for all using (user_id = auth.uid());

create index if not exists idx_expenses_user_date on expenses(user_id, date desc);
create index if not exists idx_chores_user_done on chores(user_id, done);
create index if not exists idx_shopping_user_bought on shopping_items(user_id, bought);
create index if not exists idx_bills_user_due on bills(user_id, due_date);
