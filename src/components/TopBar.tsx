"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/auth-actions";

const NAV_LINK_CLASS = "whitespace-nowrap rounded-full px-2 py-1.5 hover:bg-neutral-100 hover:text-neutral-900 sm:px-3";
const NAV_LINK_ACTIVE_CLASS = "bg-green-50 font-medium text-green-700 hover:bg-green-50 hover:text-green-700";

export default function TopBar({ username }: { username: string | null }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm shadow-[0_1px_0_rgba(0,0,0,0.06)]">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 px-4 py-3.5 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 whitespace-nowrap font-[family-name:var(--font-heading)] font-bold tracking-tight text-neutral-900"
        >
          <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-green-600" />
          플랜두씨 다이어리
        </Link>
        <nav className="flex items-center gap-0.5 text-xs text-neutral-500 sm:gap-1 sm:text-sm">
          {username && (
            <>
              <Link href="/" className={`${NAV_LINK_CLASS} ${isActive("/") ? NAV_LINK_ACTIVE_CLASS : ""}`}>
                계획
              </Link>
              <Link
                href="/review"
                className={`${NAV_LINK_CLASS} ${isActive("/review") ? NAV_LINK_ACTIVE_CLASS : ""}`}
              >
                돌아보기
              </Link>
              <a href="/api/export" className={NAV_LINK_CLASS}>
                내보내기
              </a>
              <Link
                href="/settings"
                className={`${NAV_LINK_CLASS} ${isActive("/settings") ? NAV_LINK_ACTIVE_CLASS : ""}`}
              >
                계정
              </Link>
              <span className="hidden pl-2 text-neutral-400 md:inline">{username}</span>
              <form action={logout}>
                <button type="submit" className={NAV_LINK_CLASS}>
                  로그아웃
                </button>
              </form>
            </>
          )}
        </nav>
      </div>
    </div>
  );
}
