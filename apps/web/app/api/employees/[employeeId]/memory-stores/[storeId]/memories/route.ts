import { backendFetch } from "@/lib/backend";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ employeeId: string; storeId: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { employeeId, storeId } = await params;

  const res = await backendFetch(
    `/employees/${employeeId}/memory-stores/${storeId}/memories`,
  );
  const text = await res.text();
  return new Response(text, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
