import type { AgentBlueprintResponse, AgentEmployeeResponse, SessionResponse } from "@votrix/shared";
import type { UIMessage } from "ai";

export const MOCK_BLUEPRINTS: AgentBlueprintResponse[] = [
  {
    id: "bp-1",
    display_name: "Aria",
    provider: "anthropic",
    slug: "aria",
    skills: ["Planning", "Writing", "Analysis"],
    model: "claude-sonnet-4-5",
    is_hired: true,
    employee_id: "emp-1",
  },
  {
    id: "bp-2",
    display_name: "Rex",
    provider: "anthropic",
    slug: "rex",
    skills: ["Research", "Data Analysis", "Reports"],
    model: "claude-sonnet-4-5",
    is_hired: true,
    employee_id: "emp-2",
  },
  {
    id: "bp-3",
    display_name: "Nova",
    provider: "anthropic",
    slug: "nova",
    skills: ["Code Generation", "Debugging", "Architecture"],
    model: "claude-sonnet-4-5",
    is_hired: false,
    employee_id: null,
  },
  {
    id: "bp-4",
    display_name: "Echo",
    provider: "anthropic",
    slug: "echo",
    skills: ["Customer Support", "FAQ", "Onboarding"],
    model: "claude-sonnet-4-5",
    is_hired: false,
    employee_id: null,
  },
  {
    id: "bp-5",
    display_name: "Atlas",
    provider: "anthropic",
    slug: "atlas",
    skills: ["Project Management", "Scheduling", "Tracking"],
    model: "claude-sonnet-4-5",
    is_hired: false,
    employee_id: null,
  },
  {
    id: "bp-6",
    display_name: "Sage",
    provider: "anthropic",
    slug: "sage",
    skills: ["Legal Review", "Compliance", "Contracts"],
    model: "claude-sonnet-4-5",
    is_hired: false,
    employee_id: null,
  },
];

export const MOCK_EMPLOYEES: AgentEmployeeResponse[] = [
  {
    id: "emp-1",
    workspace_id: "ws-1",
    agent_blueprint_id: "bp-1",
    display_name: "Aria",
    slug: "aria",
    model: "claude-sonnet-4-5",
    created_at: "2024-04-01T00:00:00Z",
  },
  {
    id: "emp-2",
    workspace_id: "ws-1",
    agent_blueprint_id: "bp-2",
    display_name: "Rex",
    slug: "rex",
    model: "claude-sonnet-4-5",
    created_at: "2024-04-15T00:00:00Z",
  },
];

export const MOCK_SESSIONS: SessionResponse[] = [
  {
    id: "mock-session-1",
    workspace_id: "ws-1",
    title: "Q4 Planning Discussion",
    agent_blueprint_id: "bp-1",
    blueprint_display_name: "Aria",
    agent_slug: "aria",
    created_at: "2024-04-29T10:00:00Z",
  },
  {
    id: "mock-session-2",
    workspace_id: "ws-1",
    title: "Market Research Summary",
    agent_blueprint_id: "bp-1",
    blueprint_display_name: "Aria",
    agent_slug: "aria",
    created_at: "2024-04-28T15:00:00Z",
  },
  {
    id: "mock-session-3",
    workspace_id: "ws-1",
    title: "Competitor Analysis",
    agent_blueprint_id: "bp-2",
    blueprint_display_name: "Rex",
    agent_slug: "rex",
    created_at: "2024-04-27T09:00:00Z",
  },
  {
    id: "mock-session-4",
    workspace_id: "ws-1",
    title: "Sales Pipeline Review",
    agent_blueprint_id: "bp-2",
    blueprint_display_name: "Rex",
    agent_slug: "rex",
    created_at: "2024-04-26T14:00:00Z",
  },
  {
    id: "mock-session-5",
    workspace_id: "ws-1",
    title: "Weekly Standup Notes",
    agent_blueprint_id: "bp-1",
    blueprint_display_name: "Aria",
    agent_slug: "aria",
    created_at: "2024-04-25T09:30:00Z",
  },
  {
    id: "mock-session-6",
    workspace_id: "ws-1",
    title: "Tool Workflow Stress Test",
    agent_blueprint_id: "bp-2",
    blueprint_display_name: "Rex",
    agent_slug: "rex",
    created_at: "2024-04-24T11:15:00Z",
  },
];

const SESSION_MESSAGES: Record<string, UIMessage[]> = {
  "mock-session-1": [
    {
      id: "s1-msg-1",
      role: "user",
      parts: [{ type: "text", text: "Can you help me with Q4 planning?" }],
    },
    {
      id: "s1-msg-2",
      role: "assistant",
      parts: [
        {
          type: "text",
          text: "Of course! I'd be happy to help with your Q4 planning. Here are some key areas to consider:\n\n**1. Budget Review**\nAudit Q3 actuals and project Q4 spend by department.\n\n**2. Goal Setting**\nDefine OKRs with measurable key results tied to company priorities.\n\n**3. Resource Planning**\nIdentify headcount gaps, tooling needs, and external dependencies.\n\nWhich area would you like to tackle first?",
        },
      ],
    },
    {
      id: "s1-msg-3",
      role: "user",
      parts: [{ type: "text", text: "Let's focus on goal setting." }],
    },
    {
      id: "s1-msg-4",
      role: "assistant",
      parts: [
        {
          type: "text",
          text: "Great choice. For effective Q4 goals, I recommend structuring them around three lenses:\n\n1. **Revenue** — What does the business need to hit?\n2. **Product** — What ships and what gets validated?\n3. **Team** — What capabilities or processes need to improve?\n\nWhat are your company's top two priorities for Q4?",
        },
      ],
    },
  ],

  "mock-session-2": [
    {
      id: "s2-msg-1",
      role: "user",
      parts: [{ type: "text", text: "Summarize the latest market trends in B2B SaaS." }],
    },
    {
      id: "s2-msg-2",
      role: "assistant",
      parts: [
        {
          type: "text",
          text: "Here's a snapshot of current B2B SaaS trends:\n\n### Growth & Funding\n- Series A valuations have normalized to **15-20x ARR** (down from 30x+ in 2021)\n- PLG (product-led growth) remains dominant but **hybrid PLG + sales** models are outperforming\n\n### Technology Shifts\n- **AI-native features** are table stakes — 78% of SaaS buyers expect AI capabilities\n- **Vertical SaaS** continues to outgrow horizontal plays in both retention and expansion\n- Usage-based pricing is stabilizing at ~40% adoption\n\n### Buyer Behavior\n- Average sales cycles lengthened to **6-9 months** for enterprise\n- CFOs now involved in 60% of SaaS purchases (up from 35%)\n- Consolidation preference: buyers want fewer vendors, deeper integrations\n\nWant me to dive deeper into any of these areas?",
        },
      ],
    },
  ],

  "mock-session-3": [
    {
      id: "s3-msg-1",
      role: "user",
      parts: [{ type: "text", text: "Compare our product against Competitor X and Competitor Y." }],
    },
    {
      id: "s3-msg-2",
      role: "assistant",
      parts: [
        {
          type: "text",
          text: "Here's a competitive analysis:\n\n| Feature | Us | Competitor X | Competitor Y |\n|---------|----|--------------|--------------|\n| AI Agents | ✅ Multi-agent | ❌ Single bot | ⚠️ Limited |\n| Integrations | 25+ | 50+ | 15 |\n| Pricing | $$/seat | $$$/seat | $/seat |\n| Enterprise SSO | ✅ | ✅ | ❌ |\n| Custom Models | ✅ | ❌ | ❌ |\n\n### Key Differentiators\n- **Our strength**: Multi-agent architecture, custom model support\n- **Competitor X**: Larger integration ecosystem, established brand\n- **Competitor Y**: Lower price point, simpler UX\n\n### Recommended Actions\n1. Accelerate integration partnerships to close the gap with X\n2. Emphasize multi-agent value in enterprise pitches\n3. Build case studies showing ROI vs Y's cheaper option\n\nShall I draft a battlecard for the sales team?",
        },
      ],
    },
    {
      id: "s3-msg-3",
      role: "user",
      parts: [{ type: "text", text: "Yes, draft a one-page battlecard." }],
    },
    {
      id: "s3-msg-4",
      role: "assistant",
      parts: [
        {
          type: "text",
          text: "Here's the battlecard, and I also built an interactive comparison dashboard you can open with the artifact button on the code block:\n\n## Sales Battlecard: Us vs Competitor X & Y\n\n> \"Unlike single-bot solutions, we provide a team of specialized AI agents that collaborate to handle complex workflows — with full enterprise security and custom model support.\"\n\n## Objection Handling\n\n**\"Competitor X has more integrations\"**\n→ _\"We integrate with the 25 tools that matter most, and our agent architecture means one integration does the work of five.\"_\n\n**\"Competitor Y is cheaper\"**\n→ _\"Our customers see 3x ROI within 90 days. Would you like to see the case study?\"_\n\n```html\n<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    body { font-family: system-ui, sans-serif; max-width: 600px; margin: 40px auto; padding: 0 20px; background: #f8fafc; color: #1e293b; }\n    h2 { color: #171717; border-bottom: 2px solid #171717; padding-bottom: 8px; }\n    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 20px 0; }\n    .card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center; }\n    .card h3 { margin: 0 0 8px; font-size: 14px; color: #64748b; }\n    .card .value { font-size: 28px; font-weight: 700; }\n    .card:nth-child(1) .value { color: #171717; }\n    .card:nth-child(2) .value { color: #e11d48; }\n    .card:nth-child(3) .value { color: #059669; }\n    table { width: 100%; border-collapse: collapse; margin: 20px 0; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }\n    th { background: #171717; color: white; padding: 12px; text-align: left; }\n    td { padding: 12px; border-bottom: 1px solid #e2e8f0; }\n    .yes { color: #059669; font-weight: 600; }\n    .no { color: #e11d48; font-weight: 600; }\n    .partial { color: #d97706; font-weight: 600; }\n  </style>\n</head>\n<body>\n  <h2>Competitive Comparison Dashboard</h2>\n  <div class=\"grid\">\n    <div class=\"card\"><h3>Our Score</h3><div class=\"value\">92</div></div>\n    <div class=\"card\"><h3>Competitor X</h3><div class=\"value\">78</div></div>\n    <div class=\"card\"><h3>Competitor Y</h3><div class=\"value\">65</div></div>\n  </div>\n  <table>\n    <tr><th>Feature</th><th>Us</th><th>Comp X</th><th>Comp Y</th></tr>\n    <tr><td>Multi-Agent AI</td><td class=\"yes\">✓</td><td class=\"no\">✗</td><td class=\"partial\">Partial</td></tr>\n    <tr><td>Custom Models</td><td class=\"yes\">✓</td><td class=\"no\">✗</td><td class=\"no\">✗</td></tr>\n    <tr><td>Enterprise SSO</td><td class=\"yes\">✓</td><td class=\"yes\">✓</td><td class=\"no\">✗</td></tr>\n    <tr><td>25+ Integrations</td><td class=\"yes\">✓</td><td class=\"yes\">✓</td><td class=\"partial\">15</td></tr>\n    <tr><td>Usage-Based Pricing</td><td class=\"yes\">✓</td><td class=\"no\">✗</td><td class=\"yes\">✓</td></tr>\n  </table>\n</body>\n</html>\n```\n\nClick the **expand icon** on the code block above to see the live dashboard in the artifact panel.",
        },
      ],
    },
  ],

  "mock-session-4": [
    {
      id: "s4-msg-1",
      role: "user",
      parts: [{ type: "text", text: "Pull up the sales pipeline for this quarter." }],
    },
    {
      id: "s4-msg-2",
      role: "assistant",
      parts: [
        {
          type: "text",
          text: "Here's the Q2 pipeline snapshot:\n\n### Pipeline Summary\n- **Total pipeline value**: $2.4M\n- **Weighted pipeline**: $890K\n- **Deals in stage**: 34 active opportunities\n- **Average deal size**: $71K\n\n### By Stage\n```\nProspecting    ████████████░░░░  12 deals  $480K\nDiscovery      ██████████░░░░░░   8 deals  $640K\nProposal       ██████░░░░░░░░░░   6 deals  $540K\nNegotiation    ████░░░░░░░░░░░░   5 deals  $420K\nClosing        ███░░░░░░░░░░░░░   3 deals  $320K\n```\n\n### Deals at Risk\n1. **Acme Corp** ($120K) — Champion left the company\n2. **GlobalTech** ($85K) — Budget freeze until next quarter\n\n### Action Items\n- Schedule executive sponsor call for Acme Corp\n- Propose pilot program for GlobalTech to keep deal warm\n\nWant me to drill into any specific deal?",
        },
      ],
    },
  ],

  "mock-session-5": [
    {
      id: "s5-msg-1",
      role: "user",
      parts: [{ type: "text", text: "Capture the standup notes from today." }],
    },
    {
      id: "s5-msg-2",
      role: "assistant",
      parts: [
        {
          type: "text",
          text: "# Weekly Standup — April 25, 2024\n\n## Engineering\n- **Done**: Auth refactor shipped, SSO integration passing all tests\n- **In progress**: Agent orchestration v2 (ETA: Friday)\n- **Blocked**: Waiting on API keys from partner for integration testing\n\n## Design\n- **Done**: New dashboard mockups reviewed and approved\n- **In progress**: Mobile responsive pass on chat UI\n- **Note**: Design system tokens updated — engineering should pull latest\n\n## Product\n- **Done**: Customer interviews (5/5 completed)\n- **In progress**: Writing PRD for memory feature\n- **Decision needed**: Scope for v1 memory — full CRUD or read-only?\n\n## Action Items\n- [ ] @eng: Follow up on partner API keys by EOD\n- [ ] @design: Share responsive specs in Figma by Wednesday\n- [ ] @product: Schedule memory scope decision meeting\n\nAnything to add or correct?",
        },
      ],
    },
    {
      id: "s5-msg-3",
      role: "user",
      parts: [{ type: "text", text: "Add that we also discussed the pricing change rollout." }],
    },
    {
      id: "s5-msg-4",
      role: "assistant",
      parts: [
        {
          type: "text",
          text: "Updated. Added to the notes:\n\n## Business\n- **Discussed**: Pricing change rollout plan\n  - New tiers go live June 1\n  - Existing customers grandfathered for 6 months\n  - Sales team needs updated pricing deck by May 15\n- **Action**: @sales — update all active proposals with new pricing by May 20\n\nNotes are now complete. Want me to format this for Slack or email distribution?",
        },
      ],
    },
  ],

  "mock-session-6": [
    {
      id: "s6-msg-1",
      role: "user",
      parts: [
        {
          type: "text",
          text: "Run a full pipeline review and show me the intermediate work.",
        },
      ],
    },
    {
      id: "s6-msg-2",
      role: "assistant",
      parts: [
        {
          type: "reasoning",
          text: "I should verify the user's operating context, gather CRM data, inspect a workspace file, analyze stage velocity, and create a visual summary before giving the recommendation.",
          state: "done",
        },
        {
          type: "dynamic-tool",
          toolName: "memory_search",
          toolCallId: "s6-tool-1",
          state: "output-available",
          input: { query: "pipeline review format preferences", limit: 3 },
          output: {
            matches: [
              "Lead with the recommendation.",
              "Use tables for owner/date/action follow-ups.",
              "Call out data freshness risks.",
            ],
          },
        },
        {
          type: "dynamic-tool",
          toolName: "query_crm",
          toolCallId: "s6-tool-2",
          state: "output-available",
          input: { segment: "enterprise", quarter: "Q2", include_at_risk: true },
          output: {
            records: 34,
            totalPipeline: "$2.4M",
            weightedPipeline: "$890K",
            atRiskDeals: ["Acme Corp", "GlobalTech", "Northstar Bank"],
          },
        },
        {
          type: "reasoning",
          text: "The CRM data is enough to identify the risk cluster, but I need a second source for stage movement so the recommendation is not based only on static pipeline value.",
          state: "done",
        },
        {
          type: "dynamic-tool",
          toolName: "read_workspace_file",
          toolCallId: "s6-tool-3",
          state: "output-available",
          input: { path: "/Sales/weekly-stage-changes.csv", previewRows: 10 },
          output: {
            rows: 86,
            columns: ["account", "previous_stage", "current_stage", "owner", "days_in_stage"],
          },
        },
        {
          type: "dynamic-tool",
          toolName: "analyze_data",
          toolCallId: "s6-tool-4",
          state: "output-available",
          input: {
            dataset: "weekly-stage-changes",
            metrics: ["stage_velocity", "slippage", "forecast_confidence"],
          },
          output: {
            confidence: 0.91,
            medianVelocityDays: 24,
            slippedDeals: 5,
            forecastRisk: "medium",
          },
        },
        {
          type: "dynamic-tool",
          toolName: "__file_output__",
          toolCallId: "s6-tool-5",
          state: "output-available",
          input: {
            file_id: "mock-pipeline-chart",
            filename: "pipeline-by-stage.png",
            mime_type: "image/png",
          },
          output: "ready",
        },
        {
          type: "text",
          text: "Pipeline coverage is healthy, but the review should focus on **proposal-stage confidence** rather than a broad reset.\n\n| Priority | Owner | Action | Due |\n|---|---|---|---|\n| High | Sales | Refresh close confidence for Acme, GlobalTech, and Northstar | May 5 |\n| Medium | Product | Confirm roadmap dependencies for enterprise proposals | May 6 |\n| Medium | Finance | Re-check weighted forecast assumptions after CRM cleanup | May 7 |\n\nThe main risk is data freshness: five deals have recent slippage, so the forecast should not be finalized until owners update next steps.",
        },
      ],
    } as UIMessage,
  ],
};

export function getMockMessages(sessionId: string): UIMessage[] {
  return SESSION_MESSAGES[sessionId] ?? [];
}

const MOCK_RESPONSES: Record<string, string> = {
  "bp-1":
    "Thanks for reaching out! I'm **Aria**, your strategic planning assistant. I've analyzed your request and here's what I think:\n\n1. We should start by defining clear objectives\n2. Break the work into manageable phases\n3. Set measurable milestones\n\nWhat timeline are you working with?",
  "bp-2":
    "Great question! I'm **Rex**, your research and analysis specialist. Let me dig into this:\n\n### Initial Findings\n- The data suggests a **15% opportunity** in the underserved segment\n- Three key competitors are moving in this direction\n- Our current positioning gives us a first-mover advantage\n\nWant me to prepare a detailed report with recommendations?",
};

export function getMockResponse(blueprintId: string): string {
  return (
    MOCK_RESPONSES[blueprintId] ??
    "I'm running in **mock mode** — no backend needed! This is a simulated streaming response."
  );
}
