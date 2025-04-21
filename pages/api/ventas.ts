import { google } from 'googleapis';
import { NextApiRequest, NextApiResponse } from 'next';
import { readFileSync } from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { titulo, autor, proveedor, precioVenta, canal = 'Local' } = req.body;
  if (!titulo || !autor || !proveedor || !precioVenta) {
    return res.status(400).json({ error: 'Faltan datos obligatorios.' });
  }

  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(
      readFileSync(path.resolve(process.cwd(), 'credentials.json'), 'utf8')
    ),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = process.env.SPREADSHEET_ID!;
  const stockSheet = 'Stock';
  const ventasSheet = 'Ventas';

  try {
    const stockData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${stockSheet}!A2:M`,
    });

    const filas = stockData.data.values || [];
    const index = filas.findIndex(row =>
      row[6] === titulo && row[7] === autor && row[1] === proveedor && row[11] !== 'VENDIDO'
    );

    if (index === -1) {
      return res.status(404).json({ error: 'Libro no encontrado en stock o ya vendido' });
    }

    const filaLibro = filas[index];
    const precioUnitario = parseFloat(filaLibro[3]) || 0;
    const porcentaje = parseFloat((filaLibro[5] || '0').replace('%', '')) || 0;

    const gananciaSocio = precioUnitario + (precioVenta * (porcentaje / 100));
    const gananciaTuya = precioVenta - gananciaSocio;

    const fechaHoy = new Date().toISOString().split('T')[0];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${ventasSheet}!A2`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          fechaHoy,
          titulo,
          proveedor,
          precioUnitario,
          precioVenta,
          `${porcentaje}%`,
          gananciaSocio.toFixed(2),
          gananciaTuya.toFixed(2),
          canal
        ]],
      },
    });

    const filaGoogleSheet = index + 2;
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${stockSheet}!L${filaGoogleSheet}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [['VENDIDO']],
      },
    });

    res.status(200).json({ message: 'Venta registrada con éxito' });
  } catch (err) {
    console.error('Error registrando venta:', err);
    res.status(500).json({ error: 'Error interno al registrar venta' });
  }
}