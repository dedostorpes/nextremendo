import { useEffect, useState } from 'react';
import styles from './RegistrarVenta.module.css';

interface Libro {
  titulo: string;
  autor: string;
  proveedor: string;
  precioUnitario: string;
  porcentajeSocio: string;
}

export default function RegistrarVenta() {
  const [libros, setLibros] = useState<Libro[]>([]);
  const [titulo, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [proveedor, setProveedor] = useState('');
  const [precioUnitario, setPrecioUnitario] = useState('');
  const [porcentajeSocio, setPorcentajeSocio] = useState('');
  const [sugerencias, setSugerencias] = useState<Libro[]>([]);
  const [ventaRegistrada, setVentaRegistrada] = useState('');
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [indiceSeleccionado, setIndiceSeleccionado] = useState<number>(-1);

  useEffect(() => {
    fetch('/api/stock')
      .then(res => res.json())
      .then(data => setLibros(data));
  }, []);

  useEffect(() => {
    const coincidencia = libros.find(libro =>
      libro.titulo.trim().toLowerCase() === titulo.trim().toLowerCase()
    );
    if (coincidencia) {
      setAutor(coincidencia.autor);
      setProveedor(coincidencia.proveedor);
      setPrecioUnitario(coincidencia.precioUnitario);
      setPorcentajeSocio(coincidencia.porcentajeSocio);
    }
  }, [titulo, libros]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setTitulo(valor);
    if (valor.length > 1) {
      const matches = libros.filter(libro =>
        libro.titulo.toLowerCase().includes(valor.toLowerCase())
      );
      setSugerencias(matches);
      setMostrarDropdown(true);
    } else {
      setSugerencias([]);
      setMostrarDropdown(false);
    }
    setIndiceSeleccionado(-1);
  };

  const handleSeleccion = (libro: Libro) => {
    setTitulo(libro.titulo);
    setAutor(libro.autor);
    setProveedor(libro.proveedor);
    setPrecioUnitario(libro.precioUnitario);
    setPorcentajeSocio(libro.porcentajeSocio);
    setSugerencias([]);
    setMostrarDropdown(false);
    setIndiceSeleccionado(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter') {
      if (indiceSeleccionado >= 0 && sugerencias[indiceSeleccionado]) {
        e.preventDefault();
        handleSeleccion(sugerencias[indiceSeleccionado]);
      } else {
        e.preventDefault();
        registrarVenta();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIndiceSeleccionado(prev =>
        prev < sugerencias.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIndiceSeleccionado(prev =>
        prev > 0 ? prev - 1 : sugerencias.length - 1
      );
    }
  };

  const registrarVenta = async () => {
    if (!titulo || !autor || !proveedor || !precioUnitario || !porcentajeSocio) {
      alert('Faltan datos obligatorios.');
      return;
    }

    const res = await fetch('/api/ventas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titulo,
        autor,
        proveedor,
        precioUnitario,
        porcentajeSocio
      })
    });

    if (res.ok) {
      setVentaRegistrada(`✅ Venta registrada: ${titulo}`);
      setTitulo('');
      setAutor('');
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
        <div className={styles.autocompletarWrapper}>
          <input
            type="text"
            value={titulo}
            onChange={handleInput}
            className={styles.input}
            placeholder="Escribí el título..."
            autoComplete="off"
            onFocus={() => setMostrarDropdown(sugerencias.length > 0)}
            onBlur={() => setTimeout(() => setMostrarDropdown(false), 200)}
          />
          {mostrarDropdown && sugerencias.length > 0 && (
            <ul className={styles.sugerencias}>
              {sugerencias.map((libro, i) => (
                <li
                  key={i}
                  onClick={() => handleSeleccion(libro)}
                  style={{
                    backgroundColor: i === indiceSeleccionado ? '#eef6ff' : 'white'
                  }}
                >
                  <strong>{libro.titulo}</strong><br />
                  <small>{libro.autor} — {libro.proveedor}</small>
                </li>
              ))}
            </ul>
          )}
        </div>

        <label>Autor:</label>
        <input
          type="text"
          value={autor}
          onChange={e => setAutor(e.target.value)}
          className={styles.input}
        />

        <label>Proveedor:</label>
        <input
          type="text"
          value={proveedor}
          onChange={e => setProveedor(e.target.value)}
          className={styles.input}
        />

        <label>Precio unitario:</label>
        <input
          type="text"
          value={precioUnitario}
          onChange={e => setPrecioUnitario(e.target.value)}
          className={styles.input}
        />

        <label>% del socio:</label>
        <input
          type="text"
          value={porcentajeSocio}
          onChange={e => setPorcentajeSocio(e.target.value)}
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