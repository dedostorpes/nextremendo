import { google } from 'googleapis';

export async function marcarComoVendido(titulo: string, autor: string, proveedor: string) {
  const sheetId = process.env.SHEET_ID!;
  const sheetName = 'Inventario de compras';
  const keyFilePath = 'config/credentials.json';

  const auth = new google.auth.GoogleAuth({
    keyFile: keyFilePath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const range = `${sheetName}!A2:M`;
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range,
  });

  const rows = response.data.values || [];

  const index = rows.findIndex(row =>
    (row[6] || '').toLowerCase() === titulo.toLowerCase() &&
    (row[7] || '').toLowerCase() === autor.toLowerCase() &&
    (row[1] || '').toLowerCase() === proveedor.toLowerCase()
  );

  if (index >= 0) {
    const fila = index + 2; // porque empezamos en A2
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `${sheetName}!L${fila}`, // columna 12 = L
      valueInputOption: 'RAW',
      requestBody: {
        values: [['VENDIDO']],
      },
    });
    return true;
  } else {
    console.warn('No se encontró el libro para marcar como vendido.');
    return false;
  }
}