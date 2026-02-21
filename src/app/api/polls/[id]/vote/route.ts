import { NextResponse } from 'next/server';
import { voteOnPoll } from '@/lib/polls';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { optionId } = body;

    if (!optionId) {
      return NextResponse.json({ error: 'optionId is required' }, { status: 400 });
    }

    const result = voteOnPoll(id, optionId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    return NextResponse.json({ poll: result.poll, message: 'Vote recorded! Geaux Tigers! 🐯' });
  } catch {
    return NextResponse.json({ error: 'Failed to record vote' }, { status: 500 });
  }
}
