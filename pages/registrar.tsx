
import { useEffect, useState } from 'react';
import { CheckCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';

export default function RegistrarVenta() {
  const [librosVendidos, setLibrosVendidos] = useState<any[]>([]);
  const [titulo, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [proveedor, setProveedor] = useState('');
  const [precioVenta, setPrecioVenta] = useState('');
  const [canal, setCanal] = useState('Local');

  const handleSubmit = async () => {
    if (!titulo || !autor || !proveedor || !precioVenta || !canal) {
      toast({
        title: 'Error',
        description: 'Faltan datos obligatorios.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const res = await fetch('/api/ventas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ titulo, autor, proveedor, precioVenta, canal }),
      });

      const data = await res.json();
      if (res.ok) {
        setLibrosVendidos([...librosVendidos, { titulo, autor, proveedor, precioVenta, canal }]);
        setTitulo('');
        setAutor('');
        setProveedor('');
        setPrecioVenta('');
        toast({
          title: '✅ Venta registrada correctamente.',
          description: `${titulo} - $${precioVenta}`,
        });
      } else {
        toast({
          title: 'Error al registrar la venta',
          description: data.message || 'Ocurrió un error inesperado.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error de red',
        description: 'No se pudo conectar al servidor.',
        variant: 'destructive',
      });
    }
  };

  const handleRemove = (index: number) => {
    const updated = [...librosVendidos];
    const removed = updated.splice(index, 1)[0];
    setLibrosVendidos(updated);
    toast({
      title: 'Libro eliminado de la sesión',
      description: removed.titulo,
    });
  };

  return (
    <div className="max-w-xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Registrar venta</h1>

      <div className="space-y-4">
        <div>
          <Label htmlFor="titulo">Título</Label>
          <Input id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="autor">Autor</Label>
          <Input id="autor" value={autor} onChange={(e) => setAutor(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="proveedor">Proveedor</Label>
          <Input id="proveedor" value={proveedor} onChange={(e) => setProveedor(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="precio">Precio de venta</Label>
          <Input id="precio" type="number" value={precioVenta} onChange={(e) => setPrecioVenta(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="canal">Canal</Label>
          <Select value={canal} onValueChange={setCanal}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona canal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Local">Local</SelectItem>
              <SelectItem value="Web">Web</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleSubmit}>Registrar venta</Button>
      </div>

      {librosVendidos.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-bold mb-4">Libros registrados en esta sesión:</h2>
          <ul className="space-y-2">
            {librosVendidos.map((libro, index) => (
              <li key={index} className="border rounded p-3 flex justify-between items-center">
                <div>
                  <p className="font-semibold">{libro.titulo}</p>
                  <p className="text-sm text-gray-500">{libro.autor} | {libro.proveedor}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleRemove(index)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
