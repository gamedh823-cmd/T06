export type Priority = "high" | "medium" | "low";
export type TodoStatus = "active" | "done";

export interface Plan {
  id: string;
  title: string;
  period_start: string;
  period_end: string;
  priority: Priority;
  success_criteria: string;
  estimated_minutes: number;
  carried_over_note: string | null;
  carried_over_from_retro_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlanRevision {
  id: string;
  plan_id: string;
  title: string;
  period_start: string;
  period_end: string;
  priority: Priority;
  success_criteria: string;
  estimated_minutes: number;
  edited_at: string;
}

export interface Todo {
  id: string;
  plan_id: string;
  title: string;
  due_date: string;
  priority: Priority;
  tag: string;
  estimated_minutes: number;
  status: TodoStatus;
  completed_at: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExecutionRecord {
  id: string;
  todo_id: string;
  started_at: string;
  ended_at: string;
  actual_minutes: number;
  blocked_reason: string | null;
  created_at: string;
}

export interface Retrospective {
  id: string;
  plan_id: string;
  improvement_note: string;
  created_at: string;
  carried_over_to_plan_id: string | null;
}

export const PRIORITY_LABEL: Record<Priority, string> = {
  high: "높음",
  medium: "보통",
  low: "낮음",
};

export const PRIORITY_CHIP: Record<Priority, string> = {
  high: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200",
  medium: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  low: "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200",
};
