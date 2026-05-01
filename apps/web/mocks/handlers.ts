import { http, HttpResponse } from "msw";
import { createUIMessageStream, createUIMessageStreamResponse, generateId } from "ai";
import { MOCK_BLUEPRINTS, MOCK_EMPLOYEES, MOCK_SESSIONS, getMockResponse } from "./data";

let nextSessionCounter = 100;
const dynamicSessions = [...MOCK_SESSIONS];

type Writer = Parameters<Parameters<typeof createUIMessageStream>[0]["execute"]>[0]["writer"];

async function streamText(writer: Writer, text: string, speed = 40) {
  const id = generateId();
  writer.write({ type: "text-start", id });
  for (const word of text.split(" ")) {
    await new Promise<void>((r) => setTimeout(r, speed));
    writer.write({ type: "text-delta", delta: word + " ", id });
  }
  writer.write({ type: "text-end", id });
}

async function streamReasoning(writer: Writer, text: string) {
  const id = generateId();
  writer.write({ type: "reasoning-start", id });
  for (const word of text.split(" ")) {
    await new Promise<void>((r) => setTimeout(r, 25));
    writer.write({ type: "reasoning-delta", delta: word + " ", id });
  }
  writer.write({ type: "reasoning-end", id });
}

function emitToolCall(writer: Writer, toolName: string, input: object, output: string) {
  const id = generateId();
  writer.write({
    type: "tool-input-available",
    toolCallId: id,
    toolName,
    input,
    providerExecuted: true,
  });
  writer.write({
    type: "tool-output-available",
    toolCallId: id,
    output,
    providerExecuted: true,
  });
}

function emitFileOutput(writer: Writer, fileId: string, filename: string, mimeType: string) {
  const id = generateId();
  writer.write({
    type: "tool-input-available",
    toolCallId: id,
    toolName: "__file_output__",
    input: { file_id: fileId, filename, mime_type: mimeType },
    providerExecuted: true,
  });
  writer.write({
    type: "tool-output-available",
    toolCallId: id,
    output: "ready",
    providerExecuted: true,
  });
}

type ResponseFn = (writer: Writer) => Promise<void>;

const responseVariants: ResponseFn[] = [
  // 0: Plain text
  async (writer) => {
    await streamText(
      writer,
      "Sure, I can help with that! Let me think about the best approach. Based on what you've described, I'd recommend starting with a clear problem statement, then working through the solution incrementally. Feel free to ask follow-up questions.",
    );
  },

  // 1: Rich markdown with headers, lists, code block
  async (writer) => {
    await streamText(
      writer,
      `Here's a comprehensive breakdown:\n\n## Overview\n\nThis solution uses a **modular architecture** with three key components.\n\n### Components\n\n- **Auth Layer** — Handles JWT tokens and session management\n- **Data Pipeline** — Processes incoming events in real-time\n- **API Gateway** — Routes requests with rate limiting\n\n### Implementation\n\n\`\`\`typescript\ninterface Config {\n  apiKey: string;\n  region: "us-east" | "eu-west";\n  maxRetries: number;\n}\n\nasync function initialize(config: Config) {\n  const client = new Client(config);\n  await client.connect();\n  return client;\n}\n\`\`\`\n\n> **Note:** Make sure to set the \`API_KEY\` environment variable before running.\n\nLet me know if you need more details on any component.`,
      30,
    );
  },

  // 2: Reasoning/thinking block followed by response
  async (writer) => {
    await streamReasoning(
      writer,
      "The user is asking about architecture decisions. I should consider the trade-offs between microservices and monolith. Given their team size (likely small based on context), a modular monolith might be more practical. Let me also think about deployment — they probably want something simple. A monorepo with shared packages would work well. I'll recommend starting simple and extracting services later when bottlenecks appear.",
    );
    await new Promise<void>((r) => setTimeout(r, 300));
    await streamText(
      writer,
      "After thinking through the trade-offs, I'd recommend a **modular monolith** approach:\n\n1. Start with a single deployable unit\n2. Use clear module boundaries (separate packages in a monorepo)\n3. Extract to microservices only when you hit specific scaling bottlenecks\n\nThis gives you the speed of a monolith with the flexibility to evolve. Most teams under 20 engineers don't need microservices — the operational overhead outweighs the benefits.\n\nWant me to sketch out the module structure?",
    );
  },

  // 3: Tool calls + text response
  async (writer) => {
    await streamText(writer, "Let me look that up for you...\n\n", 30);

    emitToolCall(
      writer,
      "web_search",
      { query: "latest React 19 features and improvements" },
      JSON.stringify({
        results: [
          { title: "React 19 Release Notes", url: "https://react.dev/blog/react-19" },
          { title: "What's New in React 19", url: "https://example.com/react-19" },
        ],
      }),
    );

    await new Promise<void>((r) => setTimeout(r, 500));

    emitToolCall(
      writer,
      "analyze_data",
      { source: "search_results", format: "summary" },
      "Analysis complete. Found 2 relevant sources with 95% relevance score.",
    );

    await new Promise<void>((r) => setTimeout(r, 300));

    await streamText(
      writer,
      "Based on my research, here are the key highlights:\n\n### React 19 Key Features\n\n| Feature | Status | Impact |\n|---------|--------|--------|\n| Server Components | Stable | High |\n| Actions | Stable | High |\n| use() hook | New | Medium |\n| Document Metadata | New | Low |\n\nThe most impactful change is the stabilization of **Server Components** — they're no longer experimental.",
    );
  },

  // 4: File output (image) + description
  async (writer) => {
    await streamText(writer, "I've generated the chart you requested:\n\n", 30);

    emitFileOutput(writer, "mock-chart-1", "quarterly-revenue.png", "image/png");

    await new Promise<void>((r) => setTimeout(r, 300));

    await streamText(
      writer,
      "\nThe chart shows quarterly revenue growth over the past year. Key takeaways:\n\n- **Q1**: $1.2M (baseline)\n- **Q2**: $1.8M (+50% QoQ)\n- **Q3**: $2.1M (+17% QoQ)\n- **Q4**: $2.9M (+38% QoQ)\n\nTotal annual revenue: **$8.0M**, representing 142% YoY growth.",
    );
  },

  // 5: Code artifact (long code block)
  async (writer) => {
    await streamText(
      writer,
      `Here's the complete implementation:\n\n\`\`\`tsx\nimport { useState, useCallback, useRef, useEffect } from "react";\n\ninterface Message {\n  id: string;\n  role: "user" | "assistant";\n  content: string;\n  timestamp: Date;\n}\n\nexport function useChat(endpoint: string) {\n  const [messages, setMessages] = useState<Message[]>([]);\n  const [isLoading, setIsLoading] = useState(false);\n  const abortRef = useRef<AbortController | null>(null);\n\n  const send = useCallback(async (text: string) => {\n    const userMsg: Message = {\n      id: crypto.randomUUID(),\n      role: "user",\n      content: text,\n      timestamp: new Date(),\n    };\n\n    setMessages((prev) => [...prev, userMsg]);\n    setIsLoading(true);\n\n    const controller = new AbortController();\n    abortRef.current = controller;\n\n    try {\n      const res = await fetch(endpoint, {\n        method: "POST",\n        headers: { "Content-Type": "application/json" },\n        body: JSON.stringify({ messages: [...messages, userMsg] }),\n        signal: controller.signal,\n      });\n\n      const data = await res.json();\n      setMessages((prev) => [...prev, {\n        id: crypto.randomUUID(),\n        role: "assistant",\n        content: data.content,\n        timestamp: new Date(),\n      }]);\n    } catch (err) {\n      if (err instanceof Error && err.name !== "AbortError") {\n        console.error("Chat error:", err);\n      }\n    } finally {\n      setIsLoading(false);\n    }\n  }, [endpoint, messages]);\n\n  const stop = useCallback(() => {\n    abortRef.current?.abort();\n  }, []);\n\n  return { messages, send, stop, isLoading };\n}\n\`\`\`\n\nThis hook handles message state, streaming, and cancellation. You can use it like:\n\n\`\`\`tsx\nconst { messages, send, stop, isLoading } = useChat("/api/chat");\n\`\`\``,
      20,
    );
  },

  // 6: Reasoning + tool call + file output (complex multi-part)
  async (writer) => {
    await streamReasoning(
      writer,
      "The user wants a data analysis. I should first fetch the dataset, run the analysis, generate a visualization, and then explain the results. Let me sequence this properly — fetch first, analyze, then generate the chart.",
    );

    await new Promise<void>((r) => setTimeout(r, 200));

    await streamText(writer, "Running the analysis now...\n\n", 30);

    emitToolCall(
      writer,
      "fetch_dataset",
      { source: "analytics_db", query: "SELECT * FROM metrics WHERE date > '2024-01-01'" },
      JSON.stringify({ rows: 1247, columns: ["date", "users", "revenue", "churn"] }),
    );

    await new Promise<void>((r) => setTimeout(r, 400));

    emitToolCall(
      writer,
      "run_analysis",
      { type: "trend_analysis", metrics: ["users", "revenue"] },
      "Trend analysis complete. Detected positive growth trend with 0.94 R² fit.",
    );

    await new Promise<void>((r) => setTimeout(r, 300));

    emitFileOutput(writer, "mock-analysis-1", "growth-analysis.png", "image/png");

    await new Promise<void>((r) => setTimeout(r, 200));

    await streamText(
      writer,
      "\n### Analysis Results\n\nI analyzed 1,247 data points from your metrics database. Here are the findings:\n\n**Growth Metrics**\n- User growth rate: **12.3% MoM** (accelerating)\n- Revenue per user: **$47.20** (up from $38.50)\n- Churn rate: **2.1%** (industry average: 5.8%)\n\n**Projections**\n- At current trajectory: **$4.2M ARR** by end of year\n- If churn drops to 1.5%: **$4.8M ARR** potential\n\nThe chart above visualizes the growth trajectory. Want me to dig deeper into any metric?",
    );
  },

  // 7: Short plain text (variety)
  async (writer) => {
    await streamText(
      writer,
      "Done! The changes have been applied. Let me know if you need anything else.",
      50,
    );
  },
];

let responseIndex = 0;

export const handlers = [
  http.get("/api/blueprints", () => {
    return HttpResponse.json(MOCK_BLUEPRINTS);
  }),

  http.get("/api/employees", () => {
    return HttpResponse.json(MOCK_EMPLOYEES);
  }),

  http.get("/api/sessions", () => {
    return HttpResponse.json(dynamicSessions);
  }),

  http.post("/api/sessions", async ({ request }) => {
    const body = (await request.json()) as { agent_slug?: string };
    const emp = MOCK_EMPLOYEES.find((e) => e.slug === body.agent_slug);
    const id = `mock-session-${nextSessionCounter++}`;
    dynamicSessions.unshift({
      id,
      workspace_id: "ws-1",
      title: `New Chat`,
      agent_blueprint_id: emp?.agent_blueprint_id ?? "bp-1",
      blueprint_display_name: emp?.display_name ?? "AI",
      agent_slug: emp?.slug ?? "ai",
      created_at: new Date().toISOString(),
    });
    return HttpResponse.json({ id });
  }),

  http.delete("/api/sessions/:id", ({ params }) => {
    const idx = dynamicSessions.findIndex((s) => s.id === params.id);
    if (idx !== -1) dynamicSessions.splice(idx, 1);
    return new HttpResponse(null, { status: 200 });
  }),

  http.get("/api/employees/:id", ({ params }) => {
    const emp = MOCK_EMPLOYEES.find((e) => e.id === params.id);
    if (!emp) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(emp);
  }),

  http.get("/api/employees/:employeeId/memory-stores", () => {
    return HttpResponse.json([
      {
        id: "store-1",
        name: "User Preferences",
        provider_memory_store_id: "ps-1",
        created_at: "2024-04-01T00:00:00Z",
      },
      {
        id: "store-2",
        name: "Project Context",
        provider_memory_store_id: "ps-2",
        created_at: "2024-04-01T00:00:00Z",
      },
    ]);
  }),

  http.get("/api/employees/:employeeId/memory-stores/:storeId/memories", () => {
    return HttpResponse.json([
      { id: "mem-1", content: "User prefers concise bullet-point summaries." },
      { id: "mem-2", content: "Working on a SaaS product targeting enterprise customers." },
    ]);
  }),

  http.delete("/api/employees/:employeeId/memory-stores/:storeId/memories/:memoryId", () => {
    return new HttpResponse(null, { status: 200 });
  }),

  http.post("/api/chat", () => {
    const variant = responseVariants[responseIndex % responseVariants.length]!;
    responseIndex++;

    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        await variant(writer);
      },
    });
    return createUIMessageStreamResponse({ stream });
  }),

  http.post("/api/files", () => {
    return HttpResponse.json({ file_id: "mock-file-1", filename: "document.pdf" });
  }),

  http.get("/api/files/:fileId/content", () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <rect width="400" height="300" fill="#f8fafc" rx="8"/>
      <text x="200" y="150" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#64748d">Mock Chart Image</text>
      <rect x="60" y="180" width="40" height="80" fill="#533afd" rx="4"/>
      <rect x="120" y="140" width="40" height="120" fill="#533afd" opacity="0.8" rx="4"/>
      <rect x="180" y="120" width="40" height="140" fill="#533afd" opacity="0.7" rx="4"/>
      <rect x="240" y="90" width="40" height="170" fill="#533afd" opacity="0.6" rx="4"/>
      <rect x="300" y="60" width="40" height="200" fill="#533afd" opacity="0.5" rx="4"/>
    </svg>`;
    return new HttpResponse(svg, {
      headers: { "Content-Type": "image/svg+xml" },
    });
  }),
];
