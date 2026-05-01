import { backendFetch } from "@/lib/backend";
import type { AgentBlueprintResponse } from "@votrix/shared";
import Marketplace from "@/components/marketplace";
import { MOCK_BLUEPRINTS } from "@/mocks/data";

export default async function MarketplacePage() {
  if (process.env.NEXT_PUBLIC_MOCK === "true") {
    return <Marketplace blueprints={MOCK_BLUEPRINTS} />;
  }

  let blueprints: AgentBlueprintResponse[] = [];
  try {
    const res = await backendFetch("/agents/blueprints");
    if (res.ok) blueprints = (await res.json()) as AgentBlueprintResponse[];
  } catch {}

  return <Marketplace blueprints={blueprints} />;
}
