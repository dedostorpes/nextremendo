import { google } from 'googleapis';
import PDFDocument from 'pdfkit';
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import { format, isAfter, isBefore, parseISO } from 'date-fns';

export const config = {
  api: {
    responseLimit: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const sheetId = process.env.SHEET_ID!;
  const sheetName = 'Ventas';
  const keyFilePath = 'config/credentials.json';

  const desdeStr = req.query.desde as string;
  const hastaStr = req.query.hasta as string;

  let desde = desdeStr ? parseISO(desdeStr) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  let hasta = hastaStr ? parseISO(hastaStr) : new Date();

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

    const ventasRango = rows.filter((row) => {
      const fecha = parseISO(row[0]);
      return isAfter(fecha, desde) && isBefore(fecha, hasta);
    });

    let totalVenta = 0, totalSocio = 0, totalTuyo = 0;

    const doc = new PDFDocument({ margin: 50 });
    const buffers: Buffer[] = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', async () => {
      const pdfData = Buffer.concat(buffers);
      const fileName = `reporte_${format(desde, 'yyyy-MM-dd')}_al_${format(hasta, 'yyyy-MM-dd')}.pdf`;

      // ENVIAR POR EMAIL
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_ADDRESS,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: `"Tremendos Libros" <${process.env.EMAIL_ADDRESS}>`,
        to: process.env.SOCIO_EMAIL || 'jpfein9@gmail.com',
        subject: '📊 Reporte de ventas',
        text: 'Adjunto el reporte de ventas correspondiente al período seleccionado.',
        attachments: [
          {
            filename: fileName,
            content: pdfData,
          },
        ],
      });

      res.status(200).json({ message: 'Reporte generado y enviado exitosamente.' });
    });

    // Logo centrado
    const logoPath = path.join(process.cwd(), 'public/logo.png');
    if (fs.existsSync(logoPath)) {
      const pageWidth = doc.page.width;
      const logoWidth = 150;
      const x = (pageWidth - logoWidth) / 2;
      doc.image(logoPath, x, undefined, { width: logoWidth });
      doc.moveDown();
    }

    // Título
    doc.moveDown(1);
    doc.fontSize(18).text('Reporte de ventas', { align: 'center' });
    doc.fontSize(12).text(`Desde: ${format(desde, 'yyyy-MM-dd')}  Hasta: ${format(hasta, 'yyyy-MM-dd')}`, { align: 'center' });
    doc.moveDown(2);

    const tableTop = doc.y;
    const columnWidths = [60, 130, 70, 50, 50, 50, 40, 60]; // Ajustado
    const columnTitles = ['Fecha', 'Título', 'Proveedor', 'Venta', 'Socio', 'Tuya', '%', 'Canal'];

    // Cabecera
    let x = doc.x;
    doc.font('Helvetica-Bold').fontSize(9);
    for (let i = 0; i < columnTitles.length; i++) {
      doc.rect(x, tableTop, columnWidths[i], 20).stroke();
      doc.text(columnTitles[i], x + 2, tableTop + 6, { width: columnWidths[i] - 4, align: 'left' });
      x += columnWidths[i];
    }

    doc.font('Helvetica').fontSize(8);
    let y = tableTop + 20;

    ventasRango.forEach((row) => {
      const [fecha, titulo, proveedor, , precioVenta, porcentaje, gananciaSocio, gananciaTuya, canal] = row;

      totalVenta += parseFloat(precioVenta || '0');
      totalSocio += parseFloat(gananciaSocio || '0');
      totalTuyo += parseFloat(gananciaTuya || '0');

      const datos = [
        fecha,
        titulo?.substring(0, 35),
        proveedor,
        `$${precioVenta}`,
        `$${gananciaSocio}`,
        `$${gananciaTuya}`,
        `${porcentaje}%`,
        canal,
      ];

      x = doc.x;
      for (let i = 0; i < datos.length; i++) {
        doc.rect(x, y, columnWidths[i], 20).stroke();
        doc.text(datos[i], x + 2, y + 6, { width: columnWidths[i] - 4, align: 'left' });
        x += columnWidths[i];
      }

      y += 20;
      if (y > doc.page.height - 100) {
        doc.addPage();
        y = doc.y;
      }
    });

    doc.moveDown(2);
    doc.font('Helvetica-Bold').fontSize(13).text('Resumen final');
    doc.font('Helvetica').fontSize(11);
    doc.text(`Total facturado: $${totalVenta.toFixed(2)}`);
    doc.text(`Ganancia del socio: $${totalSocio.toFixed(2)}`);
    doc.text(`Tu ganancia: $${totalTuyo.toFixed(2)}`);

    doc.moveDown(2);
    doc.fontSize(10).text('Autorizado Luciano Rey', { align: 'center' });

    doc.end();
  } catch (error) {
    console.error('Error al generar o enviar el reporte PDF:', error);
    res.status(500).json({ message: 'Error al generar o enviar el reporte' });
  }
}