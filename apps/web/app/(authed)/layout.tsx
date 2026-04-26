import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/sidebar";

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
    <div className="flex h-dvh">
      <Sidebar email={user?.email ?? ""} userId={user?.id ?? ""} />
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
