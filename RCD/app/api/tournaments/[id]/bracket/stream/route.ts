import { getBracket, subscribeBracket } from "@/app/api/_mockData";

function serializeBracket(bracket: any) {
  return `event: bracket\ndata: ${JSON.stringify(bracket)}\n\n`;
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const bracket = getBracket(id);

  const stream = new ReadableStream({
    start(controller) {
      // Track active state so we stop enqueuing once the stream is closed/aborted.
      let active = true;

      const encoder = new TextEncoder();
      const safeEnqueue = (payload: string) => {
        if (!active) return;
        try {
          controller.enqueue(encoder.encode(payload));
        } catch (err) {
          // Controller closed; perform cleanup and mark inactive to prevent future attempts.
          active = false;
          cleanup();
        }
      };

      const cleanup = () => {
        if (!active) return; // idempotent safety
        active = false;
        if (unsubscribe) unsubscribe();
        if (interval) clearInterval(interval);
      };

      if (bracket) {
        safeEnqueue(serializeBracket(bracket));
      }

      const unsubscribe = subscribeBracket(id, (b) => {
        safeEnqueue(serializeBracket(b));
      });

      const interval = setInterval(() => {
        safeEnqueue(`: ping\n\n`);
      }, 15000);

      // Expose cleanup parts to cancel() via controller instance
      (controller as any).unsubscribe = unsubscribe;
      (controller as any).interval = interval;
      (controller as any).cleanup = cleanup;
    },
    cancel(reason) {
      const cleanup = (this as any).cleanup;
      if (cleanup) cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
