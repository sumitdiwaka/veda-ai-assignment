"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, ClipboardList, Wrench, BookOpen, Settings } from "lucide-react";
import { useAssignmentStore } from "@/store/assignmentStore";
import { useEffect } from "react";

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "My Groups", href: "/groups", icon: Users },
  { label: "Assignments", href: "/assignments", icon: ClipboardList },
  { label: "AI Teacher's Toolkit", href: "/toolkit", icon: Wrench },
  { label: "My Library", href: "/library", icon: BookOpen },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { assignments, fetchAssignments } = useAssignmentStore();

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  const assignmentCount = assignments.length;

  return (
    <aside style={{
      position: "fixed", left: 0, top: 0, height: "100vh", width: 200,
      background: "#fff", borderRight: "1px solid #e4e4e7",
      display: "flex", flexDirection: "column", zIndex: 30,
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "18px 16px 16px", borderBottom: "1px solid #e4e4e7" }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, overflow: "hidden", flexShrink: 0, background: "#f97316", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(249,115,22,0.35)" }}>
          {/* VedaAI Logo SVG */}
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M11 2L4 7.5V18h14V7.5L11 2z" fill="white" opacity="0.15"/>
            <path d="M11 2L4 7.5V18h14V7.5L11 2z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M8 18v-5h6v5" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
            <circle cx="11" cy="10" r="2" fill="white"/>
          </svg>
        </div>
        <span style={{ fontWeight: 800, fontSize: 17, color: "#1a1a1a", letterSpacing: "-0.5px" }}>VedaAI</span>
      </div>

      {/* Create Assignment Button */}
      <div style={{ padding: "14px 12px 10px" }}>
        <Link href="/assignments/create" style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          background: "#1a1a1a", color: "#fff", fontSize: 12, fontWeight: 700,
          padding: "11px 14px", borderRadius: 12, textDecoration: "none",
          boxShadow: "0 2px 8px rgba(0,0,0,0.18)", letterSpacing: "0.1px"
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="2" r="2" fill="#f97316"/>
          </svg>
          Create Assignment
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "4px 8px 0", display: "flex", flexDirection: "column", gap: 1 }}>
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          const isAssignments = href === "/assignments";

          return (
            <Link key={label} href={href} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "9px 12px", borderRadius: 10, fontSize: 13,
              fontWeight: isActive ? 600 : 500,
              background: isActive ? "#f4f4f5" : "transparent",
              color: isActive ? "#1a1a1a" : "#71717a",
              textDecoration: "none", transition: "all 0.15s"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Icon size={15} strokeWidth={isActive ? 2.2 : 1.8} />
                <span>{label}</span>
              </div>
              {/* ✅ Live assignment count badge */}
              {isAssignments && assignmentCount > 0 && (
                <span style={{
                  background: "#f97316", color: "#fff",
                  fontSize: 10, fontWeight: 700,
                  padding: "1px 6px", borderRadius: 999,
                  minWidth: 18, textAlign: "center",
                  lineHeight: "16px"
                }}>
                  {assignmentCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ borderTop: "1px solid #e4e4e7", padding: "10px 8px 12px" }}>
        <Link href="/settings" style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "9px 12px", borderRadius: 10, fontSize: 13,
          color: "#71717a", textDecoration: "none", marginBottom: 4, fontWeight: 500
        }}>
          <Settings size={15} strokeWidth={1.8} />
          <span>Settings</span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 10, background: "#f9f9f9" }}>
          {/* School avatar with image */}
          <div style={{ width: 34, height: 34, borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: "2px solid #e4e4e7" }}>
            <img
              src="https://api.dicebear.com/7.x/initials/svg?seed=Delhi+Public+School&backgroundColor=f97316&textColor=ffffff"
              alt="School"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                target.parentElement!.style.background = "#f97316";
                target.parentElement!.innerHTML = '<span style="color:#fff;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;height:100%">D</span>';
              }}
            />
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#1a1a1a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              Delhi Public School
            </p>
            <p style={{ fontSize: 10, color: "#71717a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              Bokaro Steel City
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}