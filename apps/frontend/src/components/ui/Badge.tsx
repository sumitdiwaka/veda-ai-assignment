interface BadgeProps {
  label: string;
  variant?: "easy" | "medium" | "hard" | "pending" | "processing" | "completed" | "failed";
}

const colors: Record<string, { bg: string; color: string }> = {
  easy:       { bg: "#dcfce7", color: "#16a34a" },
  medium:     { bg: "#fef9c3", color: "#ca8a04" },
  hard:       { bg: "#fee2e2", color: "#dc2626" },
  pending:    { bg: "#f4f4f5", color: "#71717a" },
  processing: { bg: "#fef3c7", color: "#d97706" },
  completed:  { bg: "#dcfce7", color: "#16a34a" },
  failed:     { bg: "#fee2e2", color: "#dc2626" },
};

export default function Badge({ label, variant = "pending" }: BadgeProps) {
  const c = colors[variant] || colors.pending;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "2px 8px", borderRadius: 999,
      fontSize: 11, fontWeight: 600,
      background: c.bg, color: c.color,
    }}>
      {label}
    </span>
  );
}