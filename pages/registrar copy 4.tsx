import { useEffect, useState } from 'react';
import { CheckCircleIcon, XCircleIcon, TrashIcon } from '@heroicons/react/24/solid';

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
  const [ventasSesion, setVentasSesion] = useState<any[]>([]);

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

    try {
      const res = await fetch('/api/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (res.ok) {
        setMensaje('Venta registrada correctamente.');
        setError(null);
        setVentasSesion(prev => [...prev, payload]);
        setTitulo('');
        setAutor('');
        setProveedor('');
        setPrecioVenta('');
        setCanal('Local');
      } else {
        setError('Error al registrar la venta.');
        setMensaje(null);
      }
    } catch (err) {
      setError('Error de red.');
      setMensaje(null);
    }
  };

  const eliminarVenta = (index: number) => {
    setVentasSesion(ventasSesion.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4 bg-white rounded shadow">
      <h1 className="text-3xl font-bold mb-6 text-center">Registrar venta</h1>

      {mensaje && (
        <div className="flex items-center bg-green-100 text-green-700 p-3 mb-4 rounded">
          <CheckCircleIcon className="h-5 w-5 mr-2" />
          <span>{mensaje}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center bg-red-100 text-red-700 p-3 mb-4 rounded">
          <XCircleIcon className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4 relative">
          <label className="block mb-1 font-semibold">Título:</label>
          <input
            type="text"
            value={titulo}
            onChange={handleTituloChange}
            className="w-full border p-2 rounded"
            autoComplete="off"
          />
          {sugerencias.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border mt-1 max-h-40 overflow-y-auto shadow-lg rounded text-sm">
              {sugerencias.map((libro, index) => (
                <li
                  key={index}
                  onClick={() => handleSelectSugerencia(libro)}
                  className="p-2 hover:bg-blue-100 cursor-pointer"
                >
                  {libro.titulo} – {libro.autor} – {libro.proveedor}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-semibold">Autor:</label>
            <input
              type="text"
              value={autor}
              onChange={e => setAutor(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Proveedor:</label>
            <input
              type="text"
              value={proveedor}
              onChange={e => setProveedor(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Precio de venta:</label>
            <input
              type="number"
              value={precioVenta}
              onChange={e => setPrecioVenta(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Canal:</label>
            <select
              value={canal}
              onChange={e => setCanal(e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option value="Local">Local</option>
              <option value="Web">Web</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="mt-6 w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 font-semibold"
        >
          Registrar venta
        </button>
      </form>

      {ventasSesion.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-3">Ventas en esta sesión</h2>
          <ul className="border rounded p-2 bg-gray-50">
            {ventasSesion.map((venta, index) => (
              <li
                key={index}
                className="flex justify-between items-center p-2 border-b text-sm"
              >
                <span>
                  📚 {venta.titulo} – 💰 ${venta.precioVenta} – 🛒 {venta.canal}
                </span>
                <button onClick={() => eliminarVenta(index)}>
                  <TrashIcon className="h-4 w-4 text-red-600 hover:text-red-800" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}