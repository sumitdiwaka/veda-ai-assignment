"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import {
    Upload, X, Plus, Minus, ChevronDown,
    Calendar, Mic, ArrowLeft, ArrowRight
} from "lucide-react";
import toast from "react-hot-toast";
import AppShell from "@/components/layout/AppShell";
import { useCreateStore } from "@/store/createStore";
import { assignmentService } from "@/services/assignmentService";
import { useWebSocket } from "@/hooks/useWebSocket";
import { QUESTION_TYPE_OPTIONS, type QuestionType } from "@/types/assignment";

// ── Step Indicator ────────────────────────────────────────────────────────────
function StepIndicator({ current }: { current: number }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 28 }}>
            {[1, 2].map((step, i) => (
                <div key={step} style={{ display: "flex", alignItems: "center", flex: i === 0 ? 1 : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{
                            width: 28, height: 28, borderRadius: "50%",
                            background: current >= step ? "#1a1a1a" : "#e4e4e7",
                            color: current >= step ? "#fff" : "#71717a",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 12, fontWeight: 700, flexShrink: 0
                        }}>
                            {step}
                        </div>
                        <span style={{
                            fontSize: 12, fontWeight: current === step ? 600 : 400,
                            color: current === step ? "#1a1a1a" : "#71717a"
                        }}>
                            {step === 1 ? "Assignment Details" : "Review & Generate"}
                        </span>
                    </div>
                    {i === 0 && (
                        <div style={{
                            flex: 1, height: 2, margin: "0 12px",
                            background: current >= 2 ? "#1a1a1a" : "#e4e4e7",
                            borderRadius: 2
                        }} />
                    )}
                </div>
            ))}
        </div>
    );
}

// ── File Upload ───────────────────────────────────────────────────────────────
function FileUpload({
    file, onFile
}: {
    file: File | null;
    onFile: (f: File | null) => void;
}) {
    const onDrop = useCallback((accepted: File[]) => {
        if (accepted[0]) onFile(accepted[0]);
    }, [onFile]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "application/pdf": [], "text/plain": [], "application/msword": [], "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [] },
        maxFiles: 1,
    });

    return (
        <div
            {...getRootProps()}
            style={{
                border: `2px dashed ${isDragActive ? "#f97316" : "#d4d4d8"}`,
                borderRadius: 12, padding: "32px 20px",
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", gap: 8, cursor: "pointer",
                background: isDragActive ? "#fff7ed" : "#fafafa",
                transition: "all 0.2s", textAlign: "center"
            }}
        >
            <input {...getInputProps()} />
            {file ? (
                <>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Upload size={18} color="#16a34a" />
                    </div>
                    <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>{file.name}</p>
                        <p style={{ fontSize: 11, color: "#71717a" }}>{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); onFile(null); }}
                        style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#ef4444", background: "none", border: "none", cursor: "pointer", marginTop: 4 }}
                    >
                        <X size={12} /> Remove file
                    </button>
                </>
            ) : (
                <>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: "#f4f4f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Upload size={20} color="#71717a" />
                    </div>
                    <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>
                            Choose a file or drag & drop it here
                        </p>
                        <p style={{ fontSize: 11, color: "#71717a", marginTop: 2 }}>PDF, PNG, JPG type here</p>
                    </div>
                    <button style={{
                        marginTop: 4, padding: "7px 16px", borderRadius: 8,
                        border: "1px solid #d4d4d8", background: "#fff",
                        fontSize: 12, fontWeight: 500, color: "#1a1a1a", cursor: "pointer"
                    }}>
                        Browse Files
                    </button>
                </>
            )}
        </div>
    );
}

// ── Question Type Row ─────────────────────────────────────────────────────────
function QuestionRow({
    index, config, onUpdate, onRemove, canRemove
}: {
    index: number;
    config: { type: QuestionType; count: number; marksPerQuestion: number };
    onUpdate: (i: number, f: string, v: unknown) => void;
    onRemove: (i: number) => void;
    canRemove: boolean;
}) {
    return (
        <div style={{
            display: "grid",
            gridTemplateColumns: "1fr auto auto auto auto",
            gap: 8, alignItems: "center",
            background: "#fafafa", borderRadius: 10,
            padding: "10px 12px", border: "1px solid #e4e4e7"
        }}>
            {/* Type Select */}
            <div style={{ position: "relative" }}>
                <select
                    value={config.type}
                    onChange={e => onUpdate(index, "type", e.target.value)}
                    style={{
                        width: "100%", padding: "8px 32px 8px 12px",
                        fontSize: 13, border: "1px solid #e4e4e7",
                        borderRadius: 8, background: "#fff",
                        color: "#1a1a1a", appearance: "none",
                        cursor: "pointer", fontFamily: "inherit",
                        outline: "none"
                    }}
                >
                    {QUESTION_TYPE_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
                <ChevronDown size={14} color="#71717a" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            </div>

            {/* Remove btn */}
            {canRemove ? (
                <button
                    onClick={() => onRemove(index)}
                    style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid #fca5a5", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                    <X size={13} color="#ef4444" />
                </button>
            ) : (
                <div style={{ width: 28 }} />
            )}

            {/* Count stepper */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button
                    onClick={() => onUpdate(index, "count", Math.max(1, config.count - 1))}
                    style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid #e4e4e7", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                    <Minus size={11} />
                </button>
                <input
                    type="number"
                    value={config.count}
                    min={1} max={50}
                    onChange={e => onUpdate(index, "count", Math.max(1, parseInt(e.target.value) || 1))}
                    style={{ width: 40, textAlign: "center", fontSize: 13, fontWeight: 600, border: "1px solid #e4e4e7", borderRadius: 6, padding: "4px 2px", outline: "none", fontFamily: "inherit" }}
                />
                <button
                    onClick={() => onUpdate(index, "count", Math.min(50, config.count + 1))}
                    style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid #e4e4e7", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                    <Plus size={11} />
                </button>
            </div>

            {/* Marks stepper */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button
                    onClick={() => onUpdate(index, "marksPerQuestion", Math.max(1, config.marksPerQuestion - 1))}
                    style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid #e4e4e7", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                    <Minus size={11} />
                </button>
                <input
                    type="number"
                    value={config.marksPerQuestion}
                    min={1} max={20}
                    onChange={e => onUpdate(index, "marksPerQuestion", Math.max(1, parseInt(e.target.value) || 1))}
                    style={{ width: 40, textAlign: "center", fontSize: 13, fontWeight: 600, border: "1px solid #e4e4e7", borderRadius: 6, padding: "4px 2px", outline: "none", fontFamily: "inherit" }}
                />
                <button
                    onClick={() => onUpdate(index, "marksPerQuestion", Math.min(20, config.marksPerQuestion + 1))}
                    style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid #e4e4e7", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                    <Plus size={11} />
                </button>
            </div>
        </div>
    );
}

// ── Generating Screen ─────────────────────────────────────────────────────────
function GeneratingScreen({
    progress, message, assignmentId
}: {
    progress: number;
    message: string;
    assignmentId: string;
}) {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 20px", textAlign: "center" }}>
            {/* Animated circle */}
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

            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1a1a1a", marginBottom: 8 }}>
                Generating Question Paper
            </h2>
            <p style={{ fontSize: 14, color: "#71717a", marginBottom: 24, maxWidth: 320 }}>{message}</p>

            {/* Progress bar */}
            <div style={{ width: 300, height: 6, background: "#e4e4e7", borderRadius: 999, overflow: "hidden" }}>
                <div style={{
                    height: "100%", borderRadius: 999,
                    background: "linear-gradient(90deg, #f97316, #ea580c)",
                    width: `${progress}%`, transition: "width 0.5s ease"
                }} />
            </div>

            <p style={{ fontSize: 12, color: "#a1a1aa", marginTop: 16 }}>
                Please wait while AI creates your question paper...
            </p>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CreateAssignmentPage() {
    const router = useRouter();
    const { formData, setFormData, addQuestionConfig, updateQuestionConfig, removeQuestionConfig, reset } = useCreateStore();

    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [progressMsg, setProgressMsg] = useState("Initializing...");
    const [assignmentId, setAssignmentId] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // WebSocket
    useWebSocket(assignmentId || undefined, (event) => {
        if (event.type === "job:processing") {
            setProgress(event.progress || 10);
            setProgressMsg(event.message || "Processing...");
        }
        if (event.type === "job:progress") {
            setProgress(event.progress || 50);
            setProgressMsg(event.message || "Generating...");
        }
        if (event.type === "job:completed" && event.paperId) {
            setProgress(100);
            setProgressMsg("Done!");
            toast.success("Question paper generated!");
            setTimeout(() => {
                reset();
                router.push(`/assignments/${assignmentId}`);
            }, 800);
        }
        if (event.type === "job:failed") {
            setGenerating(false);
            toast.error(event.error || "Generation failed");
        }
    });

    // Totals
    const totalQuestions = formData.questionConfigs.reduce((s, c) => s + c.count, 0);
    const totalMarks = formData.questionConfigs.reduce((s, c) => s + c.count * c.marksPerQuestion, 0);

    // Validation
    const validate = () => {
        const e: Record<string, string> = {};
        if (!formData.title.trim()) e.title = "Title is required";
        if (!formData.subject.trim()) e.subject = "Subject is required";
        if (!formData.grade.trim()) e.grade = "Grade is required";
        if (!formData.topic.trim()) e.topic = "Topic is required";
        if (!formData.dueDate) e.dueDate = "handleSubmit is required";
        if (formData.questionConfigs.length === 0) e.configs = "Add at least one question type";
        formData.questionConfigs.forEach((c, i) => {
            if (c.count < 1) e[`count_${i}`] = "Min 1";
            if (c.marksPerQuestion < 1) e[`marks_${i}`] = "Min 1";
        });
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleNext = () => {
        if (validate()) setStep(2);
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setSubmitting(true);
        try {
            const res = await assignmentService.create({
                title: formData.title,
                subject: formData.subject,
                grade: formData.grade,
                topic: formData.topic,
                // ✅ Fix: date ko ISO format mein convert karo
                dueDate: new Date(formData.dueDate + "T23:59:59.000Z").toISOString(),
                questionConfigs: formData.questionConfigs,
                additionalInstructions: formData.additionalInstructions,
            }, formData.file || undefined);

            setAssignmentId(res.assignmentId);
            setGenerating(true);
            setProgress(5);
            setProgressMsg("Job queued, waiting for worker...");

            // ✅ Polling fallback — har 3 second mein check karo
            const pollInterval = setInterval(async () => {
                try {
                    const assignment = await assignmentService.getById(res.assignmentId);
                    if (assignment.status === "completed" && assignment.paperId) {
                        clearInterval(pollInterval);
                        setProgress(100);
                        setProgressMsg("Done!");
                        toast.success("Question paper generated!");
                        setTimeout(() => {
                            reset();
                            router.push(`/assignments/${res.assignmentId}`);
                        }, 800);
                    } else if (assignment.status === "failed") {
                        clearInterval(pollInterval);
                        setGenerating(false);
                        toast.error("Generation failed. Please try again.");
                    } else if (assignment.status === "processing") {
                        setProgress(prev => Math.min(prev + 10, 85));
                        setProgressMsg("AI is generating your question paper...");
                    }
                } catch { }
            }, 3000);
            const maxAttempts = 60;

 
            // 2 minute timeout
            setTimeout(() => clearInterval(pollInterval), 120000);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to create");
        } finally {
            setSubmitting(false);
        }
    };
    const updateConfig = (i: number, field: string, value: unknown) => {
        updateQuestionConfig(i, { [field]: value } as never);
    };

    // Generating screen
    if (generating) {
        return (
            <AppShell title="Create Assignment" showBack={false}>
                <div style={{ maxWidth: 600, margin: "0 auto", padding: "40px 20px" }}>
                    <GeneratingScreen
                        progress={progress}
                        message={progressMsg}
                        assignmentId={assignmentId || ""}
                    />
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell title="Assignment" showBack>
            <div style={{ maxWidth: 680, margin: "0 auto", padding: "28px 20px 60px" }}>

                {/* Page title */}
                <div style={{ marginBottom: 20 }}>
                    <h1 style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a" }}>Create Assignment</h1>
                    <p style={{ fontSize: 12, color: "#71717a", marginTop: 2 }}>Set up a new assignment for your students</p>
                </div>

                {/* Step indicator */}
                <StepIndicator current={step} />

                {/* Card */}
                <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e4e4e7", padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>

                    {step === 1 && (
                        <>
                            <h2 style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a", marginBottom: 4 }}>Assignment Details</h2>
                            <p style={{ fontSize: 12, color: "#71717a", marginBottom: 20 }}>Basic information about your assignment</p>

                            {/* File Upload */}
                            <div style={{ marginBottom: 20 }}>
                                <FileUpload
                                    file={formData.file}
                                    onFile={(f) => setFormData({ file: f })}
                                />
                                <p style={{ fontSize: 11, color: "#71717a", marginTop: 6, textAlign: "center" }}>
                                    Upload images of your preferred document/image
                                </p>
                            </div>

                            {/* Title */}
                            <div style={{ marginBottom: 14 }}>
                                <label style={{ fontSize: 12, fontWeight: 600, color: "#1a1a1a", display: "block", marginBottom: 6 }}>
                                    Assignment Title *
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Science Chapter 5 Quiz"
                                    value={formData.title}
                                    onChange={e => setFormData({ title: e.target.value })}
                                    style={{
                                        width: "100%", padding: "10px 14px", fontSize: 13,
                                        border: `1px solid ${errors.title ? "#fca5a5" : "#e4e4e7"}`,
                                        borderRadius: 10, outline: "none", fontFamily: "inherit",
                                        background: "#fafafa"
                                    }}
                                />
                                {errors.title && <p style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>{errors.title}</p>}
                            </div>

                            {/* Subject + Grade row */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                                <div>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: "#1a1a1a", display: "block", marginBottom: 6 }}>Subject *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Science"
                                        value={formData.subject}
                                        onChange={e => setFormData({ subject: e.target.value })}
                                        style={{ width: "100%", padding: "10px 14px", fontSize: 13, border: `1px solid ${errors.subject ? "#fca5a5" : "#e4e4e7"}`, borderRadius: 10, outline: "none", fontFamily: "inherit", background: "#fafafa" }}
                                    />
                                    {errors.subject && <p style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>{errors.subject}</p>}
                                </div>
                                <div>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: "#1a1a1a", display: "block", marginBottom: 6 }}>Grade/Class *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Grade 8"
                                        value={formData.grade}
                                        onChange={e => setFormData({ grade: e.target.value })}
                                        style={{ width: "100%", padding: "10px 14px", fontSize: 13, border: `1px solid ${errors.grade ? "#fca5a5" : "#e4e4e7"}`, borderRadius: 10, outline: "none", fontFamily: "inherit", background: "#fafafa" }}
                                    />
                                    {errors.grade && <p style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>{errors.grade}</p>}
                                </div>
                            </div>

                            {/* Topic */}
                            <div style={{ marginBottom: 14 }}>
                                <label style={{ fontSize: 12, fontWeight: 600, color: "#1a1a1a", display: "block", marginBottom: 6 }}>Topic *</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Electromagnetism"
                                    value={formData.topic}
                                    onChange={e => setFormData({ topic: e.target.value })}
                                    style={{ width: "100%", padding: "10px 14px", fontSize: 13, border: `1px solid ${errors.topic ? "#fca5a5" : "#e4e4e7"}`, borderRadius: 10, outline: "none", fontFamily: "inherit", background: "#fafafa" }}
                                />
                                {errors.topic && <p style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>{errors.topic}</p>}
                            </div>

                            {/* Due Date */}
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ fontSize: 12, fontWeight: 600, color: "#1a1a1a", display: "block", marginBottom: 6 }}>Due Date *</label>
                                <div style={{ position: "relative" }}>
                                    <input
                                        type="date"
                                        value={formData.dueDate}
                                        min={new Date().toISOString().split("T")[0]}
                                        onChange={e => setFormData({ dueDate: e.target.value })}
                                        style={{ width: "100%", padding: "10px 40px 10px 14px", fontSize: 13, border: `1px solid ${errors.dueDate ? "#fca5a5" : "#e4e4e7"}`, borderRadius: 10, outline: "none", fontFamily: "inherit", background: "#fafafa", cursor: "pointer" }}
                                    />
                                    <Calendar size={15} color="#71717a" style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                                </div>
                                {errors.dueDate && <p style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>{errors.dueDate}</p>}
                            </div>

                            {/* Question Types */}
                            <div style={{ marginBottom: 16 }}>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: 8, marginBottom: 8, padding: "0 12px" }}>
                                    <span style={{ fontSize: 11, fontWeight: 600, color: "#71717a" }}>Question Type</span>
                                    <span style={{ fontSize: 11, fontWeight: 600, color: "#71717a", width: 28 }} />
                                    <span style={{ fontSize: 11, fontWeight: 600, color: "#71717a", textAlign: "center", minWidth: 100 }}>No. of Questions</span>
                                    <span style={{ fontSize: 11, fontWeight: 600, color: "#71717a", textAlign: "center", minWidth: 100 }}>Marks</span>
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                    {formData.questionConfigs.map((config, i) => (
                                        <QuestionRow
                                            key={i}
                                            index={i}
                                            config={config}
                                            onUpdate={updateConfig}
                                            onRemove={removeQuestionConfig}
                                            canRemove={formData.questionConfigs.length > 1}
                                        />
                                    ))}
                                </div>

                                {errors.configs && <p style={{ fontSize: 11, color: "#ef4444", marginTop: 6 }}>{errors.configs}</p>}

                                {/* Add Question Type */}
                                <button
                                    onClick={addQuestionConfig}
                                    style={{
                                        display: "flex", alignItems: "center", gap: 6,
                                        marginTop: 10, fontSize: 12, fontWeight: 600,
                                        color: "#1a1a1a", background: "none", border: "none",
                                        cursor: "pointer", padding: "6px 4px"
                                    }}
                                >
                                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <Plus size={12} color="#fff" />
                                    </div>
                                    Add Question Type
                                </button>
                            </div>

                            {/* Totals */}
                            <div style={{ display: "flex", gap: 16, justifyContent: "flex-end", padding: "10px 0", borderTop: "1px solid #f4f4f5", marginBottom: 16 }}>
                                <span style={{ fontSize: 12, color: "#71717a" }}>
                                    Total Questions : <strong style={{ color: "#1a1a1a" }}>{totalQuestions}</strong>
                                </span>
                                <span style={{ fontSize: 12, color: "#71717a" }}>
                                    Total Marks : <strong style={{ color: "#1a1a1a" }}>{totalMarks}</strong>
                                </span>
                            </div>

                            {/* Additional Instructions */}
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 600, color: "#1a1a1a", display: "block", marginBottom: 6 }}>
                                    Additional Information <span style={{ color: "#71717a", fontWeight: 400 }}>(For better output)</span>
                                </label>
                                <div style={{ position: "relative" }}>
                                    <textarea
                                        placeholder="e.g. Generate a question paper for 3 hour exam duration."
                                        value={formData.additionalInstructions}
                                        onChange={e => setFormData({ additionalInstructions: e.target.value })}
                                        rows={3}
                                        style={{
                                            width: "100%", padding: "10px 40px 10px 14px",
                                            fontSize: 13, border: "1px solid #e4e4e7",
                                            borderRadius: 10, outline: "none", fontFamily: "inherit",
                                            background: "#fafafa", resize: "vertical", lineHeight: 1.5
                                        }}
                                    />
                                    <Mic size={15} color="#71717a" style={{ position: "absolute", right: 14, bottom: 14 }} />
                                </div>
                            </div>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <h2 style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a", marginBottom: 4 }}>Review & Generate</h2>
                            <p style={{ fontSize: 12, color: "#71717a", marginBottom: 20 }}>Review your assignment before generating</p>

                            {/* Summary */}
                            {[
                                ["Title", formData.title],
                                ["Subject", formData.subject],
                                ["Grade", formData.grade],
                                ["Topic", formData.topic],
                                ["Due Date", formData.dueDate],
                                ["File", formData.file?.name || "None"],
                            ].map(([label, value]) => (
                                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f4f4f5" }}>
                                    <span style={{ fontSize: 13, color: "#71717a", fontWeight: 500 }}>{label}</span>
                                    <span style={{ fontSize: 13, color: "#1a1a1a", fontWeight: 600, textAlign: "right", maxWidth: 300 }}>{value}</span>
                                </div>
                            ))}

                            <div style={{ marginTop: 16 }}>
                                <p style={{ fontSize: 12, fontWeight: 600, color: "#71717a", marginBottom: 8 }}>Question Sections</p>
                                {formData.questionConfigs.map((c, i) => (
                                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#fafafa", borderRadius: 8, marginBottom: 6 }}>
                                        <span style={{ fontSize: 12, color: "#1a1a1a" }}>
                                            {QUESTION_TYPE_OPTIONS.find(o => o.value === c.type)?.label}
                                        </span>
                                        <span style={{ fontSize: 12, color: "#71717a" }}>
                                            {c.count} Q × {c.marksPerQuestion} marks
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, padding: "12px 0", borderTop: "1px solid #e4e4e7" }}>
                                <span style={{ fontSize: 13, fontWeight: 600, color: "#71717a" }}>Total Questions: <strong style={{ color: "#1a1a1a" }}>{totalQuestions}</strong></span>
                                <span style={{ fontSize: 13, fontWeight: 600, color: "#71717a" }}>Total Marks: <strong style={{ color: "#1a1a1a" }}>{totalMarks}</strong></span>
                            </div>

                            {formData.additionalInstructions && (
                                <div style={{ marginTop: 12, padding: 12, background: "#fafafa", borderRadius: 8 }}>
                                    <p style={{ fontSize: 11, color: "#71717a", marginBottom: 4, fontWeight: 600 }}>Additional Instructions</p>
                                    <p style={{ fontSize: 12, color: "#1a1a1a" }}>{formData.additionalInstructions}</p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Navigation Buttons */}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
                    <button
                        onClick={() => step === 1 ? router.back() : setStep(1)}
                        style={{
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "10px 20px", borderRadius: 10,
                            border: "1px solid #e4e4e7", background: "#fff",
                            fontSize: 13, fontWeight: 600, color: "#1a1a1a",
                            cursor: "pointer"
                        }}
                    >
                        <ArrowLeft size={15} />
                        Previous
                    </button>

                    {step === 1 ? (
                        <button
                            onClick={handleNext}
                            style={{
                                display: "flex", alignItems: "center", gap: 8,
                                padding: "10px 24px", borderRadius: 10,
                                border: "none", background: "#1a1a1a",
                                fontSize: 13, fontWeight: 600, color: "#fff",
                                cursor: "pointer"
                            }}
                        >
                            Next
                            <ArrowRight size={15} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            style={{
                                display: "flex", alignItems: "center", gap: 8,
                                padding: "10px 24px", borderRadius: 10,
                                border: "none", background: submitting ? "#a1a1aa" : "#f97316",
                                fontSize: 13, fontWeight: 600, color: "#fff",
                                cursor: submitting ? "not-allowed" : "pointer"
                            }}
                        >
                            {submitting ? "Creating..." : "Generate Paper"}
                            {!submitting && <ArrowRight size={15} />}
                        </button>
                    )}
                </div>
            </div>
        </AppShell>
    );
}