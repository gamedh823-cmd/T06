import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
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
