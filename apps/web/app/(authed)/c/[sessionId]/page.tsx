import { backendFetch } from "@/lib/backend";
import { buildInitialMessages, isAwaitingAssistantResponse } from "@/lib/session-messages";
import Chat from "@/components/chat";
import type { AgentEmployeeResponse, SessionDetailResponse, SessionFileResponse } from "@votrix/shared";
import { notFound } from "next/navigation";

export default async function SessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  const [detailRes, filesRes, employeesRes] = await Promise.all([
    backendFetch(`/sessions/${sessionId}`),
    backendFetch(`/sessions/${sessionId}/files`),
    backendFetch(`/employees`),
  ]);
  if (!detailRes.ok) notFound();
  const detail = (await detailRes.json()) as SessionDetailResponse;
  const files: SessionFileResponse[] = filesRes.ok ? await filesRes.json() : [];
  const employees: AgentEmployeeResponse[] = employeesRes.ok ? await employeesRes.json() : [];

  const employeeName = detail.agent_blueprint_id
    ? employees.find((e) => e.agent_blueprint_id === detail.agent_blueprint_id)?.display_name
    : undefined;

  const initialMessages = buildInitialMessages(detail.id, detail.events);
  const awaitingResponse = isAwaitingAssistantResponse(detail.events);

  return (
    <Chat
      initialMessages={initialMessages}
      sessionId={sessionId}
      sessionFiles={files}
      awaitingResponse={awaitingResponse}
      employeeName={employeeName}
    />
  );
}
