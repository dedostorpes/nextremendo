import { useState } from 'react';

export default function Home() {
  const [titulo, setTitulo] = useState('');
  const [precio, setPrecio] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [detalle, setDetalle] = useState<null | {
    titulo: string;
    precioVenta: number;
    precioUnitario: number;
    porcentaje: number;
    gananciaSocio: number;
    gananciaLibrero: number;
  }>(null);

  const handleSubmit = async () => {
    setMensaje('Enviando...');
    setDetalle(null);

    const res = await fetch('/api/ventas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo, precio }),
    });

    const data = await res.json();
    if (res.ok) {
      setMensaje(data.message);
      setDetalle(data.detalle);
    } else {
      setMensaje(data.message || 'Error al registrar venta');
    }
  };

  return (
    <main style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: 24, marginBottom: 12 }}>Registrar venta</h1>
      <input
        value={titulo}
        onChange={e => setTitulo(e.target.value)}
        placeholder="Título"
        style={{ display: 'block', marginBottom: 10, padding: 6, width: '100%' }}
      />
      <input
        type="number"
        value={precio}
        onChange={e => setPrecio(e.target.value)}
        placeholder="Precio"
        style={{ display: 'block', marginBottom: 10, padding: 6, width: '100%' }}
      />
      <button
        onClick={handleSubmit}
        style={{ padding: '8px 16px', backgroundColor: '#0070f3', color: '#fff', border: 'none' }}
      >
        Registrar venta
      </button>

      <p style={{ marginTop: 20 }}>{mensaje}</p>

      {detalle && (
        <div style={{ marginTop: 20, background: '#f9f9f9', padding: 16, borderRadius: 8 }}>
          <h3>📊 Detalle de la venta</h3>
          <ul>
            <li><strong>Título:</strong> {detalle.titulo}</li>
            <li><strong>Precio de venta:</strong> ${detalle.precioVenta}</li>
            <li><strong>Precio unitario:</strong> ${detalle.precioUnitario}</li>
            <li><strong>Porcentaje del socio:</strong> {detalle.porcentaje}%</li>
            <li><strong>Ganancia del socio:</strong> ${detalle.gananciaSocio}</li>
            <li><strong>Tu ganancia:</strong> ${detalle.gananciaLibrero}</li>
          </ul>
        </div>
      )}
    </main>
  );
}