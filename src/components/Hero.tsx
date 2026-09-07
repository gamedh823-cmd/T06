import { getOverallStats } from "@/lib/queries";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1535332371349-a5d229f49cb5?auto=format&fit=crop&w=1600&q=80";

export default async function Hero() {
  const stats = await getOverallStats();

  return (
    <div
      className="relative flex min-h-[260px] flex-col justify-end overflow-hidden rounded-3xl bg-neutral-900 bg-cover shadow-lg sm:min-h-[300px]"
      style={{ backgroundImage: `url('${HERO_IMAGE}')`, backgroundPosition: "center 15%" }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/5" />

      <div className="relative p-8 text-white sm:p-10">
        <p className="text-xs font-semibold tracking-[0.2em] text-blue-200">PLAN · DO · SEE</p>
        <h1 className="mt-2 font-[family-name:var(--font-heading)] text-3xl font-bold tracking-tight sm:text-4xl">
          플랜두씨 다이어리
        </h1>
        <p className="mt-2 max-w-md text-sm text-neutral-200">
          계획을 세우고, 실제로 한 일을 남기고, 돌아보며 다음 계획을 고칩니다.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <div className="rounded-2xl bg-white/10 px-4 py-2.5 backdrop-blur-md ring-1 ring-white/20">
            <div className="text-lg font-semibold">{stats.planCount}</div>
            <div className="text-xs text-neutral-200">계획</div>
          </div>
          <div className="rounded-2xl bg-white/10 px-4 py-2.5 backdrop-blur-md ring-1 ring-white/20">
            <div className="text-lg font-semibold">{stats.todoCount}</div>
            <div className="text-xs text-neutral-200">할 일</div>
          </div>
          <div className="rounded-2xl bg-white/10 px-4 py-2.5 backdrop-blur-md ring-1 ring-white/20">
            <div className="text-lg font-semibold">{stats.doneCount}</div>
            <div className="text-xs text-neutral-200">완료</div>
          </div>
        </div>
      </div>
    </div>
  );
}
