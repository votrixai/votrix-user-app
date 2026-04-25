import { useEffect, useMemo, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import {
  AssistantRuntimeProvider,
  ThreadPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
  AuiIf,
  useAuiState,
  useLocalRuntime,
} from "@assistant-ui/react-native";
import { backendFetch } from "@/lib/api";
import { createBackendChatAdapter } from "@/lib/chat-adapter";
import type { SessionDetailResponse, SessionEventResponse } from "@votrix/shared";

export default function ChatScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const [initialLoaded, setInitialLoaded] = useState(false);

  const adapter = useMemo(
    () => createBackendChatAdapter(sessionId),
    [sessionId],
  );
  const runtime = useLocalRuntime(adapter);

  useEffect(() => {
    backendFetch(`/sessions/${sessionId}`)
      .then(async (res) => {
        if (!res.ok) return;
        const detail = (await res.json()) as SessionDetailResponse;
        loadInitialMessages(runtime, detail.events, sessionId);
      })
      .finally(() => setInitialLoaded(true));
  }, [sessionId]);

  if (!initialLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <View className="flex-1 bg-background">
        <ThreadPrimitive.Root style={{ flex: 1 }}>
          <ThreadPrimitive.Messages>
            {() => <ChatMessage />}
          </ThreadPrimitive.Messages>

          <View className="border-t border-border px-4 py-3">
            <ComposerPrimitive.Root>
              <View className="flex-row items-end rounded-2xl border border-border bg-background px-3">
                <ComposerPrimitive.Input
                  placeholder="Type a message..."
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    fontSize: 14,
                    maxHeight: 96,
                  }}
                />
                <ComposerPrimitive.Send
                  style={{
                    marginBottom: 8,
                    marginLeft: 8,
                    backgroundColor: "#171717",
                    borderRadius: 999,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                  }}
                />
              </View>
            </ComposerPrimitive.Root>
          </View>
        </ThreadPrimitive.Root>
      </View>
    </AssistantRuntimeProvider>
  );
}

function ChatMessage() {
  const role = useAuiState((s) => s.message.role);

  return (
    <MessagePrimitive.Root
      style={{
        paddingHorizontal: 16,
        paddingVertical: 8,
      }}
    >
      <View
        style={{
          alignSelf: role === "user" ? "flex-end" : "flex-start",
          maxWidth: "85%",
          backgroundColor: role === "user" ? "#171717" : "#F5F5F5",
          borderRadius: 16,
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        <MessagePrimitive.Content />
      </View>
    </MessagePrimitive.Root>
  );
}

function loadInitialMessages(
  runtime: ReturnType<typeof useLocalRuntime>,
  events: SessionEventResponse[],
  sessionId: string,
) {
  // Build thread messages from session events and append them to the runtime.
  // The runtime's thread.import() or similar API would be used here.
  // For now, messages are loaded through the adapter on first render.
  // TODO: Pre-populate thread with existing messages from session events.
}
