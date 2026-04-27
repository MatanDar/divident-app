import { NextResponse } from 'next/server';
import { getCalls, addCall } from '@/lib/sheets';

export async function GET() {
  try {
    const calls = await getCalls();
    return NextResponse.json(calls);
  } catch (error) {
    console.error('GET /api/calls error:', error);
    return NextResponse.json({ error: 'Failed to fetch calls' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    await addCall(data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST /api/calls error:', error);
    return NextResponse.json({ error: 'Failed to add call' }, { status: 500 });
  }
}
