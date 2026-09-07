-- Plan-Do-See Diary (T06) schema
-- All times: due_date / period_start / period_end are plain dates representing
-- the Asia/Seoul (KST) calendar day. started_at / ended_at / created_at /
-- edited_at are true instants (timestamptz).
-- No auth: this app has no login (by design for T06). RLS policies below
-- intentionally allow full public read/write via the anon key. Locking
-- individual entries is out of scope here and is handled in T07.

create extension if not exists "pgcrypto";

create table if not exists plans (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  period_start date not null,
  period_end date not null,
  priority text not null check (priority in ('high', 'medium', 'low')),
  success_criteria text not null,
  estimated_minutes integer not null check (estimated_minutes >= 0),
  carried_over_note text,
  carried_over_from_retro_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Snapshot of a plan's fields taken immediately before each edit, so the
-- originally-entered plan is never lost (T06-C08).
create table if not exists plan_revisions (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references plans(id) on delete cascade,
  title text not null,
  period_start date not null,
  period_end date not null,
  priority text not null,
  success_criteria text not null,
  estimated_minutes integer not null,
  edited_at timestamptz not null default now()
);

create table if not exists todos (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references plans(id) on delete cascade,
  title text not null,
  due_date date not null,
  priority text not null check (priority in ('high', 'medium', 'low')),
  tag text not null default '',
  estimated_minutes integer not null check (estimated_minutes >= 0),
  status text not null default 'active' check (status in ('active', 'done')),
  completed_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One row per completion. Created atomically with the todos.status flip so
-- double-clicking "완료" cannot create two rows (T06-C21/C22/C27).
create table if not exists execution_records (
  id uuid primary key default gen_random_uuid(),
  todo_id uuid not null references todos(id) on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz not null,
  actual_minutes integer not null check (actual_minutes >= 0),
  blocked_reason text,
  created_at timestamptz not null default now()
);

create table if not exists retrospectives (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references plans(id) on delete cascade,
  improvement_note text not null,
  created_at timestamptz not null default now(),
  carried_over_to_plan_id uuid references plans(id)
);

alter table plans
  add constraint plans_carried_over_from_retro_id_fkey
  foreign key (carried_over_from_retro_id) references retrospectives(id);

create index if not exists idx_todos_plan_id on todos(plan_id);
create index if not exists idx_execution_records_todo_id on execution_records(todo_id);
create index if not exists idx_plan_revisions_plan_id on plan_revisions(plan_id);
create index if not exists idx_retrospectives_plan_id on retrospectives(plan_id);

-- Row Level Security: fully open, matching the "no login" design of T06.
alter table plans enable row level security;
alter table plan_revisions enable row level security;
alter table todos enable row level security;
alter table execution_records enable row level security;
alter table retrospectives enable row level security;

drop policy if exists "public_all_plans" on plans;
create policy "public_all_plans" on plans for all using (true) with check (true);

drop policy if exists "public_all_plan_revisions" on plan_revisions;
create policy "public_all_plan_revisions" on plan_revisions for all using (true) with check (true);

drop policy if exists "public_all_todos" on todos;
create policy "public_all_todos" on todos for all using (true) with check (true);

drop policy if exists "public_all_execution_records" on execution_records;
create policy "public_all_execution_records" on execution_records for all using (true) with check (true);

drop policy if exists "public_all_retrospectives" on retrospectives;
create policy "public_all_retrospectives" on retrospectives for all using (true) with check (true);
