import { redirect } from "next/navigation";
import DeleteAccountButton from "@/components/DeleteAccountButton";
import { createClient } from "@/lib/supabase/server";
import { CARD_CLASS } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight">계정</h1>

      <div className={`${CARD_CLASS} space-y-1`}>
        <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">로그인 아이디</div>
        <div className="text-sm text-neutral-900">
          {(user.user_metadata as { username?: string } | undefined)?.username ?? "(알 수 없음)"}
        </div>
      </div>

      <div className={`${CARD_CLASS} space-y-3 border-rose-200`}>
        <div>
          <div className="text-sm font-medium text-neutral-900">계정 삭제</div>
          <p className="mt-1 text-sm text-neutral-500">
            계정을 삭제하면 이 계정으로 만든 계획·할 일·완료 기록·돌아보기가 모두 함께 삭제됩니다. 되돌릴 수
            없습니다.
          </p>
        </div>
        <DeleteAccountButton />
      </div>
    </div>
  );
}
