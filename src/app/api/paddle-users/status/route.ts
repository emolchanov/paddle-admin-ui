import { statusEvents } from "@/modules/paddle-users/status";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  let responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  statusEvents.removeAllListeners("statusUpdate");
  statusEvents.on("statusUpdate", async ({ status, message }) => {
    const data = JSON.stringify({ status, message });
    const sseMessage = `data: ${data}\n\n`;
    try {
      await writer.write(encoder.encode(sseMessage));
      console.log("Sent SSE message:", data);
    } catch (error) {
      console.error("Could not send SSE message", data, error);
    }
  });

  return new Response(responseStream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
