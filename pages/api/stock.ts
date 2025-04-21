import { google } from 'googleapis';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const sheetId = process.env.SHEET_ID!;
  const sheetName = 'Stock';
  const keyFilePath = 'config/credentials.json';

  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: keyFilePath,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    const range = `${sheetName}!A2:M`;
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range,
    });

    const rows = response.data.values || [];

    const libros = rows
      .filter(row => row[11] !== 'VENDIDO') // columna "Vendido"
      .map(row => ({
        titulo: row[6] || '',
        autor: row[7] || '',
        proveedor: row[1] || '',
        precioUnitario: row[3] || '',
        porcentajeSocio: row[5] || '',
      }));

    res.status(200).json(libros);
  } catch (error) {
    console.error('Error al obtener stock:', error);
    res.status(500).json({ message: 'Error al conectar con Google Sheets' });
  }
}