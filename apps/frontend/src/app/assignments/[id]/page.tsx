"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Download, RefreshCw, ArrowLeft, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import AppShell from "@/components/layout/AppShell";
import { paperService } from "@/services/paperService";
import { assignmentService } from "@/services/assignmentService";
import { useWebSocket } from "@/hooks/useWebSocket";
import type { QuestionPaper, Question, Section } from "@/types/paper";

// ── Difficulty Badge ──────────────────────────────────────────────────────────
function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    easy:   { bg: "#dcfce7", color: "#16a34a", label: "Easy" },
    medium: { bg: "#fef9c3", color: "#ca8a04", label: "Moderate" },
    hard:   { bg: "#fee2e2", color: "#dc2626", label: "Challenging" },
  };
  const s = map[difficulty] || map.medium;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "2px 8px", borderRadius: 999,
      fontSize: 10, fontWeight: 700,
      background: s.bg, color: s.color,
      flexShrink: 0
    }}>
      {s.label}
    </span>
  );
}

// ── Single Question ───────────────────────────────────────────────────────────
function QuestionItem({ question, number }: { question: Question; number: number }) {
  return (
    <div style={{ marginBottom: 18, paddingBottom: 18, borderBottom: "1px solid #f4f4f5" }}>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        {/* Number */}
        <span style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", flexShrink: 0, minWidth: 24 }}>
          {number}.
        </span>

        <div style={{ flex: 1 }}>
          {/* Question text + badges */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
            <p style={{ fontSize: 13, color: "#1a1a1a", lineHeight: 1.6, flex: 1 }}>
              {question.text}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
              <DifficultyBadge difficulty={question.difficulty} />
              <span style={{ fontSize: 11, color: "#71717a", whiteSpace: "nowrap" }}>
                [{question.marks} Mark{question.marks > 1 ? "s" : ""}]
              </span>
            </div>
          </div>

          {/* MCQ Options */}
          {question.options && question.options.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px", marginTop: 8 }}>
              {question.options.map((opt, i) => (
                <p key={i} style={{ fontSize: 12, color: "#3f3f46", lineHeight: 1.5 }}>{opt}</p>
              ))}
            </div>
          )}

          {/* Answer line for short/fill/true-false */}
          {(question.type === "short_answer" || question.type === "fill_blank" || question.type === "true_false") && (
            <div style={{ marginTop: 8 }}>
              <div style={{ height: 1, background: "#e4e4e7", marginBottom: 6 }} />
              <div style={{ height: 1, background: "#e4e4e7" }} />
            </div>
          )}

          {/* Long answer lines */}
          {question.type === "long_answer" && (
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 10 }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{ height: 1, background: "#e4e4e7" }} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Section Block ─────────────────────────────────────────────────────────────
function SectionBlock({ section, startNumber }: { section: Section; startNumber: number }) {
  return (
    <div style={{ marginBottom: 28 }}>
      {/* Section header */}
      <div style={{
        background: "#1a1a1a", borderRadius: 8,
        padding: "10px 16px", marginBottom: 12,
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", letterSpacing: "0.5px" }}>
          {section.title.toUpperCase()}
        </span>
        <span style={{ fontSize: 11, color: "#a1a1aa" }}>
          [{section.totalMarks} Marks]
        </span>
      </div>

      {/* Instruction */}
      <p style={{ fontSize: 12, color: "#71717a", fontStyle: "italic", marginBottom: 14, paddingLeft: 4 }}>
        {section.instruction}
      </p>

      {/* Questions */}
      {section.questions.map((q, i) => (
        <QuestionItem key={q.id} question={q} number={startNumber + i} />
      ))}
    </div>
  );
}

// ── Loading State ─────────────────────────────────────────────────────────────
function LoadingState({ progress, message }: { progress: number; message: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 20px", textAlign: "center" }}>
      <div style={{ position: "relative", width: 100, height: 100, marginBottom: 28 }}>
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" fill="none" stroke="#e4e4e7" strokeWidth="6" />
          <circle
            cx="50" cy="50" r="44" fill="none"
            stroke="#f97316" strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 44}`}
            strokeDashoffset={`${2 * Math.PI * 44 * (1 - progress / 100)}`}
            transform="rotate(-90 50 50)"
            style={{ transition: "stroke-dashoffset 0.5s ease" }}
          />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a" }}>{progress}%</span>
        </div>
      </div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a", marginBottom: 8 }}>Generating Question Paper</h2>
      <p style={{ fontSize: 13, color: "#71717a", marginBottom: 24, maxWidth: 300 }}>{message}</p>
      <div style={{ width: 280, height: 6, background: "#e4e4e7", borderRadius: 999, overflow: "hidden" }}>
        <div style={{ height: "100%", background: "linear-gradient(90deg,#f97316,#ea580c)", width: `${progress}%`, transition: "width 0.5s ease", borderRadius: 999 }} />
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AssignmentOutputPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [paper, setPaper] = useState<QuestionPaper | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [jobProgress, setJobProgress] = useState(0);
  const [jobMessage, setJobMessage] = useState("Loading...");
  const [isPending, setIsPending] = useState(false);

  // WebSocket for real-time updates
  useWebSocket(id, (event) => {
    if (event.type === "job:processing" || event.type === "job:progress") {
      setIsPending(true);
      setJobProgress(event.progress || 10);
      setJobMessage(event.message || "Processing...");
    }
    if (event.type === "job:completed") {
      setJobProgress(100);
      setJobMessage("Done!");
      setTimeout(() => {
        setIsPending(false);
        fetchPaper();
      }, 800);
    }
    if (event.type === "job:failed") {
      setIsPending(false);
      setRegenerating(false);
      toast.error("Generation failed. Please try again.");
    }
  });

  const fetchPaper = async () => {
    try {
      const data = await paperService.getByAssignment(id);
      setPaper(data);
      setIsPending(false);
    } catch {
      // Paper not ready yet — check assignment status
      try {
        const assignment = await assignmentService.getById(id);
        if (assignment.status === "pending" || assignment.status === "processing") {
          setIsPending(true);
          setJobProgress(20);
          setJobMessage("AI is generating your question paper...");
        } else {
          toast.error("Paper not found");
        }
      } catch {
        toast.error("Assignment not found");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaper();
  }, [id]);

const handleRegenerate = async () => {
  if (!confirm("Are you sure you want to regenerate? Current paper will be replaced.")) return;
  
  setRegenerating(true);
  setPaper(null);
  
  try {
    await assignmentService.regenerate(id);
    setIsPending(true);
    setJobProgress(5);
    setJobMessage("Regeneration queued — AI is working...");
    toast.success("Regeneration started!");

    // ✅ Poll for completion
    let attempts = 0;
    const poll = setInterval(async () => {
      attempts++;
      try {
        const assignment = await assignmentService.getById(id);
        
        if (assignment.status === "completed" && assignment.paperId) {
          clearInterval(poll);
          setJobProgress(100);
          setJobMessage("Done! Loading paper...");
          setTimeout(async () => {
            const newPaper = await paperService.getByAssignment(id);
            setPaper(newPaper);
            setIsPending(false);
            setRegenerating(false);
            toast.success("Paper regenerated!");
          }, 500);
          
        } else if (assignment.status === "failed") {
          clearInterval(poll);
          setIsPending(false);
          setRegenerating(false);
          toast.error("Regeneration failed. Try again.");
          
        } else if (assignment.status === "processing") {
          setJobProgress(Math.min(10 + attempts * 8, 85));
          setJobMessage("AI is generating your question paper...");
          
        } else {
          setJobProgress(10);
          setJobMessage("Waiting for worker...");
        }

        if (attempts >= 40) {
          clearInterval(poll);
          setIsPending(false);
          setRegenerating(false);
          toast.error("Timed out. Please refresh.");
        }
      } catch { /* ignore */ }
    }, 3000);

  } catch (err) {
    toast.error("Failed to start regeneration");
    setRegenerating(false);
    setIsPending(false);
    // Reload original paper
    fetchPaper();
  }
};

const handleDownload = async () => {
  if (!paper) return;
  
  const url = paperService.getDownloadUrl(paper._id);
  
  try {
    // Direct window.open se PDF download hoga
    const link = document.createElement("a");
    link.href = url;
    link.download = `${paper.subject}-${paper.grade}-exam.pdf`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("PDF downloading...");
  } catch {
    toast.error("Download failed");
  }
};

  // Count questions per section for numbering
  let qCounter = 1;

  if (loading) {
    return (
      <AppShell title="Assignment" showBack>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
          <LoadingState progress={10} message="Loading..." />
        </div>
      </AppShell>
    );
  }

  if (isPending || !paper) {
    return (
      <AppShell title="Assignment" showBack>
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "40px 20px" }}>
          <LoadingState progress={jobProgress} message={jobMessage} />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Grade Now" showBack>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "20px 20px 60px" }}>

        {/* AI Message Banner */}
        <div style={{
          background: "#1a1a1a", borderRadius: 12, padding: "14px 18px",
          marginBottom: 20, display: "flex", alignItems: "flex-start",
          justifyContent: "space-between", gap: 16
        }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start", flex: 1 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#f97316", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 14 }}>✨</span>
            </div>
            <div>
              <p style={{ fontSize: 13, color: "#e4e4e7", lineHeight: 1.5 }}>
                Certainly! Here are customized Question Paper for your{" "}
                <strong style={{ color: "#fff" }}>CBSE {paper.grade} {paper.subject}</strong>{" "}
                class on the <strong style={{ color: "#fff" }}>{paper.topic}</strong> chapter.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 14px", borderRadius: 8,
                border: "1px solid #3f3f46", background: "transparent",
                fontSize: 12, fontWeight: 600, color: "#e4e4e7",
                cursor: "pointer"
              }}
            >
              <RefreshCw size={13} style={{ animation: regenerating ? "spin 1s linear infinite" : "none" }} />
              Regenerate
            </button>
            <button
              onClick={handleDownload}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 14px", borderRadius: 8,
                border: "none", background: "#fff",
                fontSize: 12, fontWeight: 600, color: "#1a1a1a",
                cursor: "pointer"
              }}
            >
              <Download size={13} />
              Download as PDF
            </button>
          </div>
        </div>

        {/* Question Paper */}
        <div style={{
          background: "#fff", borderRadius: 16,
          border: "1px solid #e4e4e7",
          padding: "40px 48px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)"
        }}>
          {/* School Header */}
          <div style={{ textAlign: "center", marginBottom: 24, paddingBottom: 20, borderBottom: "2px solid #1a1a1a" }}>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "#1a1a1a", marginBottom: 4 }}>
              Delhi Public School, Sector-4, Bokaro
            </h1>
            <p style={{ fontSize: 14, color: "#3f3f46", marginBottom: 2 }}>
              Subject: {paper.subject}
            </p>
            <p style={{ fontSize: 14, color: "#3f3f46" }}>
              Class: {paper.grade}
            </p>
          </div>

          {/* Time + Marks row */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <p style={{ fontSize: 13, color: "#3f3f46" }}>
              Time Allowed: <strong>{paper.duration || 45} minutes</strong>
            </p>
            <p style={{ fontSize: 13, color: "#3f3f46" }}>
              Maximum Marks: <strong>{paper.totalMarks}</strong>
            </p>
          </div>

          {/* General Instructions */}
          {paper.generalInstructions.length > 0 && (
            <div style={{ marginBottom: 20, padding: "12px 16px", background: "#fafafa", borderRadius: 8, border: "1px solid #f0f0f0" }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#1a1a1a", marginBottom: 6 }}>
                General Instructions:
              </p>
              {paper.generalInstructions.map((inst, i) => (
                <p key={i} style={{ fontSize: 12, color: "#3f3f46", lineHeight: 1.6 }}>
                  {i + 1}. {inst}
                </p>
              ))}
            </div>
          )}

          {/* Student Info */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 28, paddingBottom: 20, borderBottom: "1px solid #e4e4e7" }}>
            {["Name", "Roll Number", "Section"].map((label) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#3f3f46", whiteSpace: "nowrap" }}>
                  {label}:
                </span>
                <div style={{ flex: 1, height: 1, background: "#1a1a1a", marginTop: 2 }} />
              </div>
            ))}
          </div>

          {/* Sections */}
          {paper.sections.map((section) => {
            const start = qCounter;
            qCounter += section.questions.length;
            return (
              <SectionBlock
                key={section.id}
                section={section}
                startNumber={start}
              />
            );
          })}

          {/* End of Paper */}
          <div style={{ textAlign: "center", marginTop: 24, paddingTop: 16, borderTop: "1px solid #e4e4e7" }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#71717a", letterSpacing: "0.5px" }}>
              *** End of Question Paper ***
            </p>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div style={{
          display: "flex", justifyContent: "center", gap: 12,
          marginTop: 20
        }}>
          <button
            onClick={() => router.push("/assignments")}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 20px", borderRadius: 10,
              border: "1px solid #e4e4e7", background: "#fff",
              fontSize: 13, fontWeight: 600, color: "#1a1a1a",
              cursor: "pointer"
            }}
          >
            <ArrowLeft size={15} />
            Back to Assignments
          </button>

          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 20px", borderRadius: 10,
              border: "none", background: "#1a1a1a",
              fontSize: 13, fontWeight: 600, color: "#fff",
              cursor: "pointer", opacity: regenerating ? 0.6 : 1
            }}
          >
            <RefreshCw size={14} />
            {regenerating ? "Regenerating..." : "Regenerate Paper"}
          </button>

          <button
            onClick={handleDownload}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 20px", borderRadius: 10,
              border: "none", background: "#f97316",
              fontSize: 13, fontWeight: 600, color: "#fff",
              cursor: "pointer"
            }}
          >
            <Download size={14} />
            Download PDF
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </AppShell>
  );
}