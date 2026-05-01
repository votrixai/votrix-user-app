import { createClient } from "@/lib/supabase/server";
import { backendFetch } from "@/lib/backend";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return new Response("Unauthorized", { status: 401 });

  // Forward FormData as-is — do NOT set Content-Type, fetch sets the multipart boundary
  const formData = await request.formData();
  const res = await backendFetch("/files", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  return Response.json(data, { status: res.status });
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const res = await backendFetch("/files");
  const data = await res.json();
  return Response.json(data, { status: res.status });
}
