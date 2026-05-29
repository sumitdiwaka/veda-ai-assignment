const { spawn } = require("child_process");
const path = require("path");

console.log("🚀 Starting VedaAI Backend + Worker...");

// Pehle API start karo
const api = spawn("node", [path.join(__dirname, "dist/index.js")], {
  stdio: "inherit",
  env: { ...process.env },
});

// 3 second baad worker start karo
setTimeout(() => {
  const worker = spawn("node", [path.join(__dirname, "dist/queues/assignment.worker.js")], {
    stdio: "inherit",
    env: { ...process.env, PORT: "5001" }, // ✅ Worker ka alag port
  });

  worker.on("exit", (code) => {
    console.log(`Worker exited: ${code}`);
    setTimeout(() => {
      spawn("node", [path.join(__dirname, "dist/queues/assignment.worker.js")], {
        stdio: "inherit",
        env: { ...process.env, PORT: "5001" },
      });
    }, 3000);
  });
}, 3000);

api.on("exit", (code) => {
  console.log(`API exited: ${code}`);
  process.exit(code || 0);
});

process.on("SIGTERM", () => process.exit(0));
process.on("SIGINT", () => process.exit(0));