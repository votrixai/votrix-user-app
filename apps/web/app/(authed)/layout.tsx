import { createClient } from "@/lib/supabase/server";
import { AuthedShell } from "@/components/authed-shell";

export default async function AuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (process.env.NEXT_PUBLIC_MOCK === "true") {
    return (
      <AuthedShell email="mock@votrix.ai" userId="mock-user-1">
        {children}
      </AuthedShell>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <AuthedShell email={user?.email ?? ""} userId={user?.id ?? ""}>
      {children}
    </AuthedShell>
  );
}
