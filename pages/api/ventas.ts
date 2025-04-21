import { google } from 'googleapis';
import { NextApiRequest, NextApiResponse } from 'next';
import { marcarComoVendido } from '../../lib/googleSheets';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const sheetId = process.env.SHEET_ID!;
  const sheetName = 'Ventas';
  const keyFilePath = 'config/credentials.json';

  const { titulo, autor, proveedor, precioUnitario, porcentajeSocio, precioVenta = '' } = req.body;

  if (!titulo || !autor || !proveedor || !precioUnitario || !porcentajeSocio) {
    return res.status(400).json({ message: 'Faltan datos obligatorios.' });
  }

  const auth = new google.auth.GoogleAuth({
    keyFile: keyFilePath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const hoy = new Date().toISOString().split('T')[0];
  const venta = [
    hoy,
    titulo,
    proveedor,
    precioUnitario,
    precioVenta,
    porcentajeSocio,
    '', '', // Ganancia socio y tuya, se pueden calcular en otro paso
    'Local',
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: `${sheetName}!A1`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [venta],
    },
  });

  const fueMarcado = await marcarComoVendido(titulo, autor, proveedor);

  if (!fueMarcado) {
    return res.status(202).json({
      message: 'Venta registrada, pero no se encontró el libro para marcar como vendido.',
    });
  }

  res.status(200).json({ message: 'Venta registrada y libro marcado como vendido.' });
}