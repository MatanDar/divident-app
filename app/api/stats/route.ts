import { NextResponse } from 'next/server';
import { getCalls, SHEET_NAMES } from '@/lib/sheets';

export async function GET() {
  try {
    const [lachiyuv, hushlimu] = await Promise.all([
      getCalls(SHEET_NAMES.lachiyuv),
      getCalls(SHEET_NAMES.hushlimu),
    ]);
    return NextResponse.json({
      lachiyuv: lachiyuv.length,
      hushlimu: hushlimu.length,
    });
  } catch (error) {
    console.error('GET /api/stats error:', error);
    return NextResponse.json({ lachiyuv: 0, hushlimu: 0 });
  }
}
