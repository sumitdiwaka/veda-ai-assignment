"use client";
import { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }} />
      <div style={{ position: "relative", background: "#fff", borderRadius: 16, padding: 24, width: "100%", maxWidth: 400, margin: "0 16px", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
        {title && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a" }}>{title}</h3>
            <button onClick={onClose} style={{ padding: 4, borderRadius: 8, border: "none", background: "none", cursor: "pointer" }}>
              <X size={16} color="#71717a" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}