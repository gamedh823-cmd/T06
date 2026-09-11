import { createClient } from "@/lib/supabase/server";
import { todayKST } from "@/lib/time";
import type { ExecutionRecord, Plan, PlanRevision, Retrospective, Todo } from "@/lib/types";

export async function getPlans(): Promise<Plan[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export interface OverallStats {
  planCount: number;
  todoCount: number;
  doneCount: number;
}

export async function getOverallStats(): Promise<OverallStats> {
  const supabase = await createClient();
  const [plans, todos, done] = await Promise.all([
    supabase.from("plans").select("*", { count: "exact", head: true }),
    supabase.from("todos").select("*", { count: "exact", head: true }).is("deleted_at", null),
    supabase
      .from("todos")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null)
      .eq("status", "done"),
  ]);
  return {
    planCount: plans.count ?? 0,
    todoCount: todos.count ?? 0,
    doneCount: done.count ?? 0,
  };
}

export async function getPlan(id: string): Promise<Plan | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("plans").select("*").eq("id", id).maybeSingle();
  return data ?? null;
}

export async function getPlanRevisions(planId: string): Promise<PlanRevision[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("plan_revisions")
    .select("*")
    .eq("plan_id", planId)
    .order("edited_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export interface TodoFilters {
  search?: string;
  status?: "active" | "done" | "all";
  priority?: "high" | "medium" | "low" | "all";
  tag?: string;
  sort?: "due_date" | "priority" | "estimated_minutes" | "created_at";
}

const PRIORITY_RANK: Record<string, number> = { high: 0, medium: 1, low: 2 };

// Ties are broken by id so the order is identical on every reload — without
// this, two todos with the same due_date/priority/etc. can swap places
// between requests because Postgres makes no ordering promise when no
// column fully determines it (T06-C20 troubleshooting: "정렬 결과가 볼 때마다
// 달라집니다").
function sortTodos<T extends { id: string; priority: string; estimated_minutes: number; created_at: string; due_date: string }>(
  todos: T[],
  sort: TodoFilters["sort"]
): T[] {
  return [...todos].sort((a, b) => {
    let cmp = 0;
    if (sort === "priority") cmp = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    else if (sort === "estimated_minutes") cmp = a.estimated_minutes - b.estimated_minutes;
    else if (sort === "created_at") cmp = a.created_at.localeCompare(b.created_at);
    else cmp = a.due_date.localeCompare(b.due_date);
    return cmp !== 0 ? cmp : a.id.localeCompare(b.id);
  });
}

function matchesSearch(todo: { title: string; tag: string }, search: string): boolean {
  const q = search.toLowerCase();
  return todo.title.toLowerCase().includes(q) || todo.tag.toLowerCase().includes(q);
}

export async function getTodos(planId: string, filters: TodoFilters): Promise<Todo[]> {
  const supabase = await createClient();
  let query = supabase.from("todos").select("*").eq("plan_id", planId).is("deleted_at", null);

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  if (filters.priority && filters.priority !== "all") {
    query = query.eq("priority", filters.priority);
  }
  if (filters.tag) {
    query = query.eq("tag", filters.tag);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  let todos = data ?? [];
  if (filters.search) todos = todos.filter((t) => matchesSearch(t, filters.search!));

  return sortTodos(todos, filters.sort ?? "due_date");
}

export async function getTodosWithRecords(
  planId: string,
  filters: TodoFilters
): Promise<TodoWithRecords[]> {
  const supabase = await createClient();
  let query = supabase
    .from("todos")
    .select("*, execution_records(*)")
    .eq("plan_id", planId)
    .is("deleted_at", null);

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  if (filters.priority && filters.priority !== "all") {
    query = query.eq("priority", filters.priority);
  }
  if (filters.tag) {
    query = query.eq("tag", filters.tag);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  let todos = (data ?? []) as TodoWithRecords[];
  if (filters.search) todos = todos.filter((t) => matchesSearch(t, filters.search!));

  return sortTodos(todos, filters.sort ?? "due_date");
}

export async function getTodo(id: string): Promise<Todo | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("todos").select("*").eq("id", id).maybeSingle();
  return data ?? null;
}

export async function getDistinctTags(planId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("todos")
    .select("tag")
    .eq("plan_id", planId)
    .is("deleted_at", null);
  const tags = new Set((data ?? []).map((r) => r.tag).filter((t): t is string => !!t));
  return [...tags].sort();
}

export async function getExecutionRecordsForTodo(todoId: string): Promise<ExecutionRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("execution_records")
    .select("*")
    .eq("todo_id", todoId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export type TodoWithRecords = Todo & { execution_records: ExecutionRecord[] };

export interface PlanStats {
  planCount: number;
  completedCount: number;
  delayedCount: number;
  blockedCount: number;
  estimatedTotal: number;
  actualTotal: number;
  diffTotal: number;
  todos: TodoWithRecords[];
}

export async function getPlanStats(planId: string): Promise<PlanStats> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("todos")
    .select("*, execution_records(*)")
    .eq("plan_id", planId)
    .is("deleted_at", null);
  if (error) throw new Error(error.message);

  const todos = (data ?? []) as TodoWithRecords[];
  const today = todayKST();

  const planCount = todos.length;
  const completedCount = todos.filter((t) => t.status === "done").length;
  const delayedCount = todos.filter((t) => t.status === "active" && t.due_date < today).length;
  const blockedCount = todos.filter((t) =>
    t.execution_records.some((r) => r.blocked_reason && r.blocked_reason.trim().length > 0)
  ).length;
  const estimatedTotal = todos.reduce((sum, t) => sum + t.estimated_minutes, 0);
  const actualTotal = todos.reduce(
    (sum, t) => sum + t.execution_records.reduce((s, r) => s + r.actual_minutes, 0),
    0
  );

  return {
    planCount,
    completedCount,
    delayedCount,
    blockedCount,
    estimatedTotal,
    actualTotal,
    diffTotal: actualTotal - estimatedTotal,
    todos,
  };
}

export async function getPendingRetrospectives(): Promise<(Retrospective & { plan_title: string })[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("retrospectives")
    .select("*, plans!retrospectives_plan_id_fkey(title)")
    .is("carried_over_to_plan_id", null)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({ ...r, plan_title: (r as { plans?: { title?: string } }).plans?.title ?? "" }));
}

export async function getRetrospectivesForPlan(planId: string): Promise<Retrospective[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("retrospectives")
    .select("*")
    .eq("plan_id", planId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}
