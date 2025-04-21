import type { NextApiRequest, NextApiResponse } from 'next';
import { findFirstAvailableRow, markAsSold } from '../../lib/googleSheets';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Solo POST' });

  const { titulo, precio } = req.body;
  const sheetId = process.env.SHEET_ID!;
  const sheetName = 'Stock';
  const keyFilePath = 'config/credentials.json';

  try {
    const ejemplar = await findFirstAvailableRow(sheetId, sheetName, titulo, keyFilePath);
    if (!ejemplar) return res.status(404).json({ message: 'No hay ejemplares disponibles' });

    await markAsSold(sheetId, sheetName, ejemplar.rowIndex, parseFloat(precio), keyFilePath);
    return res.status(200).json({ message: `Venta registrada (fila ${ejemplar.rowIndex})` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error al registrar venta' });
  }
}