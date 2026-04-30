import { backendFetch } from "@/lib/backend";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ employeeId: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { employeeId } = await params;

  // We need the agent_slug to call the backend's disable endpoint.
  // First get the employee info to find the slug.
  const empRes = await backendFetch("/employees");
  if (!empRes.ok) {
    return new Response("Failed to fetch employees", { status: 500 });
  }
  const employees = await empRes.json();
  const employee = employees.find(
    (e: { id: string }) => e.id === employeeId,
  );
  if (!employee) {
    return new Response("Employee not found", { status: 404 });
  }

  const res = await backendFetch(`/agents/${employee.slug}/enable`, {
    method: "DELETE",
  });
  return new Response(null, { status: res.status });
}
