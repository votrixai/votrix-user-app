import { createClient } from "@/lib/supabase/server";
import { AuthedShell } from "@/components/authed-shell";

export default async function AuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
