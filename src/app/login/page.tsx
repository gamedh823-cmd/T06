import Link from "next/link";
import { login } from "@/lib/auth-actions";
import { BUTTON_PRIMARY_CLASS, CARD_CLASS, INPUT_CLASS, LABEL_CLASS } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <div className="mx-auto max-w-sm space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight">로그인</h1>
        <p className="mt-1 text-sm text-neutral-500">가입한 아이디와 비밀번호로 로그인하세요.</p>
      </div>

      {message && (
        <p className="rounded-lg bg-blue-50 px-3.5 py-2.5 text-sm text-blue-800">{message}</p>
      )}
      {error && <p className="rounded-lg bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">{error}</p>}

      <form action={login} className={`${CARD_CLASS} space-y-4`}>
        <div>
          <label className={LABEL_CLASS}>아이디</label>
          <input type="text" name="username" required autoComplete="username" className={INPUT_CLASS} />
        </div>
        <div>
          <label className={LABEL_CLASS}>비밀번호</label>
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            className={INPUT_CLASS}
          />
        </div>
        <button type="submit" className={`${BUTTON_PRIMARY_CLASS} w-full`}>
          로그인
        </button>
      </form>

      <p className="text-center text-sm text-neutral-500">
        계정이 없으신가요?{" "}
        <Link href="/signup" className="font-medium text-blue-700 hover:underline">
          회원가입
        </Link>
      </p>
    </div>
  );
}
