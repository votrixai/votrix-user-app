import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter, usePathname } from "expo-router";
import { supabase } from "@/lib/supabase";
import { backendFetch } from "@/lib/api";
import { groupSessions, sessionLabel } from "@/lib/sessions";
import type { SessionResponse } from "@votrix/shared";

export default function SessionDrawerContent(_props: any) {
  const router = useRouter();
  const pathname = usePathname();
  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await backendFetch("/sessions");
      if (res.ok) setSessions(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const groups = groupSessions(sessions);

  const deleteSession = (s: SessionResponse) => {
    Alert.alert("Delete chat?", `This will delete "${sessionLabel(s)}".`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await backendFetch(`/sessions/${s.id}`, { method: "DELETE" });
          fetchSessions();
          if (pathname.includes(s.id)) router.replace("/");
        },
      },
    ]);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <View className="flex-1 bg-background pt-12">
      <Pressable
        onPress={() => router.push("/")}
        className="mx-3 mb-2 rounded-md bg-primary px-4 py-2.5"
      >
        <Text className="text-center text-sm font-medium text-primary-foreground">
          New Chat
        </Text>
      </Pressable>

      <ScrollView className="flex-1 px-3 py-2">
        {loading && <ActivityIndicator className="my-4" />}
        {groups.map((g) => (
          <View key={g.label} className="mb-4">
            <Text className="px-2 pb-1 text-xs font-medium text-muted-foreground">
              {g.label}
            </Text>
            {g.sessions.map((s) => (
              <Pressable
                key={s.id}
                onPress={() => router.push(`/c/${s.id}`)}
                onLongPress={() => deleteSession(s)}
                className="rounded-md px-2 py-2.5"
              >
                <Text className="text-sm text-foreground" numberOfLines={1}>
                  {sessionLabel(s)}
                </Text>
              </Pressable>
            ))}
          </View>
        ))}
      </ScrollView>

      <View className="border-t border-border p-3">
        <Pressable
          onPress={handleSignOut}
          className="rounded-md px-2 py-2.5"
        >
          <Text className="text-sm text-muted-foreground">Sign Out</Text>
        </Pressable>
      </View>
    </View>
  );
}
