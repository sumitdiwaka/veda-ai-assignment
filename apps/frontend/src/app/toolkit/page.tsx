"use client";
import AppShell from "@/components/layout/AppShell";
import { useRouter } from "next/navigation";

const tools = [
  { icon: "📝", title: "Question Generator", desc: "Generate custom questions from any topic or document", action: "Create Assignment" },
  { icon: "📊", title: "Rubric Builder", desc: "Build detailed grading rubrics for any assignment", action: "Coming Soon" },
  { icon: "🎯", title: "Learning Objectives", desc: "Auto-generate learning objectives aligned to curriculum", action: "Coming Soon" },
  { icon: "📈", title: "Progress Tracker", desc: "Track student progress and performance analytics", action: "Coming Soon" },
  { icon: "🔍", title: "Plagiarism Checker", desc: "Check student submissions for originality", action: "Coming Soon" },
  { icon: "💡", title: "Lesson Planner", desc: "AI-powered lesson plan generator", action: "Coming Soon" },
];

export default function ToolkitPage() {
  const router = useRouter();
  return (
    <AppShell title="AI Teacher's Toolkit">
      <div style={{ padding: 24 }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a", marginBottom: 4 }}>AI Teacher's Toolkit</h1>
          <p style={{ fontSize: 13, color: "#71717a" }}>Powerful AI tools to supercharge your teaching</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {tools.map((tool, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 16, border: "1px solid #e4e4e7", padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontSize: 32 }}>{tool.icon}</div>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a", marginBottom: 6 }}>{tool.title}</h3>
                <p style={{ fontSize: 12, color: "#71717a", lineHeight: 1.6 }}>{tool.desc}</p>
              </div>
              <button
                onClick={() => tool.action === "Create Assignment" ? router.push("/assignments/create") : null}
                style={{
                  marginTop: "auto", padding: "8px 16px", borderRadius: 8,
                  border: tool.action === "Coming Soon" ? "1px solid #e4e4e7" : "none",
                  background: tool.action === "Coming Soon" ? "#f4f4f5" : "#1a1a1a",
                  color: tool.action === "Coming Soon" ? "#71717a" : "#fff",
                  fontSize: 12, fontWeight: 600,
                  cursor: tool.action === "Coming Soon" ? "not-allowed" : "pointer",
                }}
              >
                {tool.action}
              </button>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}