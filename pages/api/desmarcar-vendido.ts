import { google } from 'googleapis';
import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import { readFileSync } from 'fs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { titulo, autor, proveedor } = req.body;
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(
      readFileSync(path.resolve(process.cwd(), 'credentials.json'), 'utf8')
    ),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = process.env.SPREADSHEET_ID!;
  const sheetName = 'Stock';

  try {
    const getRows = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A2:M`,
    });

    const rows = getRows.data.values || [];

    let rowIndex = -1;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const [,, proveedorVal,,,,, tituloVal, autorVal] = row;

      if (
        tituloVal?.trim().toLowerCase() === titulo.trim().toLowerCase() &&
        autorVal?.trim().toLowerCase() === autor.trim().toLowerCase() &&
        proveedorVal?.trim().toLowerCase() === proveedor.trim().toLowerCase() &&
        row[12] === 'VENDIDO'
      ) {
        rowIndex = i + 2;
        break;
      }
    }

    if (rowIndex === -1) {
      return res.status(404).json({ error: 'No se encontró el libro para desmarcar' });
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!M${rowIndex}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [['']],
      },
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error al desmarcar como vendido:', err);
    res.status(500).json({ error: 'Error interno al desmarcar' });
  }
}