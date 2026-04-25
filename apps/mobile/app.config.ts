import type { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Votrix",
  slug: "votrix",
  version: "1.0.0",
  scheme: "votrix",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.votrix.app",
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: "com.votrix.app",
  },
  plugins: ["expo-router"],
  extra: {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    BACKEND_URL: process.env.BACKEND_URL,
    eas: { projectId: process.env.EAS_PROJECT_ID },
  },
});
