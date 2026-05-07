import { NextResponse } from 'next/server';
import { updateCall, deleteCall, moveCall, SHEET_NAMES } from '@/lib/sheets';

const SHEET = SHEET_NAMES.hushlimu;

const RETURN_TO_MAIN_STATUSES = ['לתאם', 'בטיפול', 'ממתין להמשך טיפול'];

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const rowNumber = parseInt(params.id);
    const data = await request.json();

    // אם הסטטוס החדש שייך ללוח הראשי — החזר את הקריאה
    if (RETURN_TO_MAIN_STATUSES.includes(data.status)) {
      await moveCall(rowNumber, data, SHEET_NAMES.main, SHEET);
      return NextResponse.json({ success: true, moved: true, destination: 'main' });
    }

    await updateCall(rowNumber, data, SHEET);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/hushlimu error:', error);
    return NextResponse.json({ error: 'Failed to update call' }, { status: