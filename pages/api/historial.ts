import type { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const sheetId = process.env.SHEET_ID!;
  const sheetName = 'Ventas';
  const keyFilePath = 'config/credentials.json';

  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: keyFilePath,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    const range = `${sheetName}!A2:I`;
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range,
    });

    const rows = response.data.values || [];

    const ventas = rows.map((row: string[]) => ({
      fecha: row[0] || '',
      titulo: row[1] || '',
      proveedor: row[2] || '',
      precioUnitario: row[3] || '',
      precioVenta: row[4] || '',
      porcentajeSocio: row[5] || '',
      gananciaSocio: row[6] || '',
      gananciaTuya: row[7] || '',
      canal: row[8] || '',
    }));

    res.status(200).json({ ventas });
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ message: 'Error al obtener historial de ventas' });
  }
}