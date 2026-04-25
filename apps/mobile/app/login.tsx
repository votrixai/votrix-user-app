import { useState } from "react";
import { View, Text, TextInput, Pressable, Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { supabase } from "@/lib/supabase";

WebBrowser.maybeCompleteAuthSession();

type Provider = "google" | "facebook" | "apple";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const redirectTo = AuthSession.makeRedirectUri({ scheme: "votrix" });

  const handleOAuth = async (provider: Provider) => {
    setLoading(provider);
    setMessage(null);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo, skipBrowserRedirect: true },
    });

    if (error) {
      setMessage(error.message);
      setLoading(null);
      return;
    }

    if (data.url) {
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectTo,
      );

      if (result.type === "success") {
        const url = new URL(result.url);
        const params = new URLSearchParams(
          url.hash.startsWith("#") ? url.hash.slice(1) : url.search.slice(1),
        );
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        if (accessToken && refreshToken) {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
        }
      }
    }
    setLoading(null);
  };

  const handleMagicLink = async () => {
    if (!email.trim()) return;
    setLoading("magic-link");
    setMessage(null);

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectTo },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Check your email for the login link!");
    }
    setLoading(null);
  };

  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      <View className="w-full max-w-sm">
        <Text className="text-center text-2xl font-semibold text-foreground">
          Welcome to Votrix
        </Text>
        <Text className="mt-1 text-center text-sm text-muted-foreground">
          Sign in to continue
        </Text>

        <View className="mt-6 gap-3">
          <OAuthButton
            label="Continue with Google"
            onPress={() => handleOAuth("google")}
            loading={loading === "google"}
            disabled={loading !== null}
          />
          <OAuthButton
            label="Continue with Facebook"
            onPress={() => handleOAuth("facebook")}
            loading={loading === "facebook"}
            disabled={loading !== null}
          />
          {Platform.OS === "ios" && (
            <OAuthButton
              label="Continue with Apple"
              onPress={() => handleOAuth("apple")}
              loading={loading === "apple"}
              disabled={loading !== null}
            />
          )}
        </View>

        <View className="my-6 flex-row items-center">
          <View className="flex-1 border-t border-border" />
          <Text className="mx-3 text-xs text-muted-foreground">or</Text>
          <View className="flex-1 border-t border-border" />
        </View>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground"
          placeholderTextColor="#888"
        />
        <Pressable
          onPress={handleMagicLink}
          disabled={loading !== null}
          className="mt-3 w-full rounded-lg bg-primary px-4 py-3"
        >
          <Text className="text-center text-sm font-medium text-primary-foreground">
            {loading === "magic-link" ? "Sending..." : "Send magic link"}
          </Text>
        </Pressable>

        {message && (
          <Text
            className={`mt-4 text-center text-sm ${
              message.includes("Check your email")
                ? "text-green-500"
                : "text-destructive"
            }`}
          >
            {message}
          </Text>
        )}
      </View>
    </View>
  );
}

function OAuthButton({
  label,
  onPress,
  loading,
  disabled,
}: {
  label: string;
  onPress: () => void;
  loading: boolean;
  disabled: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="w-full rounded-lg border border-border bg-background px-4 py-3"
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <Text className="text-center text-sm font-medium text-foreground">
        {loading ? "Redirecting..." : label}
      </Text>
    </Pressable>
  );
}
