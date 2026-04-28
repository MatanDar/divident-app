import { NextResponse } from 'next/server';
import { getCalls, addCall, SHEET_NAMES } from '@/lib/sheets';

const SHEET = SHEET_NAMES.hushlimu;

export async function GET() {
  try {
    const calls = await getCalls(SHEET);
    return NextResponse.json(calls);
  } catch (error) {
    console.error('GET /api/hushlimu error:', error);
    return NextResponse.json({ error: 'Failed to fetch calls' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    await addCall(data, SHEET);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('POST /api/hushlimu error:', error?.message || error);
    return NextResponse.json({ error: error?.message || 'Failed to add call' }, { status: 500 });
  }
}
