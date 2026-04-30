import { backendFetch } from "@/lib/backend";
import type { AgentBlueprintResponse } from "@votrix/shared";
import Marketplace from "@/components/marketplace";

export default async function MarketplacePage() {
  let blueprints: AgentBlueprintResponse[] = [];
  try {
    const res = await backendFetch("/agents/blueprints");
    if (res.ok) blueprints = (await res.json()) as AgentBlueprintResponse[];
  } catch {}

  return <Marketplace blueprints={blueprints} />;
}
