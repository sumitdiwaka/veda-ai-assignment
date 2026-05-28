import Sidebar from "./Sidebar";
import Header from "./Header";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
}

export default function AppShell({ children, title, showBack }: AppShellProps) {
  return (
    <div style={{ minHeight: "100vh", background: "#f4f4f5" }}>
      <Sidebar />
      <Header title={title} showBack={showBack} />
      <main style={{ marginLeft: 200, paddingTop: 56, minHeight: "100vh" }}>
        {children}
      </main>
    </div>
  );
}