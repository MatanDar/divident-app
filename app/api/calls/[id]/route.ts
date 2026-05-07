import { NextResponse } from 'next/server';
import { updateCall, deleteCall, moveCall, SHEET_NAMES } from '@/lib/sheets';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const rowNumber = parseInt(params.id);
    const data = await request.json();

    // אוטומציה: העברה לגיליון המתאים לפי סטטוס
    if (data.status === 'ממתין לחיוב') {
      await moveCall(rowNumber, data, SHEET_NAMES.lachiyuv, SHEET_NAMES.main);
      return NextResponse.json({ success: true, moved: true, destination: 'lachiyuv' });
    } else if (data.status === 'הושלמה') {
      await moveCall(rowNumber, data, SHEET_NAMES.hushlimu, SHEET_NAMES.main);
      return NextResponse.json({ success: true, moved: true, destination: 'hushlimu' });
    } else {
      await updateCall(rowNumber, data);
      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error('PUT /api/calls error:', error);
    return NextResponse.json({ error: 'Failed to update call' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const rowNumber = parseInt(params.id);
    await deleteCall(rowNumber);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/calls error:', error);
    return NextResponse.json({ error: 'Failed to delete call' }, { status: 500 });
  }
}
