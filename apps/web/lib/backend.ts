import { createClient } from "@/lib/supabase/server";

const BACKEND_URL = process.env.BACKEND_URL!;

type WorkspaceSummary = {
  id: string;
};

type CurrentUserResponse = {
  workspaces?: WorkspaceSummary[];
};

function requiresWorkspaceHeader(path: string) {
  return (
    path === "/chat" ||
    path === "/files" ||
    path.startsWith("/files/") ||
    path === "/sessions" ||
    path.startsWith("/sessions/") ||
    path === "/employees" ||
    path.startsWith("/employees/") ||
    path === "/agents/blueprints"
  );
}

export async function getDefaultWorkspaceId(accessToken: string) {
  const res = await fetch(`${BACKEND_URL}/users/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!res.ok) return null;

  const user = (await res.json()) as CurrentUserResponse;
  return user.workspaces?.[0]?.id ?? null;
}

export async function backendFetch(path: string, init: RequestInit = {}) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = new Headers(init.headers);
  if (session?.access_token) {
    headers.set("Authorization", `Bearer ${session.access_token}`);
  }
  if (
    session?.access_token &&
    requiresWorkspaceHeader(path) &&
    !headers.has("x-workspace-id")
  ) {
    const workspaceId = await getDefaultWorkspaceId(session.access_token);
    if (workspaceId) headers.set("x-workspace-id", workspaceId);
  }
  if (
    init.body &&
    !(init.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(`${BACKEND_URL}${path}`, { ...init, headers });
}
