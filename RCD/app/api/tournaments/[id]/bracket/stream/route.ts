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
      if (bracket) {
        controller.enqueue(new TextEncoder().encode(serializeBracket(bracket)));
      }
      const unsubscribe = subscribeBracket(id, (b) => {
        controller.enqueue(new TextEncoder().encode(serializeBracket(b)));
      });
      const interval = setInterval(() => {
        controller.enqueue(new TextEncoder().encode(`: ping\n\n`));
      }, 15000);
      // No direct close event; rely on cancel
      (controller as any).unsubscribe = unsubscribe;
      (controller as any).interval = interval;
    },
    cancel(reason) {
      const unsubscribe = (this as any).unsubscribe;
      const interval = (this as any).interval;
      if (unsubscribe) unsubscribe();
      if (interval) clearInterval(interval);
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
