"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { kstLocalToInstant, minutesBetween } from "@/lib/time";
import type { Priority } from "@/lib/types";

function str(formData: FormData, key: string): string {
  return (formData.get(key) ?? "").toString().trim();
}

function num(formData: FormData, key: string): number {
  const v = Number(formData.get(key));
  return Number.isFinite(v) && v >= 0 ? v : 0;
}

export async function createPlan(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요합니다.");

  const title = str(formData, "title");
  const period_start = str(formData, "period_start");
  const period_end = str(formData, "period_end");
  const priority = str(formData, "priority") as Priority;
  const success_criteria = str(formData, "success_criteria");
  const estimated_minutes = num(formData, "estimated_minutes");
  const carryOverRetroId = str(formData, "carry_over_retro_id");

  if (!title || !period_start || !period_end || !success_criteria) {
    throw new Error("모든 필수 항목을 입력해 주세요.");
  }

  let carried_over_note: string | null = null;
  if (carryOverRetroId) {
    const { data: retro } = await supabase
      .from("retrospectives")
      .select("improvement_note")
      .eq("id", carryOverRetroId)
      .single();
    carried_over_note = retro?.improvement_note ?? null;
  }

  // user_id is what plans_owner_all (supabase/schema.sql) checks against
  // auth.uid() — every other table is scoped only by joining back to this
  // column, so this is the one place ownership actually gets assigned
  // (T07-C116).
  const { data: plan, error } = await supabase
    .from("plans")
    .insert({
      user_id: user.id,
      title,
      period_start,
      period_end,
      priority,
      success_criteria,
      estimated_minutes,
      carried_over_note,
      carried_over_from_retro_id: carryOverRetroId || null,
    })
    .select()
    .single();

  if (error || !plan) throw new Error(error?.message ?? "계획 생성에 실패했습니다.");

  if (carryOverRetroId) {
    await supabase
      .from("retrospectives")
      .update({ carried_over_to_plan_id: plan.id })
      .eq("id", carryOverRetroId);
  }

  revalidatePath("/");
  redirect(`/plans/${plan.id}`);
}

export async function updatePlan(formData: FormData) {
  const supabase = await createClient();
  const id = str(formData, "id");
  const title = str(formData, "title");
  const period_start = str(formData, "period_start");
  const period_end = str(formData, "period_end");
  const priority = str(formData, "priority") as Priority;
  const success_criteria = str(formData, "success_criteria");
  const estimated_minutes = num(formData, "estimated_minutes");

  const { data: current, error: fetchError } = await supabase
    .from("plans")
    .select("*")
    .eq("id", id)
    .single();
  if (fetchError || !current) throw new Error("원본 계획을 찾을 수 없습니다.");

  // Snapshot the pre-edit values before overwriting, so the original plan
  // is never lost (T06-C08).
  const { error: revisionError } = await supabase.from("plan_revisions").insert({
    plan_id: current.id,
    title: current.title,
    period_start: current.period_start,
    period_end: current.period_end,
    priority: current.priority,
    success_criteria: current.success_criteria,
    estimated_minutes: current.estimated_minutes,
  });
  if (revisionError) throw new Error(revisionError.message);

  const { error: updateError } = await supabase
    .from("plans")
    .update({
      title,
      period_start,
      period_end,
      priority,
      success_criteria,
      estimated_minutes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (updateError) throw new Error(updateError.message);

  revalidatePath(`/plans/${id}`);
  revalidatePath("/");
  redirect(`/plans/${id}`);
}

export async function createTodo(formData: FormData) {
  const supabase = await createClient();
  const plan_id = str(formData, "plan_id");
  const title = str(formData, "title");
  const due_date = str(formData, "due_date");
  const priority = str(formData, "priority") as Priority;
  const tag = str(formData, "tag");
  const estimated_minutes = num(formData, "estimated_minutes");

  if (!plan_id || !title || !due_date) {
    throw new Error("할 일의 제목과 마감일은 필수입니다.");
  }

  const { error } = await supabase.from("todos").insert({
    plan_id,
    title,
    due_date,
    priority,
    tag,
    estimated_minutes,
  });
  if (error) throw new Error(error.message);

  revalidatePath(`/plans/${plan_id}`);
}

export async function updateTodo(formData: FormData) {
  const supabase = await createClient();
  const id = str(formData, "id");
  const plan_id = str(formData, "plan_id");
  const title = str(formData, "title");
  const due_date = str(formData, "due_date");
  const priority = str(formData, "priority") as Priority;
  const tag = str(formData, "tag");
  const estimated_minutes = num(formData, "estimated_minutes");

  // RLS (todos_owner_all in supabase/schema.sql) hides rows that don't
  // belong to a plan owned by auth.uid(), so a cross-account UPDATE matches
  // zero rows instead of erroring — .select().maybeSingle() is what turns
  // that silent zero-row match into a visible rejection here (T07-C118).
  const { data: updated, error } = await supabase
    .from("todos")
    .update({
      title,
      due_date,
      priority,
      tag,
      estimated_minutes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!updated) throw new Error("수정할 수 없습니다. 존재하지 않거나 내 할 일이 아닙니다.");

  revalidatePath(`/plans/${plan_id}`);
  redirect(`/plans/${plan_id}`);
}

export async function deleteTodo(formData: FormData) {
  const supabase = await createClient();
  const id = str(formData, "id");
  const plan_id = str(formData, "plan_id");

  const { data: deleted, error } = await supabase
    .from("todos")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!deleted) throw new Error("지울 수 없습니다. 존재하지 않거나 내 할 일이 아닙니다.");

  revalidatePath(`/plans/${plan_id}`);
}

// Marking a todo complete and logging how it actually went is one action.
// The status flip is a conditional UPDATE (`WHERE status = 'active'`), so a
// second rapid click updates zero rows and skips the insert below — this is
// what keeps double-clicking "완료" idempotent (T06-C21/C22/C27).
export async function completeTodo(formData: FormData) {
  const supabase = await createClient();
  const id = str(formData, "id");
  const plan_id = str(formData, "plan_id");
  const startedLocal = str(formData, "started_at");
  const endedLocal = str(formData, "ended_at");
  const blocked_reason = str(formData, "blocked_reason");

  if (!startedLocal || !endedLocal) {
    throw new Error("시작 시각과 종료 시각을 입력해 주세요.");
  }

  const started_at = kstLocalToInstant(startedLocal);
  const ended_at = kstLocalToInstant(endedLocal);

  const { data: updated, error: updateError } = await supabase
    .from("todos")
    .update({ status: "done", completed_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "active")
    .select()
    .maybeSingle();
  if (updateError) throw new Error(updateError.message);

  if (updated) {
    const { error: recordError } = await supabase.from("execution_records").insert({
      todo_id: id,
      started_at,
      ended_at,
      actual_minutes: minutesBetween(started_at, ended_at),
      blocked_reason: blocked_reason || null,
    });
    if (recordError) throw new Error(recordError.message);
  }

  revalidatePath(`/plans/${plan_id}`);
  revalidatePath("/review");
}

export async function uncompleteTodo(formData: FormData) {
  const supabase = await createClient();
  const id = str(formData, "id");
  const plan_id = str(formData, "plan_id");

  await supabase
    .from("todos")
    .update({ status: "active", completed_at: null })
    .eq("id", id)
    .eq("status", "done");

  revalidatePath(`/plans/${plan_id}`);
  revalidatePath("/review");
}

export async function addRetrospectiveNote(formData: FormData) {
  const supabase = await createClient();
  const plan_id = str(formData, "plan_id");
  const improvement_note = str(formData, "improvement_note");
  if (!improvement_note) throw new Error("고칠 점을 입력해 주세요.");

  const { error } = await supabase.from("retrospectives").insert({
    plan_id,
    improvement_note,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/review");
}
