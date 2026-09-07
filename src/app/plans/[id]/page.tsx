import Link from "next/link";
import { notFound } from "next/navigation";
import TodoForm from "@/components/TodoForm";
import TodoRow from "@/components/TodoRow";
import { createTodo } from "@/lib/actions";
import {
  getDistinctTags,
  getPlan,
  getPlanRevisions,
  getRetrospectivesForPlan,
  getTodosWithRecords,
  type TodoFilters,
} from "@/lib/queries";
import { formatDateKST, formatDateTimeKST } from "@/lib/time";
import { BUTTON_SECONDARY_CLASS, CARD_CLASS, INPUT_CLASS } from "@/lib/ui";
import { CalendarIcon, ClockIcon, FilterIcon, PlusIcon } from "@/components/icons";
import { PRIORITY_CHIP, PRIORITY_LABEL } from "@/lib/types";

const SORT_LABEL: Record<string, string> = {
  due_date: "마감일 빠른 순",
  priority: "우선순위 높은 순",
  estimated_minutes: "예상 시간 짧은 순",
  created_at: "만든 순서",
};

export const dynamic = "force-dynamic";

export default async function PlanDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;

  const plan = await getPlan(id);
  if (!plan) notFound();

  const filters: TodoFilters = {
    search: sp.search,
    status: (sp.status as TodoFilters["status"]) ?? "all",
    priority: (sp.priority as TodoFilters["priority"]) ?? "all",
    tag: sp.tag,
    sort: (sp.sort as TodoFilters["sort"]) ?? "due_date",
  };
  const filterIsActive = Boolean(
    sp.search || (filters.status && filters.status !== "all") || (filters.priority && filters.priority !== "all") || sp.tag
  );

  const [todos, tags, revisions, retros] = await Promise.all([
    getTodosWithRecords(id, filters),
    getDistinctTags(id),
    getPlanRevisions(id),
    getRetrospectivesForPlan(id),
  ]);

  return (
    <div className="space-y-8">
      <div className={CARD_CLASS}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-[family-name:var(--font-heading)] text-xl font-bold tracking-tight text-neutral-900">{plan.title}</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-neutral-500">
              <span className="inline-flex items-center gap-1">
                <CalendarIcon className="text-neutral-400" />
                {formatDateKST(plan.period_start)} ~ {formatDateKST(plan.period_end)}
              </span>
              <span className="inline-flex items-center gap-1">
                <ClockIcon className="text-neutral-400" />
                예상 {plan.estimated_minutes}분
              </span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_CHIP[plan.priority]}`}>
                {PRIORITY_LABEL[plan.priority]}
              </span>
            </div>
          </div>
          <Link href={`/plans/${plan.id}/edit`} className={`${BUTTON_SECONDARY_CLASS} shrink-0`}>
            계획 수정
          </Link>
        </div>

        <p className="mt-4 rounded-xl bg-neutral-50 p-3.5 text-sm text-neutral-700">
          <span className="mr-1.5 font-semibold text-neutral-400">성공 기준</span>
          {plan.success_criteria}
        </p>

        {plan.carried_over_note && (
          <p className="mt-3 rounded-xl bg-blue-50 px-3.5 py-2.5 text-sm text-blue-800">
            <span className="mr-1.5 font-semibold">이전 고칠 점</span>
            {plan.carried_over_note}
          </p>
        )}

        {revisions.length > 0 && (
          <details className="mt-4">
            <summary className="cursor-pointer text-xs text-neutral-400 hover:text-neutral-700">
              수정 이력 {revisions.length}건 — 고치기 전 계획 보기
            </summary>
            <ul className="mt-2 space-y-2">
              {revisions.map((rev) => (
                <li key={rev.id} className="rounded-lg bg-neutral-50 p-3 text-xs text-neutral-600">
                  <div className="text-neutral-400">{formatDateTimeKST(rev.edited_at)} 수정 전</div>
                  <div className="mt-1 font-medium text-neutral-800">{rev.title}</div>
                  <div>
                    {formatDateKST(rev.period_start)} ~ {formatDateKST(rev.period_end)} · 우선순위{" "}
                    {PRIORITY_LABEL[rev.priority]} · 예상 {rev.estimated_minutes}분
                  </div>
                  <div>성공 기준: {rev.success_criteria}</div>
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold tracking-tight">
            할 일 <span className="text-neutral-400">{todos.length}</span>
          </h2>
          <span className="text-xs text-neutral-400">정렬 · {SORT_LABEL[filters.sort ?? "due_date"]}</span>
        </div>

        <details>
          <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 rounded-full bg-green-600 px-3.5 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-green-700 [&::-webkit-details-marker]:hidden">
            <PlusIcon /> 할 일 추가
          </summary>
          <div className="mt-3">
            <TodoForm action={createTodo} planId={id} submitLabel="할 일 추가" />
          </div>
        </details>

        <details open={filterIsActive}>
          <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3.5 py-1.5 text-sm text-neutral-600 shadow-sm hover:bg-neutral-50 [&::-webkit-details-marker]:hidden">
            <FilterIcon /> 검색 · 필터 · 정렬
          </summary>
          <form className="mt-3 flex flex-wrap gap-2 rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm" method="get">
            <input
              type="text"
              name="search"
              defaultValue={sp.search}
              placeholder="제목·태그 검색"
              className={`${INPUT_CLASS} mt-0 w-40`}
            />
            <select name="status" defaultValue={filters.status} className={`${INPUT_CLASS} mt-0 w-auto`}>
              <option value="all">전체 상태</option>
              <option value="active">진행 중</option>
              <option value="done">완료</option>
            </select>
            <select name="priority" defaultValue={filters.priority} className={`${INPUT_CLASS} mt-0 w-auto`}>
              <option value="all">전체 우선순위</option>
              <option value="high">높음</option>
              <option value="medium">보통</option>
              <option value="low">낮음</option>
            </select>
            <select name="tag" defaultValue={sp.tag ?? ""} className={`${INPUT_CLASS} mt-0 w-auto`}>
              <option value="">전체 태그</option>
              {tags.map((t) => (
                <option key={t} value={t}>
                  #{t}
                </option>
              ))}
            </select>
            <select name="sort" defaultValue={filters.sort} className={`${INPUT_CLASS} mt-0 w-auto`}>
              <option value="due_date">마감일 빠른 순</option>
              <option value="priority">우선순위 높은 순</option>
              <option value="estimated_minutes">예상 시간 짧은 순</option>
              <option value="created_at">만든 순서</option>
            </select>
            <button type="submit" className={BUTTON_SECONDARY_CLASS}>
              적용
            </button>
          </form>
        </details>

        {todos.length === 0 ? (
          <p className="text-sm text-neutral-400">조건에 맞는 할 일이 없습니다.</p>
        ) : (
          <ul className="space-y-3">
            {todos.map((todo) => (
              <TodoRow key={todo.id} planId={id} todo={todo} records={todo.execution_records} />
            ))}
          </ul>
        )}
      </section>

      {retros.length > 0 && (
        <section className="space-y-2 border-t border-neutral-200 pt-6">
          <h2 className="text-sm font-medium text-neutral-600">이 계획에 남긴 고칠 점</h2>
          <ul className="space-y-1 text-sm text-neutral-600">
            {retros.map((r) => (
              <li key={r.id}>
                · {r.improvement_note}{" "}
                {r.carried_over_to_plan_id && (
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600">
                    다음 계획으로 넘어감
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="border-t border-neutral-200 pt-4 text-sm">
        <Link href="/review" className="text-neutral-500 hover:text-blue-700">
          이 계획의 돌아보기 보기 →
        </Link>
      </div>
    </div>
  );
}
