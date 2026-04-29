import { mastra } from '@/mastra';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { message } = await req.json();

    const agent = mastra.getAgent('consultationAgent');

    const result = await agent.stream(message);

    // Create a custom stream that formats chunks for the frontend
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = result.textStream.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value) {
              controller.enqueue(encoder.encode(`0:${JSON.stringify(value)}\n`));
            }
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked'
      },
    });
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
