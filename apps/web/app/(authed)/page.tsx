import NewChatLanding from "@/components/new-chat-landing";

// This page is rendered server-side but only displayed when AuthedShell
// has no employees to show (AuthedShell overrides children on "/" with EmployeeHome).
export default function Home() {
  return <NewChatLanding employees={[]} />;
}
