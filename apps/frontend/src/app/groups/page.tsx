"use client";
import AppShell from "@/components/layout/AppShell";

export default function GroupsPage() {
  return (
    <AppShell title="My Groups">
      <div style={{ padding: 32, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: "#f4f4f5", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="1.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a", marginBottom: 8 }}>My Groups</h2>
        <p style={{ fontSize: 13, color: "#71717a", textAlign: "center", maxWidth: 300 }}>
          Group management feature coming soon. You'll be able to organize students into classes and groups.
        </p>
      </div>
    </AppShell>
  );
}