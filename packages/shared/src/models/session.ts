export interface SessionResponse {
  id: string;
  workspace_id: string;
  title: string | null;
  agent_blueprint_id: string | null;
  blueprint_display_name: string | null;
  agent_slug: string | null;
  created_at: string;
}

export interface SessionCreateResponse {
  id: string;
  workspace_id: string;
  provider_session_id: string;
  agent_blueprint_id: string | null;
  created_at: string;
}

export interface SessionEventResponse {
  event_index: number;
  event_type: string;
  title: string | null;
  body: string;
}

export interface SessionDetailResponse {
  id: string;
  workspace_id: string;
  title?: string | null;
  agent_blueprint_id: string | null;
  created_at: string;
  events: SessionEventResponse[];
}

export interface SessionCreateRequest {
  agent_slug: string;
}

export interface SessionFileResponse {
  file_id: string;
  filename: string | null;
  mime_type: string | null;
}
