import Link from "next/link";
import { signup } from "@/lib/auth-actions";
import { BUTTON_PRIMARY_CLASS, CARD_CLASS, INPUT_CLASS, LABEL_CLASS } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-sm space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight">회원가입</h1>
        <p className="mt-1 text-sm text-neutral-500">
          이메일 없이 아이디·비밀번호만으로 가입합니다. 가입하면 지금부터 만드는 계획·할 일은 이 계정으로만
          보입니다.
        </p>
      </div>

      {error && <p className="rounded-lg bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">{error}</p>}

      <form action={signup} className={`${CARD_CLASS} space-y-4`}>
        <div>
          <label className={LABEL_CLASS}>아이디 (영문·숫자·밑줄 3~20자)</label>
          <input
            type="text"
            name="username"
            required
            pattern="[a-zA-Z0-9_]{3,20}"
            autoComplete="username"
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label className={LABEL_CLASS}>비밀번호 (8자 이상)</label>
          <input
            type="password"
            name="password"
            required
            minLength={8}
            autoComplete="new-password"
            className={INPUT_CLASS}
          />
        </div>
        <button type="submit" className={`${BUTTON_PRIMARY_CLASS} w-full`}>
          가입하기
        </button>
      </form>

      <p className="text-center text-sm text-neutral-500">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="font-medium text-blue-700 hover:underline">
          로그인
        </Link>
      </p>
    </div>
  );
}
