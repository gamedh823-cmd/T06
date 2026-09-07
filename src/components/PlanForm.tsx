import { BUTTON_PRIMARY_CLASS, CARD_CLASS, INPUT_CLASS, LABEL_CLASS } from "@/lib/ui";
import type { Plan, Retrospective } from "@/lib/types";

interface Props {
  action: (formData: FormData) => void;
  defaultValues?: Plan;
  pendingRetros?: (Retrospective & { plan_title: string })[];
  submitLabel: string;
}

export default function PlanForm({ action, defaultValues, pendingRetros, submitLabel }: Props) {
  return (
    <form action={action} className={`${CARD_CLASS} space-y-5`}>
      {defaultValues && <input type="hidden" name="id" value={defaultValues.id} />}

      <div>
        <label className={LABEL_CLASS}>계획 제목</label>
        <input
          name="title"
          required
          defaultValue={defaultValues?.title}
          placeholder="예: 정보처리기사 필기 준비"
          className={`${INPUT_CLASS} text-base font-medium`}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL_CLASS}>시작일</label>
          <input
            type="date"
            name="period_start"
            required
            defaultValue={defaultValues?.period_start}
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label className={LABEL_CLASS}>종료일</label>
          <input
            type="date"
            name="period_end"
            required
            defaultValue={defaultValues?.period_end}
            className={INPUT_CLASS}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL_CLASS}>우선순위</label>
          <select
            name="priority"
            defaultValue={defaultValues?.priority ?? "medium"}
            className={INPUT_CLASS}
          >
            <option value="high">높음</option>
            <option value="medium">보통</option>
            <option value="low">낮음</option>
          </select>
        </div>
        <div>
          <label className={LABEL_CLASS}>예상 소요 시간(분)</label>
          <input
            type="number"
            name="estimated_minutes"
            min={0}
            required
            defaultValue={defaultValues?.estimated_minutes}
            className={INPUT_CLASS}
          />
        </div>
      </div>

      <div>
        <label className={LABEL_CLASS}>성공 기준</label>
        <textarea
          name="success_criteria"
          required
          rows={3}
          defaultValue={defaultValues?.success_criteria}
          placeholder="예: 기출문제 5회분을 70점 이상으로 통과한다"
          className={INPUT_CLASS}
        />
      </div>

      {pendingRetros && pendingRetros.length > 0 && (
        <div className="rounded-lg bg-blue-50/60 p-3">
          <label className={LABEL_CLASS}>이전 돌아보기에서 넘어온 고칠 점 (선택)</label>
          <select name="carry_over_retro_id" defaultValue="" className={INPUT_CLASS}>
            <option value="">가져오지 않음</option>
            {pendingRetros.map((r) => (
              <option key={r.id} value={r.id}>
                [{r.plan_title}] {r.improvement_note}
              </option>
            ))}
          </select>
        </div>
      )}

      <button type="submit" className={BUTTON_PRIMARY_CLASS}>
        {submitLabel}
      </button>
    </form>
  );
}
