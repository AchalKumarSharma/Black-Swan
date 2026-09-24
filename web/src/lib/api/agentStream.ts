/**
 * Live Multi-Agent Forensic Investigation Stream Consumer (Stage 3).
 * Connects to the FastAPI backend SSE endpoint (/api/v1/agents/investigate)
 * to stream Director M, Agent Q, Agent Eve, and Agent 007 real-time telemetry and findings.
 */

import { SSEStreamEvent, SSEEventType, AgentRole } from "@/types/contracts";

export interface StreamController {
  cancel: () => void;
}

export function runAgentInvestigation(
  datasetId: string,
  query: string,
  onEvent: (event: SSEStreamEvent) => void,
  onComplete?: () => void,
  onError?: (err: Error) => void,
  workspaceId: string = "00000000-0000-0000-0000-000000000001",
  conversationHistory?: Array<{ query: string; summary?: string; intent?: string }>,
  sessionId?: string
): StreamController {
  const abortController = new AbortController();
  let isCancelled = false;

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  (async () => {
    try {
      const response = await fetch(`${apiBase}/api/v1/agents/investigate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          dataset_id: datasetId,
          query: query,
          workspace_id: workspaceId,
          conversation_history: conversationHistory,
          session_id: sessionId,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        let errDetail = `Server responded with ${response.status} ${response.statusText}`;
        try {
          const errJson = await response.json();
          if (errJson.detail) errDetail = errJson.detail;
        } catch {
          // ignore json parse error
        }
        throw new Error(errDetail);
      }

      if (!response.body) {
        throw new Error("Response body is empty, cannot read SSE stream.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (!isCancelled) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        // Keep the last partial chunk in buffer
        buffer = parts.pop() || "";

        for (const chunk of parts) {
          if (!chunk.trim() || isCancelled) continue;

          let currentEvent = "";
          let currentData = "";

          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("event:")) {
              currentEvent = line.replace(/^event:\s*/, "").trim();
            } else if (line.startsWith("data:")) {
              currentData = line.replace(/^data:\s*/, "").trim();
            }
          }

          if (currentData) {
            try {
              const parsed = JSON.parse(currentData);
              const rawType: string = parsed.event_type || currentEvent || "status_update";
              const rawAgent: string = parsed.agent || "System";
              const payload = parsed.payload || {};
              const timestamp = parsed.timestamp || new Date().toISOString();

              // Normalize event types to TypeScript contracts
              let normalizedType: SSEEventType = "status_update";
              if (rawType === "m_plan") normalizedType = "m_plan";
              else if (rawType === "q_diagnostic" || rawType === "q_finding") normalizedType = "q_diagnostic";
              else if (rawType === "eve_audit") normalizedType = "eve_audit";
              else if (rawType === "007_strategy" || rawType === "strategic_levers") normalizedType = "007_strategy";
              else if (rawType === "out_of_scope") normalizedType = "out_of_scope";
              else if (rawType === "pipeline_complete") normalizedType = "pipeline_complete";
              else if (rawType === "error") normalizedType = "error";
              else normalizedType = "status_update";

              const eventObj: SSEStreamEvent = {
                event_type: normalizedType,
                agent: rawAgent as AgentRole,
                payload,
                timestamp,
              };

              onEvent(eventObj);

              if (normalizedType === "status_update" && rawAgent === "System" && payload.status === "completed") {
                if (onComplete) onComplete();
              } else if (normalizedType === "error") {
                if (onError) onError(new Error(payload.message || payload.error || "Agent investigation error"));
              }
            } catch (jsonErr) {
              console.warn("Failed to parse SSE JSON payload:", currentData, jsonErr);
            }
          }
        }
      }

      if (!isCancelled && onComplete) {
        onComplete();
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        // User aborted, normal exit
        return;
      }
      console.error("Agent investigation stream error:", err);
      if (onError && !isCancelled) {
        onError(err instanceof Error ? err : new Error(String(err)));
      }
    }
  })();

  return {
    cancel: () => {
      isCancelled = true;
      abortController.abort();
    },
  };
}
