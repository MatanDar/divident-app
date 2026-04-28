import { NextResponse } from 'next/server';
import { updateCall, deleteCall, SHEET_NAMES } from '@/lib/sheets';

const SHEET = SHEET_NAMES.hushlimu;

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
    console.error('PUT /api/hushlimu error:', error);
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
    console.error('DELETE /api/hushlimu error:', error);
    return NextResponse.json({ error: 'Failed to delete call' }, { status: 500 });
  }
}
