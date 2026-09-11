import type { Metadata } from "next";
import { Geist, Geist_Mono, Sora } from "next/font/google";
import TopBar from "@/components/TopBar";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "플랜두씨 다이어리",
  description: "내 계획과 실제를 담는 앱",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} ${sora.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--background)] text-neutral-900">
        <TopBar username={(user?.user_metadata as { username?: string } | undefined)?.username ?? null} />
        <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 sm:px-6">{children}</main>
      </body>
    </html>
  );
}
