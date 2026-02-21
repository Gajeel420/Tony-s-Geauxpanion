import { NextResponse } from 'next/server';
import { getAllPolls, addPoll, PollOption } from '@/lib/polls';

export async function GET() {
  try {
    const polls = getAllPolls();
    return NextResponse.json({ polls });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch polls' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { question, type, options, emoji, prize } = body;

    if (!question || !type || !Array.isArray(options) || options.length < 2) {
      return NextResponse.json(
        { error: 'Invalid poll data. Provide question, type, and at least 2 options.' },
        { status: 400 }
      );
    }

    const pollOptions: PollOption[] = options.map(
      (text: string, idx: number) => ({
        id: `opt-${Date.now()}-${idx}`,
        text,
        votes: 0,
      })
    );

    const poll = addPoll({
      question,
      type,
      options: pollOptions,
      isActive: true,
      emoji: emoji || '📊',
      prize,
    });

    return NextResponse.json({ poll }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create poll' }, { status: 500 });
  }
}
