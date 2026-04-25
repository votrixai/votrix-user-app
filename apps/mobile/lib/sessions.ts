import type { SessionResponse } from "@votrix/shared";

export type SessionGroup = { label: string; sessions: SessionResponse[] };

export function groupSessions(sessions: SessionResponse[]): SessionGroup[] {
  const now = Date.now();
  const day = 86400000;
  const buckets: Record<string, SessionResponse[]> = {
    Today: [],
    Yesterday: [],
    "Previous 7 days": [],
    Older: [],
  };
  for (const s of sessions) {
    const age = now - new Date(s.created_at).getTime();
    if (age < day) buckets.Today.push(s);
    else if (age < 2 * day) buckets.Yesterday.push(s);
    else if (age < 7 * day) buckets["Previous 7 days"].push(s);
    else buckets.Older.push(s);
  }
  return Object.entries(buckets)
    .filter(([, arr]) => arr.length > 0)
    .map(([label, arr]) => ({ label, sessions: arr }));
}

export function sessionLabel(s: SessionResponse): string {
  const shortId = s.id.slice(0, 8);
  if (s.provider_session_title) return s.provider_session_title;
  return s.agent_slug ? `${s.agent_slug} \u00B7 ${shortId}` : shortId;
}
