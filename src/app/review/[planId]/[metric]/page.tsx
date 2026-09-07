import Link from "next/link";
import { notFound } from "next/navigation";
import { getPlan, getPlanStats } from "@/lib/queries";
import { formatDateKST, formatDateTimeKST, todayKST } from "@/lib/time";
import { PRIORITY_CHIP, PRIORITY_LABEL } from "@/lib/types";
import type { TodoWithRecords } from "@/lib/queries";

const METRIC_LABEL: Record<string, string> = {
  total: "계획에 딸린 전체 할 일",
  completed: "완료한 할 일",
  delayed: "지연된 할 일",
  blocked: "막힌 할 일",
  time: "예상 시간 대비 실제 시간",
};

function filterTodos(metric: string, todos: TodoWithRecords[]): TodoWithRecords[] {
  const today = todayKST();
  switch (metric) {
    case "completed":
      return todos.filter((t) => t.status === "done");
    case "delayed":
      return todos.filter((t) => t.status === "active" && t.due_date < today);
    case "blocked":
      return todos.filter((t) =>
        t.execution_records.some((r) => r.blocked_reason && r.blocked_reason.trim().length > 0)
      );
    case "total":
    case "time":
      return todos;
    default:
      return [];
  }
}

export const dynamic = "force-dynamic";

export default async function ReviewDrilldownPage({
  params,
}: {
  params: Promise<{ planId: string; metric: string }>;
}) {
  const { planId, metric } = await params;
  if (!METRIC_LABEL[metric]) notFound();

  const plan = await getPlan(planId);
  if (!plan) notFound();

  const stats = await getPlanStats(planId);
  const todos = filterTodos(metric, stats.todos);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/review" className="text-sm text-neutral-500 hover:text-blue-700">
          ← 돌아보기로
        </Link>
        <h1 className="mt-2 font-[family-name:var(--font-heading)] text-xl font-bold tracking-tight">
          {plan.title} · {METRIC_LABEL[metric]}
        </h1>
        <p className="mt-1 text-sm text-neutral-400">이 숫자를 만든 실제 기록입니다 ({todos.length}건)</p>
      </div>

      {todos.length === 0 ? (
        <p className="text-sm text-neutral-400">해당하는 할 일이 없습니다.</p>
      ) : (
        <ul className="space-y-3">
          {todos.map((todo) => (
            <li key={todo.id} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <Link
                  href={`/plans/${planId}/todos/${todo.id}/edit`}
                  className="font-medium text-neutral-900 hover:text-blue-700"
                >
                  {todo.title}
                </Link>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    todo.status === "done"
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"
                      : "bg-neutral-100 text-neutral-600"
                  }`}
                >
                  {todo.status === "done" ? "완료" : "진행 중"}
                </span>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-neutral-500">
                <span>마감 {formatDateKST(todo.due_date)}</span>
                <span className={`rounded-full px-2 py-0.5 font-medium ${PRIORITY_CHIP[todo.priority]}`}>
                  {PRIORITY_LABEL[todo.priority]}
                </span>
                <span>예상 {todo.estimated_minutes}분</span>
              </div>
              {todo.execution_records.length > 0 && (
                <ul className="mt-3 space-y-1.5 border-t border-neutral-100 pt-3">
                  {todo.execution_records.map((r) => (
                    <li key={r.id} className="border-l-2 border-neutral-200 pl-3 text-xs text-neutral-500">
                      {formatDateTimeKST(r.started_at)} ~ {formatDateTimeKST(r.ended_at)} · 실제{" "}
                      <span className="font-medium text-neutral-700">{r.actual_minutes}분</span>
                      {r.blocked_reason && (
                        <span className="text-rose-600"> · 막힘: {r.blocked_reason}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
