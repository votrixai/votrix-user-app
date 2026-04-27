import type { ExpoConfig, ConfigContext } from "expo/config";

const backendUrl = process.env.BACKEND_URL ?? "";
const usesLocalHttpBackend =
  backendUrl.startsWith("http://") &&
  /\/\/(localhost|127\.0\.0\.1|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(
    backendUrl,
  );

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Votrix",
  slug: "votrix",
  version: "1.0.0",
  scheme: "votrix",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.votrix.app",
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      NSLocalNetworkUsageDescription:
        "Votrix connects to a local development backend on your network.",
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: usesLocalHttpBackend,
        NSAllowsLocalNetworking: true,
      },
    },
  },
  android: {
    package: "com.votrix.app",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#FFFFFF",
    },
  },
  plugins: ["expo-router"],
  extra: {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY: process.env.SUPABASE_PUBLISHABLE_KEY,
    BACKEND_URL: process.env.BACKEND_URL,
    eas: { projectId: process.env.EAS_PROJECT_ID },
  },
});
