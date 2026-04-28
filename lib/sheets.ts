import { google } from 'googleapis';

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID!;
const SHEET_NAME = 'לוח ראשי';

function getAuth() {
  const rawKey = process.env.GOOGLE_PRIVATE_KEY || '';
  // Handle both escaped \n and real newlines, and strip surrounding quotes
  const privateKey = rawKey
    .replace(/^"+|"+$/g, '')   // remove surrounding quotes if any
    .replace(/\\n/g, '\n');    // convert \n to real newlines

  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

function rowToCall(row: string[], index: number) {
  return {
    id: String(index + 2), // row number in sheet (1=header, 2=first data row)
    customerName: row[0] || '',
    customerNumber: row[1] || '',
    phone: row[2] || '',
    status: row[3] || '',
    deviceType: row[4] || '',
    description: row[5] || '',
    technician: row[6] || '',
    visitDate: row[7] || '',
    closingDate: row[8] || '',
    priority: row[9] || '',
  };
}

export async function getCalls() {
  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A:J`,
  });

  const rows = res.data.values || [];
  if (rows.length <= 1) return [];

  // Skip header row, filter out empty rows
  return rows.slice(1)
    .map((row, i) => rowToCall(row as string[], i))
    .filter(call => call.customerName.trim() !== '');
}

export async function addCall(data: Record<string, string>) {
  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });

  // Read all rows to find the last row that actually has data
  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A:J`,
  });

  const rows = existing.data.values || [];
  // Find the last row index with any non-empty cell
  let lastDataRow = 0;
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].some((cell: string) => cell && cell.toString().trim() !== '')) {
      lastDataRow = i;
    }
  }
  const nextRow = lastDataRow + 2; // +1 for 0-index to 1-index, +1 for next row

  const values = [[
    data.customerName || '',
    data.customerNumber || '',
    data.phone || '',
    data.status || '',
    data.deviceType || '',
    data.description || '',
    data.technician || '',
    data.visitDate || '',
    data.closingDate || '',
    data.priority || '',
  ]];

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A${nextRow}:J${nextRow}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values },
  });
}

export async function updateCall(rowNumber: number, data: Record<string, string>) {
  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });

  const values = [[
    data.customerName || '',
    data.customerNumber || '',
    data.phone || '',
    data.status || '',
    data.deviceType || '',
    data.description || '',
    data.technician || '',
    data.visitDate || '',
    data.closingDate || '',
    data.priority || '',
  ]];

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A${rowNumber}:J${rowNumber}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values },
  });
}

export async function deleteCall(rowNumber: number) {
  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });

  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const sheet = spreadsheet.data.sheets?.find(s => s.properties?.title === SHEET_NAME);
  const sheetId = sheet?.properties?.sheetId ?? 0;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [{
        deleteDimension: {
          range: {
            sheetId,
            dimension: 'ROWS',
            startIndex: rowNumber - 1,
            endIndex: rowNumber,
          },
        },
      }],
    },
  });
}
