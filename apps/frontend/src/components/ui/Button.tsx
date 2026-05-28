"use client";
import { type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const styles = {
  base: {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    gap: 8, fontWeight: 600, borderRadius: 12, border: "none",
    cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit",
  } as React.CSSProperties,
  primary: { background: "#1a1a1a", color: "#fff" } as React.CSSProperties,
  secondary: { background: "#f4f4f5", color: "#1a1a1a", border: "1px solid #e4e4e7" } as React.CSSProperties,
  ghost: { background: "transparent", color: "#71717a" } as React.CSSProperties,
  danger: { background: "#ef4444", color: "#fff" } as React.CSSProperties,
  sm: { fontSize: 12, padding: "6px 12px" } as React.CSSProperties,
  md: { fontSize: 13, padding: "10px 16px" } as React.CSSProperties,
  lg: { fontSize: 14, padding: "12px 24px" } as React.CSSProperties,
};

export default function Button({
  variant = "primary", size = "md", loading, children, disabled, style, ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      style={{
        ...styles.base,
        ...styles[variant],
        ...styles[size],
        opacity: disabled || loading ? 0.5 : 1,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        ...style,
      }}
      {...props}
    >
      {loading && (
        <svg className="animate-spin" style={{ width: 14, height: 14 }} fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }} />
          <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" style={{ opacity: 0.75 }} />
        </svg>
      )}
      {children}
    </button>
  );
}