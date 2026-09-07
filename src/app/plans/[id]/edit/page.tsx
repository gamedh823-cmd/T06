import { notFound } from "next/navigation";
import PlanForm from "@/components/PlanForm";
import { updatePlan } from "@/lib/actions";
import { getPlan } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function EditPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const plan = await getPlan(id);
  if (!plan) notFound();

  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight">계획 수정</h1>
      <p className="text-sm text-neutral-500">
        저장하면 지금 값은 수정 이력으로 남고, 계획 상세 화면에서 언제든 고치기 전 내용을 볼 수 있습니다.
      </p>
      <PlanForm action={updatePlan} defaultValues={plan} submitLabel="수정 저장" />
    </div>
  );
}
