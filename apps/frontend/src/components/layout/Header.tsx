"use client";
import { Bell, ChevronDown, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  title?: string;
  showBack?: boolean;
}

export default function Header({ title = "Assignment", showBack = false }: HeaderProps) {
  const router = useRouter();

  return (
    <header style={{
      position: "fixed", top: 0, left: 200, right: 0, height: 56,
      background: "#fff", borderBottom: "1px solid #e4e4e7",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 20px", zIndex: 20
    }}>
      {/* Left */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {showBack && (
          <button
            onClick={() => router.back()}
            style={{ padding: "6px", borderRadius: 8, border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center" }}
          >
            <ArrowLeft size={16} color="#71717a" />
          </button>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Grid icon */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2.5, width: 16, height: 16 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ width: 6, height: 6, background: "#a1a1aa", borderRadius: 2 }} />
            ))}
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>{title}</span>
        </div>
      </div>

      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Bell */}
        <button style={{
          position: "relative", padding: 8, borderRadius: 10,
          border: "none", background: "none", cursor: "pointer",
          display: "flex", alignItems: "center"
        }}>
          <Bell size={18} color="#71717a" />
          <span style={{
            position: "absolute", top: 6, right: 6,
            width: 7, height: 7, background: "#f97316",
            borderRadius: "50%", border: "1.5px solid #fff"
          }} />
        </button>

        {/* User */}
        <button style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "5px 10px 5px 5px", borderRadius: 10,
          border: "none", background: "none", cursor: "pointer"
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: "50%",
            background: "#d4d4d8", display: "flex",
            alignItems: "center", justifyContent: "center"
          }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#52525b" }}>J</span>
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>John Doe</span>
          <ChevronDown size={14} color="#71717a" />
        </button>
      </div>
    </header>
  );
}