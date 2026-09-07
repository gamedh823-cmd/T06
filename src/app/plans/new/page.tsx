import PlanForm from "@/components/PlanForm";
import { createPlan } from "@/lib/actions";
import { getPendingRetrospectives } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function NewPlanPage() {
  const pendingRetros = await getPendingRetrospectives();

  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight">새 계획 만들기</h1>
      <p className="text-sm text-neutral-500">
        남의 예시가 아니라, 지금 실제로 하고 있는 일 하나를 골라 계획을 세워 보세요.
      </p>
      <PlanForm action={createPlan} pendingRetros={pendingRetros} submitLabel="계획 만들기" />
    </div>
  );
}
