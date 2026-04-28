import { NextResponse } from 'next/server';
import { updateCall, deleteCall, SHEET_NAMES } from '@/lib/sheets';

const SHEET = SHEET_NAMES.lachiyuv;

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const rowNumber = parseInt(params.id);
    const data = await request.json();
    await updateCall(rowNumber, data, SHEET);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/lachiyuv error:', error);
    return NextResponse.json({ error: 'Failed to update call' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const rowNumber = parseInt(params.id);
    await deleteCall(rowNumber, SHEET);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/lachiyuv error:', error);
    return NextResponse.json({ error: 'Failed to delete call' }, { status: 500 });
  }
}
