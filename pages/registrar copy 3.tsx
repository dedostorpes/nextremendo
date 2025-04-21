import { useEffect, useState } from 'react';

export default function RegistrarVenta() {
  const [libros, setLibros] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [proveedor, setProveedor] = useState('');
  const [precioVenta, setPrecioVenta] = useState('');
  const [canal, setCanal] = useState('Local');
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sugerencias, setSugerencias] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/libros')
      .then(res => res.json())
      .then(data => {
        setLibros(data);
      });
  }, []);

  const handleTituloChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTitulo(value);

    if (value.trim() === '') {
      setSugerencias([]);
      return;
    }

    const lower = value.toLowerCase();
    const coincidencias = libros.filter((libro: any) =>
      libro.titulo.toLowerCase().includes(lower)
    );
    setSugerencias(coincidencias.slice(0, 5));
  };

  const handleSelectSugerencia = (libro: any) => {
    setTitulo(libro.titulo);
    setAutor(libro.autor);
    setProveedor(libro.proveedor);
    setPrecioVenta(libro.precioVenta);
    setSugerencias([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!titulo || !autor || !proveedor || !precioVenta) {
      setError('Faltan datos obligatorios.');
      setMensaje(null);
      return;
    }

    const payload = {
      titulo,
      autor,
      proveedor,
      precioVenta: parseFloat(precioVenta),
      canal,
    };

    console.log('📦 Payload:', payload);

    try {
      const res = await fetch('/api/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      console.log('✅ Respuesta del backend:', result);

      if (res.ok) {
        setMensaje('✅ Venta registrada correctamente.');
        setError(null);
      } else {
        setError('❌ Error al registrar la venta.');
        setMensaje(null);
      }
    } catch (err) {
      setError('❌ Error de red.');
      setMensaje(null);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Registrar venta</h1>

      {mensaje && <div className="text-green-600 mb-2">{mensaje}</div>}
      {error && <div className="text-red-600 mb-2">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-4 relative">
          <label className="block mb-1">Título:</label>
          <input
            type="text"
            value={titulo}
            onChange={handleTituloChange}
            className="w-full border p-2"
            autoComplete="off"
          />
          {sugerencias.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border mt-1 max-h-40 overflow-y-auto shadow-lg">
              {sugerencias.map((libro, index) => (
                <li
                  key={index}
                  onClick={() => handleSelectSugerencia(libro)}
                  className="p-2 hover:bg-blue-100 cursor-pointer text-sm"
                >
                  {libro.titulo} – {libro.autor} – {libro.proveedor}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mb-4">
          <label className="block mb-1">Autor:</label>
          <input
            type="text"
            value={autor}
            onChange={e => setAutor(e.target.value)}
            className="w-full border p-2"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1">Proveedor:</label>
          <input
            type="text"
            value={proveedor}
            onChange={e => setProveedor(e.target.value)}
            className="w-full border p-2"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1">Precio de venta:</label>
          <input
            type="number"
            value={precioVenta}
            onChange={e => setPrecioVenta(e.target.value)}
            className="w-full border p-2"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1">Canal:</label>
          <select
            value={canal}
            onChange={e => setCanal(e.target.value)}
            className="w-full border p-2"
          >
            <option value="Local">Local</option>
            <option value="Web">Web</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Registrar venta
        </button>
      </form>
    </div>
  );
}