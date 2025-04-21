import { useEffect, useState } from 'react';
import styles from './RegistrarVenta.module.css';

interface Libro {
  titulo: string;
  proveedor: string;
  precioUnitario: string;
  porcentajeSocio: string;
}

export default function RegistrarVenta() {
  const [libros, setLibros] = useState<Libro[]>([]);
  const [titulo, setTitulo] = useState('');
  const [proveedor, setProveedor] = useState('');
  const [precioUnitario, setPrecioUnitario] = useState('');
  const [porcentajeSocio, setPorcentajeSocio] = useState('');
  const [sugerencias, setSugerencias] = useState<string[]>([]);
  const [ventaRegistrada, setVentaRegistrada] = useState('');

  useEffect(() => {
    fetch('/api/stock')
      .then(res => res.json())
      .then(data => setLibros(data));
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setTitulo(valor);
    if (valor.length > 2) {
      const matches = libros
        .filter(libro => libro.titulo.toLowerCase().includes(valor.toLowerCase()))
        .map(libro => libro.titulo);
      setSugerencias(matches.slice(0, 10));
    } else {
      setSugerencias([]);
    }
  };

  const handleSeleccion = (seleccion: string) => {
    const libro = libros.find(l => l.titulo === seleccion);
    if (libro) {
      setTitulo(libro.titulo);
      setProveedor(libro.proveedor);
      setPrecioUnitario(libro.precioUnitario);
      setPorcentajeSocio(libro.porcentajeSocio);
    }
    setSugerencias([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      registrarVenta();
    }
  };

  const registrarVenta = async () => {
    if (!titulo || !precioUnitario || !porcentajeSocio) return;

    const res = await fetch('/api/ventas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titulo,
        proveedor,
        precioUnitario,
        porcentajeSocio
      })
    });

    if (res.ok) {
      setVentaRegistrada(`✅ Venta registrada: ${titulo}`);
      setTitulo('');
      setProveedor('');
      setPrecioUnitario('');
      setPorcentajeSocio('');
      setTimeout(() => setVentaRegistrada(''), 5000);
    }
  };

  return (
    <main className={styles.container}>
      <h1 className={styles.titulo}>Registrar Venta</h1>
      <form className={styles.formulario} onKeyDown={handleKeyDown}>
        <label>Título del libro:</label>
        <input
          type="text"
          value={titulo}
          onChange={handleInput}
          className={styles.input}
          placeholder="Escribí el título..."
        />
        {sugerencias.length > 0 && (
          <ul className={styles.sugerencias}>
            {sugerencias.map((s, i) => (
              <li key={i} onClick={() => handleSeleccion(s)}>{s}</li>
            ))}
          </ul>
        )}

        <label>Proveedor:</label>
        <input
          type="text"
          value={proveedor}
          onChange={(e) => setProveedor(e.target.value)}
          className={styles.input}
        />

        <label>Precio unitario:</label>
        <input
          type="text"
          value={precioUnitario}
          onChange={(e) => setPrecioUnitario(e.target.value)}
          className={styles.input}
        />

        <label>% del socio:</label>
        <input
          type="text"
          value={porcentajeSocio}
          onChange={(e) => setPorcentajeSocio(e.target.value)}
          className={styles.input}
        />

        <button type="button" onClick={registrarVenta} className={styles.boton}>
          Registrar venta
        </button>

        {ventaRegistrada && <p className={styles.exito}>{ventaRegistrada}</p>}
      </form>
    </main>
  );
}