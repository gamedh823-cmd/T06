-- T07: give every plan an owner, then lock every table down to its owner
-- via RLS. Supabase Auth (auth.users) is already provisioned by the
-- project — nothing to create there, only rules to add.
--
-- Run this in the Supabase Dashboard (SQL Editor) in two passes, because
-- the T06-era rows in this project have no owner yet and need one assigned
-- before user_id can be required:
--
--   PASS 1 — run down to "-- STOP HERE, then sign up" now. This adds
--   user_id (nullable for now) without touching the existing fully-open
--   policies, so the live app keeps working exactly as it does today.
--
--   PASS 2 — sign up your own account through /signup in the app first.
--   Then find its id (Authentication > Users in the dashboard, or run
--   `select id, email from auth.users;`), paste it in place of
--   '00000000-0000-0000-0000-000000000000' below, and run the rest. This
--   assigns the existing T06 plans/todos to that account (so the final T06
--   data is exactly what T07 continues from — T07-C77) and switches every
--   policy from "anyone" to "owner only".

alter table plans add column if not exists user_id uuid references auth.users(id) on delete cascade;
create index if not exists idx_plans_user_id on plans(user_id);

-- STOP HERE, then sign up.

update plans set user_id = '00000000-0000-0000-0000-000000000000' where user_id is null;
alter table plans alter column user_id set not null;

drop policy if exists "public_all_plans" on plans;
create policy "plans_owner_all" on plans for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Every table below has no user_id of its own — ownership is always
-- resolved by walking back up to plans.user_id, so there is exactly one
-- place (above) that decides who owns what.

drop policy if exists "public_all_plan_revisions" on plan_revisions;
create policy "plan_revisions_owner_all" on plan_revisions for all
  using (exists (select 1 from plans p where p.id = plan_revisions.plan_id and p.user_id = auth.uid()))
  with check (exists (select 1 from plans p where p.id = plan_revisions.plan_id and p.user_id = auth.uid()));

drop policy if exists "public_all_todos" on todos;
create policy "todos_owner_all" on todos for all
  using (exists (select 1 from plans p where p.id = todos.plan_id and p.user_id = auth.uid()))
  with check (exists (select 1 from plans p where p.id = todos.plan_id and p.user_id = auth.uid()));

drop policy if exists "public_all_execution_records" on execution_records;
create policy "execution_records_owner_all" on execution_records for all
  using (exists (
    select 1 from todos t join plans p on p.id = t.plan_id
    where t.id = execution_records.todo_id and p.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from todos t join plans p on p.id = t.plan_id
    where t.id = execution_records.todo_id and p.user_id = auth.uid()
  ));

drop policy if exists "public_all_retrospectives" on retrospectives;
create policy "retrospectives_owner_all" on retrospectives for all
  using (exists (select 1 from plans p where p.id = retrospectives.plan_id and p.user_id = auth.uid()))
  with check (exists (select 1 from plans p where p.id = retrospectives.plan_id and p.user_id = auth.uid()));
