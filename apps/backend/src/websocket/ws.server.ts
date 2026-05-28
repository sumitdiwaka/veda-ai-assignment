import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";

interface WSClient {
  ws: WebSocket;
  assignmentId?: string;
}

const clients = new Map<string, WSClient>();

export function createWSServer(server: Server): WebSocketServer {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws, req) => {
    const clientId = req.headers["sec-websocket-key"] || Date.now().toString();
    clients.set(clientId as string, { ws });
    console.log(`🔌 WS client connected: ${clientId}`);

    ws.on("message", (raw) => {
      try {
        const msg = JSON.parse(raw.toString());

        // Client subscribes to a specific assignment job
        if (msg.type === "subscribe" && msg.assignmentId) {
          const client = clients.get(clientId as string);
          if (client) {
            client.assignmentId = msg.assignmentId;
            clients.set(clientId as string, client);
          }
          ws.send(
            JSON.stringify({
              type: "subscribed",
              assignmentId: msg.assignmentId,
              message: "Subscribed to assignment updates",
            })
          );
        }
      } catch {
        // ignore malformed messages
      }
    });

    ws.on("close", () => {
      clients.delete(clientId as string);
      console.log(`🔌 WS client disconnected: ${clientId}`);
    });

    ws.on("error", (err) => {
      console.error("WS error:", err);
    });

    // Send connection confirmation
    ws.send(JSON.stringify({ type: "connected", message: "WebSocket ready" }));
  });

  console.log("✅ WebSocket server initialized at /ws");
  return wss;
}

export type WSEventType =
  | "job:queued"
  | "job:processing"
  | "job:completed"
  | "job:failed"
  | "job:progress";

export interface WSPayload {
  type: WSEventType;
  assignmentId: string;
  jobId?: string;
  paperId?: string;
  progress?: number;
  message?: string;
  error?: string;
}

export function notifyAssignment(payload: WSPayload): void {
  const { assignmentId } = payload;
  let sent = 0;

  for (const [, client] of clients) {
    if (
      client.assignmentId === assignmentId &&
      client.ws.readyState === WebSocket.OPEN
    ) {
      client.ws.send(JSON.stringify(payload));
      sent++;
    }
  }

  if (sent > 0) {
    console.log(
      `📡 WS notification sent to ${sent} client(s) for assignment ${assignmentId}: ${payload.type}`
    );
  }
}