


import { useEffect, useState } from 'react';
import { CheckCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import axios from 'axios';

export default function RegistrarVenta() {
  const [ventasSesion, setVentasSesion] = useState<any[]>([]);
  const [mensaje, setMensaje] = useState('');
  const [form, setForm] = useState({
	titulo: '',
	autor: '',
	proveedor: '',
	precioVenta: '',
	canal: 'Local'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
	setForm({ ...form, [e.target.id]: e.target.value });
  };

  const registrar = async () => {
	if (!form.titulo || !form.autor || !form.proveedor || !form.precioVenta) {
	  setMensaje('⚠️ Faltan datos obligatorios.');
	  return;
	}
	try {
	  const res = await axios.post('/api/ventas', form);
	  if (res.status === 200) {
		setVentasSesion([...ventasSesion, form]);
		setMensaje('✅ Venta registrada correctamente.');
		setForm({ titulo: '', autor: '', proveedor: '', precioVenta: '', canal: 'Local' });
	  }
	} catch (err) {
	  setMensaje('❌ Error al registrar venta.');
	}
  };

  const eliminarVenta = (index: number) => {
	const nuevas = [...ventasSesion];
	nuevas.splice(index, 1);
	setVentasSesion(nuevas);
  };

  return (
	<div className="max-w-2xl mx-auto mt-10 p-4">
	  <h1 className="text-3xl font-bold text-center mb-6">Registrar venta</h1>

	  {mensaje && (
		<div className="flex items-center gap-2 p-4 bg-blue-100 text-blue-800 rounded-xl shadow mb-6">
		  <span className="text-sm font-medium">{mensaje}</span>
		</div>
	  )}

	  <div className="space-y-4 mb-10">
		<div>
		  <Label htmlFor="titulo">Título</Label>
		  <Input id="titulo" value={form.titulo} onChange={handleChange} placeholder="Título del libro" />
		</div>
		<div>
		  <Label htmlFor="autor">Autor</Label>
		  <Input id="autor" value={form.autor} onChange={handleChange} placeholder="Autor/es" />
		</div>
		<div>
		  <Label htmlFor="proveedor">Proveedor</Label>
		  <Input id="proveedor" value={form.proveedor} onChange={handleChange} placeholder="Proveedor" />
		</div>
		<div>
		  <Label htmlFor="precioVenta">Precio de venta</Label>
		  <Input id="precioVenta" type="number" value={form.precioVenta} onChange={handleChange} />
		</div>
		<div>
		  <Label htmlFor="canal">Canal</Label>
		  <Select value={form.canal} onValueChange={(value) => setForm({ ...form, canal: value })}>
			<SelectTrigger className="w-full">
			  <SelectValue placeholder="Selecciona canal" />
			</SelectTrigger>
			<SelectContent>
			  <SelectItem value="Local">Local</SelectItem>
			  <SelectItem value="Web">Web</SelectItem>
			  <SelectItem value="Otro">Otro</SelectItem>
			</SelectContent>
		  </Select>
		</div>
		<Button className="w-full" onClick={registrar}>Registrar venta</Button>
	  </div>

	  <h2 className="text-xl font-semibold mb-4">Ventas de esta sesión</h2>

	  <div className="space-y-4">
		{ventasSesion.map((venta, index) => (
		  <Card key={index} className="flex justify-between items-center p-4">
			<CardContent className="p-0">
			  <p className="font-medium">{venta.titulo}</p>
			  <p className="text-sm text-gray-600">{venta.autor}</p>
			  <p className="text-sm text-gray-500">{venta.proveedor} | ${venta.precioVenta} | {venta.canal}</p>
			</CardContent>
			<Button
			  variant="ghost"
			  size="icon"
			  className="text-red-500 hover:text-red-700"
			  onClick={() => eliminarVenta(index)}
			>
			  <Trash2 className="w-5 h-5" />
			</Button>
		  </Card>
		))}
	  </div>
	</div>
  );
}
