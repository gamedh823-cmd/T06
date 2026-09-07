import Link from "next/link";
import { completeTodo, deleteTodo, uncompleteTodo } from "@/lib/actions";
import { formatDateKST, formatDateTimeKST, instantToKstLocal, isPastKST } from "@/lib/time";
import { BUTTON_PRIMARY_CLASS, INPUT_CLASS, LABEL_CLASS } from "@/lib/ui";
import { PRIORITY_CHIP, PRIORITY_LABEL } from "@/lib/types";
import { CalendarIcon, ClockIcon, TagIcon } from "@/components/icons";
import type { ExecutionRecord, Todo } from "@/lib/types";

interface Props {
  planId: string;
  todo: Todo;
  records: ExecutionRecord[];
}

export default function TodoRow({ planId, todo, records }: Props) {
  const overdue = todo.status === "active" && isPastKST(todo.due_date);
  const done = todo.status === "done";
  const now = new Date();
  const suggestedStart = new Date(now.getTime() - todo.estimated_minutes * 60000);

  return (
    <li className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-[10px] ${
              done ? "border-blue-600 bg-blue-600 text-white" : "border-neutral-300 text-transparent"
            }`}
          >
            ✓
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={done ? "text-neutral-400 line-through" : "font-medium text-neutral-900"}>
                {todo.title}
              </span>
              {overdue && (
                <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[11px] font-medium text-white">
                  지연
                </span>
              )}
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
              <span className="inline-flex items-center gap-1">
                <CalendarIcon className="text-neutral-400" />
                {formatDateKST(todo.due_date)}
              </span>
              <span className="inline-flex items-center gap-1">
                <ClockIcon className="text-neutral-400" />
                {todo.estimated_minutes}분
              </span>
              {todo.tag && (
                <span className="inline-flex items-center gap-1">
                  <TagIcon className="text-neutral-400" />
                  {todo.tag}
                </span>
              )}
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${PRIORITY_CHIP[todo.priority]}`}>
                {PRIORITY_LABEL[todo.priority]}
              </span>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <Link
            href={`/plans/${planId}/todos/${todo.id}/edit`}
            className="rounded-full px-2.5 py-1 text-xs text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
          >
            수정
          </Link>
          <form action={deleteTodo}>
            <input type="hidden" name="id" value={todo.id} />
            <input type="hidden" name="plan_id" value={planId} />
            <button
              type="submit"
              className="rounded-full px-2.5 py-1 text-xs text-neutral-500 hover:bg-rose-50 hover:text-rose-600"
            >
              삭제
            </button>
          </form>
        </div>
      </div>

      {todo.status === "active" ? (
        <details className="mt-3">
          <summary className="inline-block list-none cursor-pointer rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-200 [&::-webkit-details-marker]:hidden">
            완료 처리
          </summary>
          <form action={completeTodo} className="mt-3 space-y-3 rounded-xl bg-blue-50/60 p-4">
            <input type="hidden" name="id" value={todo.id} />
            <input type="hidden" name="plan_id" value={planId} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className={LABEL_CLASS}>시작 시각</label>
                <input
                  type="datetime-local"
                  name="started_at"
                  required
                  defaultValue={instantToKstLocal(suggestedStart.toISOString())}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>종료 시각</label>
                <input
                  type="datetime-local"
                  name="ended_at"
                  required
                  defaultValue={instantToKstLocal(now.toISOString())}
                  className={INPUT_CLASS}
                />
              </div>
            </div>
            <div>
              <label className={LABEL_CLASS}>막힌 이유 (있었다면)</label>
              <input
                name="blocked_reason"
                placeholder="예: 자료를 못 찾아서 30분 멈춤"
                className={INPUT_CLASS}
              />
            </div>
            <button type="submit" className={BUTTON_PRIMARY_CLASS}>
              완료로 저장
            </button>
          </form>
        </details>
      ) : (
        <div className="mt-3">
          <form action={uncompleteTodo}>
            <input type="hidden" name="id" value={todo.id} />
            <input type="hidden" name="plan_id" value={planId} />
            <button
              type="submit"
              className="rounded-full px-3 py-1 text-xs text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
            >
              ↺ 진행 중으로 되돌리기
            </button>
          </form>
        </div>
      )}

      {records.length > 0 && (
        <ul className="mt-3 space-y-1.5 border-t border-neutral-100 pt-3">
          {records.map((r) => (
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
  );
}
