"use client";
import { useEffect, useRef, useCallback } from "react";

export type WSEvent = {
  type: string;
  assignmentId?: string;
  jobId?: string;
  paperId?: string;
  progress?: number;
  message?: string;
  error?: string;
};

type Handler = (event: WSEvent) => void;

export function useWebSocket(assignmentId?: string, onMessage?: Handler) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout>>();
  const onMessageRef = useRef<Handler | undefined>(onMessage);
  const assignmentIdRef = useRef<string | undefined>(assignmentId);
  const mountedRef = useRef(true);

  // Always keep refs updated
  useEffect(() => { onMessageRef.current = onMessage; }, [onMessage]);
  useEffect(() => { assignmentIdRef.current = assignmentId; }, [assignmentId]);

  const connect = useCallback(() => {
    if (!mountedRef.current) return;

    // Close existing connection
    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.close();
    }

    const url = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:5000/ws";
    
    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) return;
        console.log("✅ WebSocket connected");
        if (assignmentIdRef.current) {
          ws.send(JSON.stringify({ 
            type: "subscribe", 
            assignmentId: assignmentIdRef.current 
          }));
        }
      };

      ws.onmessage = (e) => {
        if (!mountedRef.current) return;
        try {
          const data: WSEvent = JSON.parse(e.data);
          console.log("📡 WS event:", data.type, data);
          onMessageRef.current?.(data);
        } catch {}
      };

      ws.onclose = () => {
        if (!mountedRef.current) return;
        console.log("🔌 WS closed, reconnecting in 2s...");
        reconnectRef.current = setTimeout(() => {
          if (mountedRef.current) connect();
        }, 2000);
      };

      ws.onerror = (err) => {
        console.log("WS error, closing...", err);
        ws.close();
      };
    } catch (err) {
      console.log("WS connect failed:", err);
      reconnectRef.current = setTimeout(() => {
        if (mountedRef.current) connect();
      }, 3000);
    }
  }, []); // empty deps — uses refs

  useEffect(() => {
    mountedRef.current = true;
    connect();
    return () => {
      mountedRef.current = false;
      clearTimeout(reconnectRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [connect]);

  // Re-subscribe when assignmentId changes
  useEffect(() => {
    if (assignmentId && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ 
        type: "subscribe", 
        assignmentId 
      }));
    }
  }, [assignmentId]);

  return wsRef;
}