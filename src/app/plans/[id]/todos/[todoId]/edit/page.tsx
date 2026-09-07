import { notFound } from "next/navigation";
import TodoForm from "@/components/TodoForm";
import { updateTodo } from "@/lib/actions";
import { getTodo } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function EditTodoPage({
  params,
}: {
  params: Promise<{ id: string; todoId: string }>;
}) {
  const { id, todoId } = await params;
  const todo = await getTodo(todoId);
  if (!todo || todo.plan_id !== id) notFound();

  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight">할 일 수정</h1>
      <TodoForm action={updateTodo} planId={id} defaultValues={todo} submitLabel="수정 저장" />
    </div>
  );
}
