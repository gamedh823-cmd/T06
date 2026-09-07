import { getOverallStats } from "@/lib/queries";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1743878206228-5f36b5f5c830?auto=format&fit=crop&w=1600&q=80";

export default async function Hero() {
  const stats = await getOverallStats();

  return (
    <div
      className="relative flex min-h-[260px] flex-col justify-end overflow-hidden rounded-3xl bg-neutral-900 bg-cover shadow-lg sm:min-h-[300px]"
      style={{ backgroundImage: `url('${HERO_IMAGE}')`, backgroundPosition: "center 40%" }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/0" />

      <div className="relative p-8 text-white sm:p-10">
        <p className="text-xs font-semibold tracking-[0.2em] text-blue-100">PLAN · DO · SEE</p>
        <h1 className="mt-2 font-[family-name:var(--font-heading)] text-3xl font-bold tracking-tight sm:text-4xl">
          플랜두씨 다이어리
        </h1>
        <p className="mt-2 max-w-md text-sm text-blue-50">
          계획을 세우고, 실제로 한 일을 남기고, 돌아보며 다음 계획을 고칩니다.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <div className="rounded-2xl bg-white/15 px-4 py-2.5 backdrop-blur-md ring-1 ring-white/25">
            <div className="text-lg font-semibold">{stats.planCount}</div>
            <div className="text-xs text-blue-50">계획</div>
          </div>
          <div className="rounded-2xl bg-white/15 px-4 py-2.5 backdrop-blur-md ring-1 ring-white/25">
            <div className="text-lg font-semibold">{stats.todoCount}</div>
            <div className="text-xs text-blue-50">할 일</div>
          </div>
          <div className="rounded-2xl bg-white/15 px-4 py-2.5 backdrop-blur-md ring-1 ring-white/25">
            <div className="text-lg font-semibold">{stats.doneCount}</div>
            <div className="text-xs text-blue-50">완료</div>
          </div>
        </div>
      </div>
    </div>
  );
}
