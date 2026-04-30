import { backendFetch } from "@/lib/backend";
import type { AgentEmployeeResponse } from "@votrix/shared";
import NewChatLanding from "@/components/new-chat-landing";

export default async function Home() {
  let employees: AgentEmployeeResponse[] = [];
  try {
    const res = await backendFetch("/employees");
    if (res.ok) employees = (await res.json()) as AgentEmployeeResponse[];
  } catch {}

  return <NewChatLanding employees={employees} />;
}
