import { supabase } from "./supabase";
import Constants from "expo-constants";

const BACKEND_URL = Constants.expoConfig?.extra?.BACKEND_URL as string;

export async function backendFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = new Headers(init.headers);
  if (session?.access_token) {
    headers.set("Authorization", `Bearer ${session.access_token}`);
  }
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(`${BACKEND_URL}${path}`, { ...init, headers });
}
