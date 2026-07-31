import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const stream = new ReadableStream({
    start(controller) {
      // @ts-ignore
      let lastCount = global.mockPurchases ? global.mockPurchases.length : 0;
      
      const interval = setInterval(() => {
        // @ts-ignore
        if (!global.mockPurchases) global.mockPurchases = [];
        
        // @ts-ignore
        if (global.mockPurchases.length > lastCount) {
          // @ts-ignore
          const newItems = global.mockPurchases.slice(lastCount);
          // @ts-ignore
          lastCount = global.mockPurchases.length;
          controller.enqueue(`data: ${JSON.stringify({ type: 'new_purchases', data: newItems })}\n\n`);
        } else {
          controller.enqueue(`data: ${JSON.stringify({ type: 'ping' })}\n\n`);
        }
      }, 1000);

      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    }
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
