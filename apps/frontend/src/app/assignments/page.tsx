"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Filter, Search, MoreVertical, Trash2, Eye } from "lucide-react";
import toast from "react-hot-toast";
import AppShell from "@/components/layout/AppShell";
import { useAssignmentStore } from "@/store/assignmentStore";
import { assignmentService } from "@/services/assignmentService";
import type { Assignment } from "@/types/assignment";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";

function EmptyState() {
  const router = useRouter();
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 16px" }}>
      <div style={{ position: "relative", width: 160, height: 160, marginBottom: 24 }}>
        <div style={{ position: "absolute", inset: 0, background: "#f4f4f5", borderRadius: "50%" }} />
        <div style={{ position: "absolute", inset: 16, background: "#fff", borderRadius: "50%", boxShadow: "inset 0 2px 8px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <rect x="16" y="10" width="48" height="60" rx="4" fill="#f4f4f5" stroke="#e4e4e7" strokeWidth="1.5"/>
            <rect x="24" y="22" width="32" height="3" rx="1.5" fill="#d4d4d8"/>
            <rect x="24" y="30" width="24" height="3" rx="1.5" fill="#d4d4d8"/>
            <rect x="24" y="38" width="28" height="3" rx="1.5" fill="#d4d4d8"/>
            <circle cx="52" cy="52" r="16" fill="white" stroke="#e4e4e7" strokeWidth="1.5"/>
            <line x1="43" y1="52" x2="61" y2="52" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="52" y1="43" x2="52" y2="61" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="62" cy="62" r="6" fill="#ef4444"/>
            <line x1="59.5" y1="62" x2="64.5" y2="62" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="22" cy="16" r="3" fill="#f97316" opacity="0.6"/>
            <circle cx="64" cy="20" r="2" fill="#3b82f6" opacity="0.5"/>
          </svg>
        </div>
      </div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a", marginBottom: 8 }}>No assignments yet</h2>
      <p style={{ fontSize: 13, color: "#71717a", textAlign: "center", maxWidth: 320, marginBottom: 24, lineHeight: 1.6 }}>
        Create your first assignment to start collecting and grading student submissions.
        You can set up rubrics, define marking criteria, and let AI assist with grading.
      </p>
      <button
        onClick={() => router.push("/assignments/create")}
        style={{ display: "flex", alignItems: "center", gap: 8, background: "#1a1a1a", color: "#fff", fontSize: 13, fontWeight: 600, padding: "10px 20px", borderRadius: 12, border: "none", cursor: "pointer" }}
      >
        <Plus size={15} />
        Create Your First Assignment
      </button>
    </div>
  );
}

function AssignmentCard({ assignment, onDelete }: { 
  assignment: Assignment; 
  onDelete: (id: string) => void 
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const fmt = (d: string) => new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit", month: "2-digit", year: "numeric"
  });

  const statusStyle: Record<string, { bg: string; color: string }> = {
    pending:    { bg: "#fef3c7", color: "#d97706" },
    processing: { bg: "#fef3c7", color: "#d97706" },
    completed:  { bg: "#dcfce7", color: "#16a34a" },
    failed:     { bg: "#fee2e2", color: "#dc2626" },
  };
  const st = statusStyle[assignment.status] || statusStyle.pending;

  const handleCardClick = () => {
    router.push(`/assignments/${assignment._id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      style={{
        background: "#fff", borderRadius: 12,
        border: "1px solid #e4e4e7", padding: 16,
        position: "relative", cursor: "pointer",
        transition: "box-shadow 0.2s, transform 0.1s",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.10)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-1px)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 10 }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a", lineHeight: 1.4 }}>
          {assignment.title}
        </h3>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <button
            onClick={e => { e.stopPropagation(); setMenuOpen(p => !p); }}
            style={{ padding: 6, borderRadius: 8, border: "none", background: "none", cursor: "pointer" }}
          >
            <MoreVertical size={15} color="#71717a" />
          </button>
          {menuOpen && (
            <>
              <div
                style={{ position: "fixed", inset: 0, zIndex: 10 }}
                onClick={e => { e.stopPropagation(); setMenuOpen(false); }}
              />
              <div style={{
                position: "absolute", right: 0, top: 32, zIndex: 20,
                background: "#fff", border: "1px solid #e4e4e7",
                borderRadius: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                width: 160, overflow: "hidden"
              }}>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    router.push(`/assignments/${assignment._id}`);
                  }}
                  style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 12px", fontSize: 12, color: "#1a1a1a", background: "none", border: "none", cursor: "pointer" }}
                >
                  <Eye size={13} /> View Assignment
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onDelete(assignment._id);
                  }}
                  style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 12px", fontSize: 12, color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Status */}
      <div style={{ marginBottom: 12 }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          fontSize: 10, fontWeight: 600, padding: "2px 8px",
          borderRadius: 999, background: st.bg, color: st.color
        }}>
          {assignment.status === "processing" && (
            <span style={{ width: 5, height: 5, background: st.color, borderRadius: "50%", animation: "pulse 1s infinite" }} />
          )}
          {assignment.status === "completed" && (
            <span style={{ width: 5, height: 5, background: "#16a34a", borderRadius: "50%" }} />
          )}
          {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
        </span>
      </div>

      {/* Marks info */}
      <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
        <span style={{ fontSize: 11, color: "#71717a" }}>
          Questions: <strong style={{ color: "#1a1a1a" }}>{assignment.totalQuestions}</strong>
        </span>
        <span style={{ fontSize: 11, color: "#71717a" }}>
          Marks: <strong style={{ color: "#1a1a1a" }}>{assignment.totalMarks}</strong>
        </span>
      </div>

      {/* Dates */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, color: "#71717a" }}>
          Assigned on : <strong style={{ color: "#1a1a1a" }}>{fmt(assignment.createdAt)}</strong>
        </span>
        <span style={{ fontSize: 11, color: "#71717a" }}>
          Due : <strong style={{ color: "#1a1a1a" }}>{fmt(assignment.dueDate)}</strong>
        </span>
      </div>
    </div>
  );
}

export default function AssignmentsPage() {
  const router = useRouter();
  const { assignments, loading, fetchAssignments, removeAssignment } = useAssignmentStore();
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  const filtered = assignments.filter(a => a.title.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await assignmentService.delete(deleteId);
      removeAssignment(deleteId);
      toast.success("Assignment deleted");
    } catch { toast.error("Failed to delete"); }
    finally { setDeleting(false); setDeleteId(null); }
  };

  return (
    <AppShell title="Assignment">
      <div style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ width: 8, height: 8, background: "#22c55e", borderRadius: "50%", display: "inline-block" }} />
          <h1 style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a" }}>Assignments</h1>
          {assignments.length > 0 && (
            <span style={{ background: "#f97316", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 999, marginLeft: 4 }}>
              {assignments.length}
            </span>
          )}
        </div>
        <p style={{ fontSize: 12, color: "#71717a", marginBottom: 20 }}>Manage and create assignments for your classes.</p>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", paddingTop: 120 }}><Spinner /></div>
        ) : assignments.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Filter + Search */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <button style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#71717a", border: "1px solid #e4e4e7", padding: "8px 12px", borderRadius: 8, background: "#fff", cursor: "pointer" }}>
                <Filter size={13} /> Filter by
              </button>
              <div style={{ flex: 1, position: "relative" }}>
                <Search size={13} color="#71717a" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="text"
                  placeholder="Search Assignment"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ width: "100%", paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, fontSize: 12, border: "1px solid #e4e4e7", borderRadius: 8, outline: "none", background: "#fff", fontFamily: "inherit" }}
                />
              </div>
            </div>

            {/* Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
              {filtered.map(a => <AssignmentCard key={a._id} assignment={a} onDelete={setDeleteId} />)}
            </div>

            {/* Floating button */}
            <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 20 }}>
              <button
                onClick={() => router.push("/assignments/create")}
                style={{ display: "flex", alignItems: "center", gap: 8, background: "#1a1a1a", color: "#fff", fontSize: 13, fontWeight: 600, padding: "12px 24px", borderRadius: 999, border: "none", cursor: "pointer", boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}
              >
                <Plus size={15} /> Create Assignment
              </button>
            </div>
          </>
        )}
      </div>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Assignment">
        <p style={{ fontSize: 13, color: "#71717a", marginBottom: 20 }}>Are you sure? This cannot be undone.</p>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button variant="secondary" size="sm" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" size="sm" loading={deleting} onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </AppShell>
  );
}