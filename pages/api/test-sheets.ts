import { google } from 'googleapis';
import { NextApiRequest, NextApiResponse } from 'next';
import { readFileSync } from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(
        readFileSync(path.resolve(process.cwd(), 'credentials.json'), 'utf8')
      ),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.SPREADSHEET_ID!;
    const testSheet = 'Ventas';

    const testResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${testSheet}!A1:I1`,
    });

    res.status(200).json({
      message: '✅ Conexión exitosa a Google Sheets',
      headers: testResponse.data.values?.[0] || [],
    });
  } catch (error) {
    console.error('❌ Error de conexión a Google Sheets:', error);
    res.status(500).json({ error: '❌ Fallo la conexión a Google Sheets', detalle: error });
  }
}