import { backendFetch } from "@/lib/backend";
import { buildInitialMessages, isAwaitingAssistantResponse } from "@/lib/session-messages";
import Chat from "@/components/chat";
import type { SessionDetailResponse, SessionFileResponse } from "@votrix/shared";
import { notFound } from "next/navigation";
import { getMockMessages, MOCK_EMPLOYEES, MOCK_SESSIONS } from "@/mocks/data";

export default async function SessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  if (process.env.NEXT_PUBLIC_MOCK === "true") {
    const session = MOCK_SESSIONS.find((s) => s.id === sessionId);
    const emp = session
      ? MOCK_EMPLOYEES.find((e) => e.agent_blueprint_id === session.agent_blueprint_id)
      : MOCK_EMPLOYEES[0];
    return (
      <Chat
        initialMessages={getMockMessages(sessionId)}
        sessionId={sessionId}
        employeeName={emp?.display_name ?? session?.blueprint_display_name ?? undefined}
        sessionTitle={session?.title ?? undefined}
      />
    );
  }

  const [detailRes, filesRes] = await Promise.all([
    backendFetch(`/sessions/${sessionId}`),
    backendFetch(`/sessions/${sessionId}/files`),
  ]);
  if (!detailRes.ok) notFound();
  const detail = (await detailRes.json()) as SessionDetailResponse;
  const files: SessionFileResponse[] = filesRes.ok ? await filesRes.json() : [];

  const initialMessages = buildInitialMessages(detail.id, detail.events);
  const awaitingResponse = isAwaitingAssistantResponse(detail.events);

  return (
    <Chat
      initialMessages={initialMessages}
      sessionId={sessionId}
      sessionFiles={files}
      awaitingResponse={awaitingResponse}
      agentBlueprintId={detail.agent_blueprint_id ?? undefined}
      sessionTitle={detail.title ?? undefined}
    />
  );
}
