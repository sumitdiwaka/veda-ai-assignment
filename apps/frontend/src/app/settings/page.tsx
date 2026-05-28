"use client";
import AppShell from "@/components/layout/AppShell";
import { useState } from "react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const [schoolName, setSchoolName] = useState("Delhi Public School");
  const [location, setLocation] = useState("Bokaro Steel City");
  const [teacherName, setTeacherName] = useState("John Doe");

  const handleSave = () => {
    toast.success("Settings saved!");
  };

  return (
    <AppShell title="Settings">
      <div style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a", marginBottom: 4 }}>Settings</h1>
          <p style={{ fontSize: 13, color: "#71717a" }}>Manage your account and preferences</p>
        </div>

        {/* Profile Card */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e4e4e7", padding: 24, marginBottom: 16 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a", marginBottom: 16 }}>Profile</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#f97316", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontSize: 22, fontWeight: 700 }}>J</span>
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a" }}>{teacherName}</p>
              <p style={{ fontSize: 12, color: "#71717a" }}>Teacher • Admin</p>
            </div>
          </div>

          {[
            { label: "Teacher Name", value: teacherName, onChange: setTeacherName },
            { label: "School Name", value: schoolName, onChange: setSchoolName },
            { label: "Location", value: location, onChange: setLocation },
          ].map(({ label, value, onChange }) => (
            <div key={label} style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#1a1a1a", display: "block", marginBottom: 6 }}>{label}</label>
              <input
                type="text"
                value={value}
                onChange={e => onChange(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", fontSize: 13, border: "1px solid #e4e4e7", borderRadius: 10, outline: "none", fontFamily: "inherit", background: "#fafafa" }}
              />
            </div>
          ))}

          <button
            onClick={handleSave}
            style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "#1a1a1a", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", marginTop: 4 }}
          >
            Save Changes
          </button>
        </div>

        {/* App Info */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e4e4e7", padding: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a", marginBottom: 16 }}>About VedaAI</h2>
          {[
            ["Version", "1.0.0"],
            ["AI Model", "Groq Llama 3.3 70B"],
            ["Backend", "Node.js + Express"],
            ["Database", "MongoDB + Redis"],
          ].map(([label, value]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f4f4f5" }}>
              <span style={{ fontSize: 13, color: "#71717a" }}>{label}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}