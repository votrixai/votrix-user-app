import { backendFetch } from "@/lib/backend";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ employeeId: string; storeId: string; memoryId: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { employeeId, storeId, memoryId } = await params;

  const res = await backendFetch(
    `/employees/${employeeId}/memory-stores/${storeId}/memories/${memoryId}`,
    { method: "DELETE" },
  );
  return new Response(null, { status: res.status });
}
