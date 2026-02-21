import { NextResponse } from 'next/server';
import { anthropic, preScreenMessage, checkRateLimit, ChatMessage } from '@/lib/claude';
import { LSU_SYSTEM_PROMPT } from '@/lib/lsu-knowledge';

export async function POST(request: Request) {
  try {
    // Rate limiting by IP
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Please wait ${rateCheck.retryAfter}s.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { message, history = [] } = body as {
      message: string;
      history: ChatMessage[];
    };

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Pre-screen message for obvious violations
    const screen = preScreenMessage(message);
    if (screen.blocked) {
      return NextResponse.json({ error: screen.reason }, { status: 400 });
    }

    // Build conversation history (keep last 10 messages to stay within context)
    const trimmedHistory = history.slice(-10);
    const messages: ChatMessage[] = [
      ...trimmedHistory,
      { role: 'user', content: message },
    ];

    // Stream the response using Server-Sent Events
    const stream = anthropic.messages.stream({
      model: 'claude-haiku-4-5',
      max_tokens: 600,
      system: LSU_SYSTEM_PROMPT,
      messages,
    });

    const encoder = new TextEncoder();

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === 'content_block_delta' &&
              chunk.delta.type === 'text_delta'
            ) {
              const data = JSON.stringify({ text: chunk.delta.text });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : 'Stream error';
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: errMsg })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (err) {
    console.error('Chat API error:', err);
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 });
  }
}
