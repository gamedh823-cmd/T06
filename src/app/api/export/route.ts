import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  // No .eq("user_id", ...) filters here on purpose — RLS already scopes
  // every one of these selects to auth.uid()'s own rows, so this exports
  // exactly the same "my data only" set the rest of the app can see
  // (T07-C133).
  const [plans, planRevisions, todos, executionRecords, retrospectives] = await Promise.all([
    supabase.from("plans").select("*").order("created_at"),
    supabase.from("plan_revisions").select("*").order("edited_at"),
    supabase.from("todos").select("*").order("created_at"),
    supabase.from("execution_records").select("*").order("created_at"),
    supabase.from("retrospectives").select("*").order("created_at"),
  ]);

  const firstError =
    plans.error ?? planRevisions.error ?? todos.error ?? executionRecords.error ?? retrospectives.error;
  if (firstError) {
    return NextResponse.json({ error: firstError.message }, { status: 500 });
  }

  const payload = {
    exported_at: new Date().toISOString(),
    plans: plans.data,
    plan_revisions: planRevisions.data,
    todos: todos.data,
    execution_records: executionRecords.data,
    retrospectives: retrospectives.data,
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="plan-do-see-export-${Date.now()}.json"`,
    },
  });
}
