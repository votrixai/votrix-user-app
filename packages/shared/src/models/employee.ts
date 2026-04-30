export interface AgentBlueprintResponse {
  id: string;
  display_name: string;
  provider: string;
  slug: string;
  skills: string[];
  model: string;
  is_hired: boolean;
  employee_id: string | null;
}

export interface AgentEmployeeResponse {
  id: string;
  workspace_id: string;
  agent_blueprint_id: string;
  display_name: string;
  slug: string;
  model: string;
  created_at: string;
}

export interface MemoryStoreResponse {
  id: string;
  name: string;
  provider_memory_store_id: string;
  created_at: string;
}

export interface MemoryResponse {
  id: string;
  content: string;
}
