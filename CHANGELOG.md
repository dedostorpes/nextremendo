# Changelog

## [0.1.0] - 2025-04-21
### Added
- Proyecto migrado desde Electron a Next.js con React.
- Formulario web para registrar ventas por título y precio.
- API `/api/ventas` que:
  - Busca ejemplares disponibles en Google Sheets (modelo FIFO).
  - Marca ejemplar como 'VENDIDO'.
  - Actualiza precio de venta si está vacío.
  - Calcula ganancia del socio y del librero según porcentaje de la fila.
- Resumen detallado en el frontend con datos de la venta.
- `.gitignore` actualizado para excluir `node_modules`, `.env.local`, `credentials.json`, etc.

### Next
- Registro del cliente y método de pago.
- Visualización del historial de ventas.
- Integración con WooCommerce para cruzar pedidos.