import { google } from 'googleapis';
import { readFileSync } from 'fs';
import path from 'path';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(
        readFileSync(path.resolve(process.cwd(), 'credentials.json'), 'utf8')
      ),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.SPREADSHEET_ID!;
    const sheetName = 'Stock';

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A2:M`,
    });

    const values = response.data.values || [];

    const librosDisponibles = values
      .filter(row => row[11] !== 'VENDIDO') // columna L
      .map(row => ({
        proveedor: row[1] || '',
        precioLote: row[2] || '',
        precioUnitario: row[3] || '',
        precioVenta: row[4] || '',
        porcentajeSocio: row[5] || '',
        titulo: row[6] || '',
        autor: row[7] || '',
        editorial: row[8] || '',
        coleccion: row[9] || '',
        comentarios: row[10] || '',
      }));

    res.status(200).json(librosDisponibles);
  } catch (error) {
    console.error('❌ Error al leer libros del stock:', error);
    res.status(500).json({ error: 'Error al leer libros del stock', detalle: error });
  }
}