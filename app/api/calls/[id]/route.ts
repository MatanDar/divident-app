import { NextResponse } from 'next/server';
import { updateCall, deleteCall } from '@/lib/sheets';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const rowNumber = parseInt(params.id);
    const data = await request.json();
    await updateCall(rowNumber, data);
    return NextResponse.json({ success: true });
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
