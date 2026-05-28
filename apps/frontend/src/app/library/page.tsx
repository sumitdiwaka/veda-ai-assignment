"use client";
import AppShell from "@/components/layout/AppShell";
import { useRouter } from "next/navigation";
import { useAssignmentStore } from "@/store/assignmentStore";
import { useEffect } from "react";

export default function LibraryPage() {
  const router = useRouter();
  const { assignments, fetchAssignments, loading } = useAssignmentStore();

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  const completed = assignments.filter(a => a.status === "completed");

  return (
    <AppShell title="My Library">
      <div style={{ padding: 24 }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a", marginBottom: 4 }}>My Library</h1>
          <p style={{ fontSize: 13, color: "#71717a" }}>All your generated question papers in one place</p>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
            <svg style={{ width: 24, height: 24, animation: "spin 1s linear infinite" }} fill="none" viewBox="0 0 24 24">
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              <circle cx="12" cy="12" r="10" stroke="#f97316" strokeWidth="4" style={{ opacity: 0.25 }}/>
              <path fill="#f97316" d="M4 12a8 8 0 018-8v8z" style={{ opacity: 0.75 }}/>
            </svg>
          </div>
        ) : completed.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", marginBottom: 8 }}>No papers yet</h3>
            <p style={{ fontSize: 13, color: "#71717a", marginBottom: 20, maxWidth: 280 }}>
              Generated question papers will appear here. Create your first assignment to get started.
            </p>
            <button
              onClick={() => router.push("/assignments/create")}
              style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "#1a1a1a", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
            >
              + Create Assignment
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {completed.map(a => (
              <div
                key={a._id}
                onClick={() => router.push(`/assignments/${a._id}`)}
                style={{ background: "#fff", borderRadius: 16, border: "1px solid #e4e4e7", padding: 20, cursor: "pointer", transition: "box-shadow 0.2s" }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)"}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = "none"}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                    📄
                  </div>
                  <div>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", marginBottom: 2 }}>{a.title}</h3>
                    <p style={{ fontSize: 11, color: "#71717a" }}>{a.subject} • {a.grade}</p>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#71717a" }}>
                  <span>Questions: <strong style={{ color: "#1a1a1a" }}>{a.totalQuestions}</strong></span>
                  <span>Marks: <strong style={{ color: "#1a1a1a" }}>{a.totalMarks}</strong></span>
                </div>
                <div style={{ marginTop: 10, padding: "6px 10px", background: "#dcfce7", borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 6, height: 6, background: "#16a34a", borderRadius: "50%" }} />
                  <span style={{ fontSize: 10, fontWeight: 600, color: "#16a34a" }}>Ready to view</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}