"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function str(formData: FormData, key: string): string {
  return (formData.get(key) ?? "").toString().trim();
}

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

// Supabase Auth is built around an email field, and we don't want to ask
// anyone for a real email address just to keep a diary — so the "아이디"
// people type never leaves this file. It's turned into a same-shaped fake
// address at this one placeholder domain (nothing is ever sent there:
// Confirm email must stay off in the Supabase dashboard for this project)
// and only that goes to Supabase; the real username people typed is kept
// separately in user_metadata so the rest of the app can display it back.
const SYNTHETIC_EMAIL_DOMAIN = "plandosee.app";

function toSyntheticEmail(username: string): string {
  return `${username.toLowerCase()}@${SYNTHETIC_EMAIL_DOMAIN}`;
}

// Same message no matter which part was wrong, and never built from
// Supabase's raw error text — that text can mention the synthetic email
// domain, which has no reason to ever reach the screen (T07-C99).
const LOGIN_ERROR = "아이디 또는 비밀번호가 올바르지 않습니다.";
const SIGNUP_ERROR = "가입에 실패했습니다. 아이디는 영문·숫자·밑줄 3~20자, 비밀번호는 8자 이상이어야 합니다.";
const DUPLICATE_ERROR = "이미 사용 중인 아이디입니다.";

export async function login(formData: FormData) {
  const username = str(formData, "username");
  const password = str(formData, "password");

  if (!username || !password) {
    redirect(`/login?error=${encodeURIComponent(LOGIN_ERROR)}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: toSyntheticEmail(username),
    password,
  });
  if (error) {
    redirect(`/login?error=${encodeURIComponent(LOGIN_ERROR)}`);
  }
  redirect("/");
}

export async function signup(formData: FormData) {
  const username = str(formData, "username");
  const password = str(formData, "password");

  if (!USERNAME_RE.test(username)) {
    redirect(`/signup?error=${encodeURIComponent(SIGNUP_ERROR)}`);
  }
  if (password.length < 8) {
    redirect(`/signup?error=${encodeURIComponent(SIGNUP_ERROR)}`);
  }

  const email = toSyntheticEmail(username);

  // Created via the admin API with email_confirm already set — a
  // synthetic address can never receive a real confirmation link, so this
  // is what makes signup work regardless of this Supabase project's email
  // settings, instead of silently depending on "Confirm email" being off
  // in a dashboard this code can't see.
  const admin = createAdminClient();
  const { error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { username },
  });

  if (createError) {
    // "already been registered" is the one case worth telling apart from a
    // generic failure; anything else stays generic on purpose so no
    // Supabase-internal detail (including the synthetic email) reaches the
    // screen (T07-C98).
    const duplicate = /already.*registered|already.*exists/i.test(createError.message);
    redirect(`/signup?error=${encodeURIComponent(duplicate ? DUPLICATE_ERROR : SIGNUP_ERROR)}`);
  }

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) {
    redirect(`/login?message=${encodeURIComponent("가입되었습니다. 로그인해 주세요.")}`);
  }

  redirect("/");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
