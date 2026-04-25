import type { ChatModelAdapter } from "@assistant-ui/react-native";
import type { ChatSSEEvent } from "@votrix/shared";
import { backendFetch } from "./api";

export function createBackendChatAdapter(
  sessionId: string,
): ChatModelAdapter {
  return {
    async *run({ messages, abortSignal }) {
      const lastUserMessage = [...messages]
        .reverse()
        .find((m) => m.role === "user");
      const text =
        lastUserMessage?.content
          .filter((p): p is { type: "text"; text: string } => p.type === "text")
          .map((p) => p.text)
          .join("\n") ?? "";

      const res = await backendFetch("/chat", {
        method: "POST",
        body: JSON.stringify({ session_id: sessionId, message: text }),
        signal: abortSignal,
      });

      if (!res.ok) {
        const errorText = await res.text();
        yield { content: [{ type: "text" as const, text: `Error: ${errorText}` }] };
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            let event: ChatSSEEvent;
            try {
              event = JSON.parse(line.slice(6));
            } catch {
              continue;
            }

            switch (event.type) {
              case "token":
                fullText += event.content;
                yield {
                  content: [{ type: "text" as const, text: fullText }],
                };
                break;

              case "tool_start":
                yield {
                  content: [
                    { type: "text" as const, text: fullText },
                    {
                      type: "tool-call" as const,
                      toolCallId: (event as any).tool_call_id ?? event.name,
                      toolName: event.name,
                      args: event.input,
                    },
                  ],
                };
                break;

              case "tool_end":
                break;

              case "error":
                fullText += `\n\nError: ${event.message}`;
                yield {
                  content: [{ type: "text" as const, text: fullText }],
                };
                break;

              case "done":
                return;
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    },
  };
}
