const { spawn } = require("child_process");
const path = require("path");

console.log("🚀 Starting VedaAI Backend + Worker...");

const api = spawn("node", [path.join(__dirname, "dist/index.js")], {
  stdio: "inherit",
  env: process.env,
});

const worker = spawn("node", [path.join(__dirname, "dist/queues/assignment.worker.js")], {
  stdio: "inherit",
  env: process.env,
});

api.on("exit", (code) => {
  console.log(`API exited: ${code}`);
  process.exit(code || 0);
});

worker.on("exit", (code) => {
  console.log(`Worker exited: ${code}`);
  setTimeout(() => {
    console.log("🔄 Restarting worker...");
    spawn("node", [path.join(__dirname, "dist/queues/assignment.worker.js")], {
      stdio: "inherit",
      env: process.env,
    });
  }, 3000);
});

process.on("SIGTERM", () => { api.kill(); worker.kill(); });
process.on("SIGINT", () => { api.kill(); worker.kill(); });