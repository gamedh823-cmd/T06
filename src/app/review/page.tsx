import PlanReviewSection from "@/components/PlanReviewSection";
import { getPlans } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const plans = await getPlans();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight">돌아보기</h1>
        <p className="mt-1 text-sm text-neutral-500">숫자를 누르면 그 숫자를 만든 기록으로 갑니다</p>
      </div>
      {plans.length === 0 ? (
        <p className="text-sm text-neutral-400">
          아직 계획이 없습니다. 계획을 만들고 할 일을 진행하면 여기에 집계가 나타납니다.
        </p>
      ) : (
        <div className="space-y-4">
          {plans.map((plan) => (
            <PlanReviewSection key={plan.id} plan={plan} />
          ))}
        </div>
      )}
    </div>
  );
}
