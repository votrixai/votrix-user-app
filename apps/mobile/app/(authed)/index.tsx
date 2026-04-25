import { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { backendFetch } from "@/lib/api";
import type { AgentConfig, SessionCreateResponse } from "@votrix/shared";

export default function HomeScreen() {
  const router = useRouter();
  const [agents, setAgents] = useState<AgentConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState<string | null>(null);

  useEffect(() => {
    backendFetch("/agents")
      .then(async (res) => {
        if (res.ok) setAgents(await res.json());
      })
      .finally(() => setLoading(false));
  }, []);

  const startChat = async (slug: string) => {
    setCreating(slug);
    try {
      const res = await backendFetch("/sessions", {
        method: "POST",
        body: JSON.stringify({ agent_slug: slug }),
      });
      if (res.ok) {
        const data = (await res.json()) as SessionCreateResponse;
        router.push(`/c/${data.id}`);
      }
    } finally {
      setCreating(null);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
        padding: 24,
      }}
    >
      <Text className="mb-2 text-center text-2xl font-semibold text-foreground">
        Start a new chat
      </Text>
      <Text className="mb-8 text-center text-sm text-muted-foreground">
        Choose an agent to begin.
      </Text>

      {loading ? (
        <ActivityIndicator />
      ) : agents.length === 0 ? (
        <Text className="text-center text-sm text-muted-foreground">
          No agents available.
        </Text>
      ) : (
        <View className="w-full gap-3">
          {agents.map((a) => (
            <Pressable
              key={a.slug}
              onPress={() => startChat(a.slug)}
              disabled={creating !== null}
              className="rounded-lg border border-border bg-background p-4"
              style={{ opacity: creating !== null ? 0.5 : 1 }}
            >
              <Text className="font-medium text-foreground">{a.name}</Text>
              <Text className="text-xs text-muted-foreground">
                {creating === a.slug ? "Creating..." : a.model}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
