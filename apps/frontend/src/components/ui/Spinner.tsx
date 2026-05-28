export default function Spinner({ size = 20 }: { size?: number }) {
  return (
    <svg
      style={{ width: size, height: size, animation: "spin 1s linear infinite" }}
      fill="none" viewBox="0 0 24 24"
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="12" cy="12" r="10" stroke="#f97316" strokeWidth="4" style={{ opacity: 0.25 }} />
      <path fill="#f97316" d="M4 12a8 8 0 018-8v8z" style={{ opacity: 0.75 }} />
    </svg>
  );
}