# 📱 Estado del Frontend Next.js

## ✅ Completado

### Configuración Base
- [x] `package.json` - Dependencias
- [x] `next.config.js` - Configuración Next.js
- [x] `tailwind.config.js` - Configuración Tailwind
- [x] `postcss.config.js` - PostCSS
- [x] `.env.example` - Variables de entorno

### Estilos
- [x] `src/styles/globals.css` - Estilos globales con Tailwind
- [x] Clases utility personalizadas
- [x] Animaciones y transiciones

### Librería y Utilidades
- [x] `src/lib/api.js` - Cliente API completo
  - reservasAPI
  - clientesAPI
  - mesasAPI
  - analyticsAPI
- [x] `src/lib/constants.js` - Constantes de la app
- [x] `src/lib/utils.js` - Funciones utilidad

### Estructura Base
- [x] `src/pages/_app.js` - App wrapper
- [x] `src/components/Layout.js` - Layout principal
- [x] `src/pages/index.js` - Página principal de reservas

## 🚧 Componentes a Crear

Te proporciono una guía rápida de los componentes que faltan. Puedes:
1. Crearlos manualmente siguiendo los ejemplos
2. Usar el script generador que incluyo abajo

### Componentes de Reservas

#### `src/components/reservas/VistaCuadricula.js`
```jsx
- Selector de fecha
- Tabla de horarios (filas) x mesas (columnas)
- Estados: disponible, reservada, combinada
- Click en celda → Modal de reserva
```

#### `src/components/reservas/VistaPlano.js`
```jsx
- Selector de fecha y turno
- Modo edición con PIN
- Mesas arrastrables (drag & drop)
- Guardar/cargar/restablecer posiciones
```

#### `src/components/reservas/VistaLista.js`
```jsx
- Tabla de todas las reservas
- Filtros: búsqueda, fecha, mesa
- Botón eliminar por reserva
```

#### `src/components/reservas/ModalReserva.js`
```jsx
- Formulario de reserva
- Campos: nombre, teléfono, PAX, notas
- Checkbox combinar mesas
- Selector de mesas adicionales
```

### Componentes de Analytics

#### `src/pages/analytics.js`
```jsx
- Dashboard con métricas clave
- Gráficas de tendencias (usar recharts)
- Top clientes VIP
- Clientes poco fiables
- Análisis de ocupación
```

### Componentes de Clientes

#### `src/pages/clientes.js`
```jsx
- Lista de clientes con filtros
- Clasificación visual (VIP, Standard, Poco fiable)
- Modal de detalles del cliente
- Historial de reservas
```

### Componentes Compartidos

#### `src/components/shared/Modal.js`
```jsx
- Modal reutilizable
- Overlay, close button
- Transiciones
```

#### `src/components/shared/Toast.js`
```jsx
- Notificaciones toast
- Success, error, warning, info
- Auto-dismiss
```

#### `src/components/shared/Loading.js`
```jsx
- Spinner de carga
- Skeleton screens
```

## 🎯 Opciones para Completar el Frontend

### Opción A: Crear Manualmente (Recomendado para aprender)

1. Crear cada componente siguiendo la estructura del HTML original
2. Usar los servicios de `src/lib/api.js`
3. Aplicar estilos con Tailwind CSS

Ejemplo básico de un componente:

```jsx
// src/components/reservas/VistaCuadricula.js
import { useState, useEffect } from 'react';
import { reservasAPI } from '@/lib/api';
import { HORARIOS_COMIDA, HORARIOS_CENA } from '@/lib/constants';
import { obtenerFechaHoy } from '@/lib/utils';
import ModalReserva from './ModalReserva';

export default function VistaCuadricula() {
  const [fecha, setFecha] = useState(obtenerFechaHoy());
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [datosModal, setDatosModal] = useState(null);

  useEffect(() => {
    cargarReservas();
  }, [fecha]);

  async function cargarReservas() {
    setLoading(true);
    try {
      const data = await reservasAPI.getAll({ fecha });
      setReservas(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function abrirModal(fecha, turno, hora, mesa) {
    setDatosModal({ fecha, turno, hora, mesa });
    setModalAbierto(true);
  }

  // ... resto de la lógica

  return (
    <div>
      {/* Selector de fecha */}
      <div className="mb-4">
        <label className="font-semibold mr-2">📅 Fecha:</label>
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="input"
        />
      </div>

      {/* Tabla de horarios */}
      {loading ? (
        <div>Cargando...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table">
            {/* ... renderizar tabla */}
          </table>
        </div>
      )}

      {/* Modal */}
      {modalAbierto && (
        <ModalReserva
          datos={datosModal}
          onClose={() => setModalAbierto(false)}
          onSave={cargarReservas}
        />
      )}
    </div>
  );
}
```

### Opción B: Usar HTML Original + API (Rápido)

Si quieres ir rápido a producción:

1. Copiar el HTML original a `public/sistema-reservas.html`
2. Agregar el script de integración de API
3. Modificar las funciones para usar las APIs en lugar de localStorage

```javascript
// Reemplazar en el HTML original:
async function obtenerReservas() {
  const response = await fetch('/api/reservas');
  return await response.json();
}

async function agregarReserva(reserva) {
  await fetch('/api/reservas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reserva)
  });
}
```

### Opción C: Generador Automático (Próximamente)

Estoy preparando un script que generará todos los componentes automáticamente.

## 📊 Prioridades

Si tienes tiempo limitado, crea en este orden:

1. **ModalReserva** - Crítico para crear reservas
2. **VistaCuadricula** - Vista principal
3. **VistaLista** - Para ver todas las reservas
4. **Analytics básico** - Dashboard con métricas
5. **VistaPlano** - Mesas arrastrables (menos crítico)
6. **Clientes** - Gestión de clientes (puede esperar)

## 🎨 Diseño

Todos los componentes deben usar:
- Tailwind CSS para estilos
- Colores de la paleta (primary, secondary, etc.)
- Animaciones suaves
- Responsive design

## 🔧 Testing Local

Una vez creados los componentes:

```bash
# Terminal 1: Backend
npm run server:dev

# Terminal 2: Frontend
npm run dev

# Abrir http://localhost:3000
```

## 📚 Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Hooks](https://react.dev/reference/react)

## ✅ Checklist

- [ ] VistaCuadricula creada
- [ ] VistaPlano creada
- [ ] VistaLista creada
- [ ] ModalReserva creado
- [ ] Página Analytics creada
- [ ] Página Clientes creada
- [ ] Toast notifications
- [ ] Loading states
- [ ] Error handling
- [ ] Responsive design verificado
- [ ] Testing en diferentes navegadores

---

**¿Necesitas ayuda?** Puedo crear cualquiera de estos componentes específicos si me lo indicas.
