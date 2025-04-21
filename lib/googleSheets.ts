import { google } from 'googleapis';

function getAuth(keyFilePath: string) {
  return new google.auth.GoogleAuth({
    keyFile: keyFilePath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

export async function findFirstAvailableRow(
  spreadsheetId: string,
  sheetName: string,
  title: string,
  keyFilePath: string
) {
  const auth = getAuth(keyFilePath);
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const range = `${sheetName}!A2:L`;
  const result = await sheets.spreadsheets.values.get({ spreadsheetId, range });
  const rows = result.data.values || [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const vendido = (row[11] || '').toUpperCase();
    const titulo = (row[6] || '').trim();

    if (titulo.toLowerCase() === title.toLowerCase() && vendido !== 'VENDIDO') {
      return { rowIndex: i + 2, rowData: row };
    }
  }

  return null;
}

export async function markAsSold(
  spreadsheetId: string,
  sheetName: string,
  rowIndex: number,
  precioVenta: number,
  keyFilePath: string
) {
  const auth = getAuth(keyFilePath);
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const vendidoRange = `${sheetName}!L${rowIndex}`;
  const precioRange = `${sheetName}!E${rowIndex}`;

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: vendidoRange,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [['VENDIDO']] },
  });

  const precioActual = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: precioRange,
  });

  if (!precioActual.data.values || !precioActual.data.values[0][0]) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: precioRange,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[precioVenta]] },
    });
  }
}