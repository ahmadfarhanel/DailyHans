create table if not exists wedding_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  couple_name text default '',
  wedding_date date,
  total_budget numeric(12,2) not null default 0 check (total_budget >= 0),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists wedding_tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) <= 200),
  due_date date,
  done boolean not null default false,
  created_at timestamptz default now()
);

create table if not exists wedding_vendors (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) <= 160),
  service text default '',
  contact text default '',
  total_amount numeric(12,2) not null default 0 check (total_amount >= 0),
  paid_amount numeric(12,2) not null default 0 check (paid_amount >= 0),
  due_date date,
  created_at timestamptz default now(),
  check (paid_amount <= total_amount)
);

create table if not exists wedding_budget_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (char_length(category) <= 100),
  planned_amount numeric(12,2) not null default 0 check (planned_amount >= 0),
  actual_amount numeric(12,2) not null default 0 check (actual_amount >= 0),
  created_at timestamptz default now()
);

create table if not exists wedding_guests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) <= 160),
  family_side text not null default 'Mempelai' check (char_length(family_side) <= 100),
  region text default '' check (char_length(region) <= 120),
  pax integer not null default 1 check (pax > 0 and pax <= 20),
  rsvp text not null default 'menunggu' check (rsvp in ('menunggu', 'hadir', 'tidak_hadir')),
  created_at timestamptz default now()
);

alter table wedding_guests add column if not exists phone text default '' check (char_length(phone) <= 30);

create table if not exists wedding_needs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) <= 160),
  amount numeric(12,2) not null default 0 check (amount >= 0),
  note text default '',
  created_at timestamptz default now()
);

create table if not exists wedding_timeline (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) <= 200),
  event_date date not null,
  note text default '',
  done boolean not null default false,
  created_at timestamptz default now()
);

alter table wedding_settings enable row level security;
alter table wedding_tasks enable row level security;
alter table wedding_vendors enable row level security;
alter table wedding_budget_items enable row level security;
alter table wedding_guests enable row level security;
alter table wedding_timeline enable row level security;

create policy "own wedding settings" on wedding_settings for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own wedding tasks" on wedding_tasks for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own wedding vendors" on wedding_vendors for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own wedding budget items" on wedding_budget_items for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own wedding guests" on wedding_guests for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own wedding timeline" on wedding_timeline for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create index if not exists idx_wedding_tasks_user_due on wedding_tasks(user_id, due_date);
create index if not exists idx_wedding_vendors_user_due on wedding_vendors(user_id, due_date);
create index if not exists idx_wedding_timeline_user_date on wedding_timeline(user_id, event_date);
