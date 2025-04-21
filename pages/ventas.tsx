import { useEffect, useState } from 'react';
import { format, startOfToday, subDays, startOfMonth, startOfYear } from 'date-fns';

interface Venta {
  fecha: string;
  titulo: string;
  proveedor: string;
  precioUnitario: string;
  precioVenta: string;
  porcentajeSocio: string;
  gananciaSocio: string;
  gananciaTuya: string;
  canal: string;
}

export default function Ventas() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [ventasFiltradas, setVentasFiltradas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [canales, setCanales] = useState<string[]>([]);
  const [canalSeleccionado, setCanalSeleccionado] = useState('Todos');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const fetchVentas = async () => {
      const res = await fetch('/api/historial');
      const data = await res.json();
      const todas = data.ventas || [];

      const listaCanales = Array.from(new Set(todas.map((v: Venta) => v.canal).filter(Boolean)));
      setCanales(['Todos', ...listaCanales]);

      setVentas(todas);
      setVentasFiltradas(todas);
      setLoading(false);
    };
    fetchVentas();
  }, []);

  const filtrarPorCanal = (canal: string) => {
    setCanalSeleccionado(canal);
    if (canal === 'Todos') {
      setVentasFiltradas(ventas);
    } else {
      setVentasFiltradas(ventas.filter((v) => v.canal === canal));
    }
  };

  const descargarPDF = async () => {
    try {
      let url = '/api/reporte';
      if (desde && hasta) {
        url += `?desde=${desde}&hasta=${hasta}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error('Error al generar el reporte');

      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `reporte_ventas.pdf`;
      link.click();

      setMensaje('Reporte generado y enviado correctamente.');
    } catch (error) {
      console.error(error);
      setMensaje('Ocurrió un error al generar o enviar el reporte.');
    }

    setTimeout(() => setMensaje(''), 5000);
  };

  const aplicarRangoRapido = (tipo: string) => {
    const hoy = startOfToday();
    if (tipo === '7dias') {
      setDesde(format(subDays(hoy, 7), 'yyyy-MM-dd'));
      setHasta(format(hoy, 'yyyy-MM-dd'));
    } else if (tipo === 'mes') {
      setDesde(format(startOfMonth(hoy), 'yyyy-MM-dd'));
      setHasta(format(hoy, 'yyyy-MM-dd'));
    } else if (tipo === 'ano') {
      setDesde(format(startOfYear(hoy), 'yyyy-MM-dd'));
      setHasta(format(hoy, 'yyyy-MM-dd'));
    } else if (tipo === 'hoy') {
      const hoyStr = format(hoy, 'yyyy-MM-dd');
      setDesde(hoyStr);
      setHasta(hoyStr);
    }
  };

  return (
    <main style={{ padding: 20 }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>📋 Historial de Ventas</h1>

      <div style={{ marginBottom: 16 }}>
        <label style={{ marginRight: 8 }}>Desde:</label>
        <input type="date" value={desde} onChange={e => setDesde(e.target.value)} />
        <label style={{ marginLeft: 16, marginRight: 8 }}>Hasta:</label>
        <input type="date" value={hasta} onChange={e => setHasta(e.target.value)} />
        <button
          onClick={descargarPDF}
          style={{
            marginLeft: 16,
            padding: '8px 16px',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          📄 Exportar PDF
        </button>
      </div>

      <div style={{ marginBottom: 12 }}>
        <strong>Rangos rápidos:</strong>{' '}
        <button onClick={() => aplicarRangoRapido('7dias')}>Últimos 7 días</button>{' '}
        <button onClick={() => aplicarRangoRapido('mes')}>Mes actual</button>{' '}
        <button onClick={() => aplicarRangoRapido('ano')}>Año actual</button>{' '}
        <button onClick={() => aplicarRangoRapido('hoy')}>Hoy</button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ marginRight: 8 }}>Filtrar por canal:</label>
        <select value={canalSeleccionado} onChange={e => filtrarPorCanal(e.target.value)}>
          {canales.map((canal, i) => (
            <option key={i} value={canal}>{canal}</option>
          ))}
        </select>
      </div>

      {mensaje && (
        <div style={{ background: '#e0f7e9', color: '#007a4d', padding: 10, marginBottom: 16, borderRadius: 4 }}>
          {mensaje}
        </div>
      )}

      {loading ? (
        <p>Cargando...</p>
      ) : ventasFiltradas.length === 0 ? (
        <p>No hay ventas registradas.</p>
      ) : (
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Título</th>
              <th>Proveedor</th>
              <th>Precio unitario</th>
              <th>Precio venta</th>
              <th>% Socio</th>
              <th>Ganancia socio</th>
              <th>Ganancia tuya</th>
              <th>Canal</th>
            </tr>
          </thead>
          <tbody>
            {ventasFiltradas.map((v, i) => (
              <tr key={i}>
                <td>{v.fecha}</td>
                <td>{v.titulo}</td>
                <td>{v.proveedor}</td>
                <td>{v.precioUnitario}</td>
                <td>{v.precioVenta}</td>
                <td>{v.porcentajeSocio}</td>
                <td>{v.gananciaSocio}</td>
                <td>{v.gananciaTuya}</td>
                <td>{v.canal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}