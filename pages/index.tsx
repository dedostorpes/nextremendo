import { useState } from 'react';

export default function Home() {
  const [titulo, setTitulo] = useState('');
  const [precio, setPrecio] = useState('');
  const [mensaje, setMensaje] = useState('');

  const handleSubmit = async () => {
    const res = await fetch('/api/ventas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo, precio }),
    });
    const data = await res.json();
    setMensaje(data.message);
  };

  return (
    <main style={{ padding: 20 }}>
      <h1>Registrar venta</h1>
      <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Título" />
      <input type="number" value={precio} onChange={e => setPrecio(e.target.value)} placeholder="Precio" />
      <button onClick={handleSubmit}>Registrar</button>
      <p>{mensaje}</p>
    </main>
  );
}