import Link from "next/link";
import Hero from "@/components/Hero";
import { CalendarIcon, ClockIcon } from "@/components/icons";
import { getPlans } from "@/lib/queries";
import { PRIORITY_CHIP, PRIORITY_LABEL } from "@/lib/types";
import { formatDateKST } from "@/lib/time";

export const dynamic = "force-dynamic";

const ACCENT_BAR: Record<string, string> = {
  high: "before:bg-rose-400",
  medium: "before:bg-amber-400",
  low: "before:bg-sky-400",
};

export default async function HomePage() {
  const plans = await getPlans();

  return (
    <div className="space-y-8">
      <Hero />

      <div className="flex items-center justify-between">
        <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold tracking-tight">
          내 계획
        </h2>
        <Link
          href="/plans/new"
          className="rounded-full bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-green-700"
        >
          + 새 계획
        </Link>
      </div>

      {plans.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white/60 p-10 text-center text-sm text-neutral-500">
          아직 계획이 없습니다. 지금 실제로 하고 있는 일 하나를 골라 첫 계획을 만들어 보세요.
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {plans.map((plan) => (
            <li key={plan.id}>
              <Link
                href={`/plans/${plan.id}`}
                className={`group relative block overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition before:absolute before:inset-y-0 before:left-0 before:w-1.5 hover:-translate-y-0.5 hover:shadow-md ${ACCENT_BAR[plan.priority]}`}
              >
                <div className="flex items-center justify-between gap-3 pl-2">
                  <span className="font-medium text-neutral-900 group-hover:text-blue-700">
                    {plan.title}
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${PRIORITY_CHIP[plan.priority]}`}
                  >
                    {PRIORITY_LABEL[plan.priority]}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3 pl-2 text-xs text-neutral-500">
                  <span className="inline-flex items-center gap-1">
                    <CalendarIcon className="text-neutral-400" />
                    {formatDateKST(plan.period_start)} ~ {formatDateKST(plan.period_end)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <ClockIcon className="text-neutral-400" />
                    {plan.estimated_minutes}분
                  </span>
                </div>
                <div className="mt-3 line-clamp-1 pl-2 text-sm text-neutral-600">
                  성공 기준 · {plan.success_criteria}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
