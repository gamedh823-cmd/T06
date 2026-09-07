import { BUTTON_PRIMARY_CLASS, CARD_CLASS, INPUT_CLASS, LABEL_CLASS } from "@/lib/ui";
import type { Todo } from "@/lib/types";

interface Props {
  action: (formData: FormData) => void;
  planId: string;
  defaultValues?: Todo;
  submitLabel: string;
}

export default function TodoForm({ action, planId, defaultValues, submitLabel }: Props) {
  return (
    <form action={action} className={`${CARD_CLASS} space-y-4`}>
      <input type="hidden" name="plan_id" value={planId} />
      {defaultValues && <input type="hidden" name="id" value={defaultValues.id} />}

      <div>
        <label className={LABEL_CLASS}>할 일</label>
        <input
          name="title"
          required
          defaultValue={defaultValues?.title}
          placeholder="예: 기출문제 1회분 풀기"
          className={INPUT_CLASS}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <label className={LABEL_CLASS}>마감일</label>
          <input
            type="date"
            name="due_date"
            required
            defaultValue={defaultValues?.due_date}
            className={INPUT_CLASS}
          />
        </div>
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
          <label className={LABEL_CLASS}>태그</label>
          <input
            name="tag"
            defaultValue={defaultValues?.tag}
            placeholder="예: 필기"
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label className={LABEL_CLASS}>예상 시간(분)</label>
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

      <button type="submit" className={BUTTON_PRIMARY_CLASS}>
        {submitLabel}
      </button>
    </form>
  );
}
