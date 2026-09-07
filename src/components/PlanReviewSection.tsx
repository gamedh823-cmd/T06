import Link from "next/link";
import { addRetrospectiveNote } from "@/lib/actions";
import { getPlanStats, getRetrospectivesForPlan } from "@/lib/queries";
import { formatDateKST } from "@/lib/time";
import { BUTTON_SECONDARY_CLASS, CARD_CLASS, INPUT_CLASS } from "@/lib/ui";
import type { Plan } from "@/lib/types";

function Stat({
  label,
  value,
  href,
  accent,
}: {
  label: string;
  value: string | number;
  href: string;
  accent?: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-neutral-200 bg-neutral-50/60 px-3 py-3 text-center transition hover:border-blue-300 hover:bg-blue-50/60"
    >
      <div className={`text-xl font-semibold ${accent ?? "text-neutral-900"}`}>{value}</div>
      <div className="mt-0.5 text-xs text-neutral-500">{label}</div>
    </Link>
  );
}

export default async function PlanReviewSection({ plan }: { plan: Plan }) {
  const [stats, retros] = await Promise.all([
    getPlanStats(plan.id),
    getRetrospectivesForPlan(plan.id),
  ]);

  return (
    <section className={`${CARD_CLASS} space-y-4`}>
      <div className="flex items-center justify-between">
        <Link href={`/plans/${plan.id}`} className="font-medium text-neutral-900 hover:text-blue-700">
          {plan.title}
        </Link>
        <span className="text-xs text-neutral-400">
          {formatDateKST(plan.period_start)} ~ {formatDateKST(plan.period_end)}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        <Stat label="계획 수" value={stats.planCount} href={`/review/${plan.id}/total`} />
        <Stat label="완료 수" value={stats.completedCount} href={`/review/${plan.id}/completed`} accent="text-emerald-600" />
        <Stat label="지연 수" value={stats.delayedCount} href={`/review/${plan.id}/delayed`} accent="text-rose-600" />
        <Stat label="막힌 수" value={stats.blockedCount} href={`/review/${plan.id}/blocked`} accent="text-amber-600" />
        <Stat
          label="예상/실제(분)"
          value={`${stats.estimatedTotal}/${stats.actualTotal}`}
          href={`/review/${plan.id}/time`}
        />
        <Stat
          label="차이(분)"
          value={stats.diffTotal > 0 ? `+${stats.diffTotal}` : stats.diffTotal}
          href={`/review/${plan.id}/time`}
          accent={stats.diffTotal > 0 ? "text-rose-600" : "text-blue-600"}
        />
      </div>

      {retros.length > 0 && (
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
      )}

      <form action={addRetrospectiveNote} className="flex gap-2">
        <input type="hidden" name="plan_id" value={plan.id} />
        <input
          name="improvement_note"
          required
          placeholder="다음 계획으로 넘길 고칠 점 한 줄"
          className={`${INPUT_CLASS} mt-0 flex-1`}
        />
        <button type="submit" className={BUTTON_SECONDARY_CLASS}>
          기록
        </button>
      </form>
    </section>
  );
}
