# 🚀 Inicio Rápido - HTML + API

## ✅ ¡Sistema Listo para Usar!

Has elegido la opción **HTML + API**, que es:
- ✅ Más rápida de implementar
- ✅ Más fácil de mantener
- ✅ Perfecta para empezar
- ✅ Lista para producción

### 📁 Archivos Creados

```
casa-jose-reservas/
├── public/
│   ├── index.html          ← Frontend (interfaz)
│   ├── api-client.js       ← Cliente API
│   └── app.js              ← Lógica de aplicación
├── server/
│   └── index.js            ← Servidor (actualizado)
└── database/
    └── schema.sql          ← Base de datos
```

## 🚀 INICIO EN 3 PASOS

### Paso 1: Configurar Supabase

1. Ir a [supabase.com](https://supabase.com)
2. Crear nuevo proyecto
3. En SQL Editor, ejecutar `database/schema.sql`
4. Ir a Settings → API y copiar:
   - `Project URL`
   - `anon public key`
   - `service_role key`

### Paso 2: Configurar Variables

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con tus credenciales
```

Tu `.env` debe contener:
```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima
SUPABASE_SERVICE_ROLE_KEY=tu-clave-de-servicio
```

### Paso 3: Iniciar Servidor

```bash
# Instalar dependencias (solo primera vez)
npm install

# Iniciar servidor
npm run server:dev
```

Deberías ver:
```
🚀 Servidor corriendo en http://localhost:3001
📊 API disponible en http://localhost:3001/api
🌐 Frontend disponible en http://localhost:3001
```

## 🎉 ¡Listo! Abrir Navegador

**Ir a:** http://localhost:3001

Verás el sistema de reservas completo funcionando.

## 📊 Funcionalidades Disponibles

### Vista Cuadrícula
- ✅ Tabla de horarios × mesas
- ✅ Ver disponibilidad en tiempo real
- ✅ Crear reserva con 1 click
- ✅ Ver detalles de reserva existente

### Vista Lista
- ✅ Todas las reservas en tabla
- ✅ Buscar por nombre
- ✅ Filtrar por fecha
- ✅ Eliminar reservas

### Gestión de Reservas
- ✅ Crear nueva reserva
- ✅ Ver información completa
- ✅ Eliminar reserva
- ✅ Notificaciones toast

## 🔧 Arquitectura

```
┌─────────────────────────────┐
│   Navegador                 │
│   http://localhost:3001     │
│                             │
│   ┌─────────────────────┐   │
│   │  index.html         │   │
│   │  + api-client.js    │   │
│   │  + app.js           │   │
│   └──────────┬──────────┘   │
└──────────────┼──────────────┘
               │
               │ HTTP Requests
               │
┌──────────────▼──────────────┐
│   Servidor Express          │
│   http://localhost:3001     │
│                             │
│   • Sirve archivos HTML     │
│   • API REST (/api/*)       │
│   • Conecta con Supabase    │
└──────────────┬──────────────┘
               │
               │ SQL Queries
               │
┌──────────────▼──────────────┐
│   Supabase PostgreSQL       │
│                             │
│   • Tablas de reservas      │
│   • Triggers automáticos    │
│   • Clasificación clientes  │
└─────────────────────────────┘
```

## 📝 Crear Primera Reserva

1. Abrir http://localhost:3001
2. Seleccionar fecha de hoy (botón "Hoy")
3. Click en cualquier celda disponible (+)
4. Llenar formulario:
   - Nombre: Juan Pérez
   - Teléfono: 600111222
   - PAX: 4
   - Notas: (opcional)
5. Click "Guardar Reserva"
6. ✅ ¡Reserva creada!

## 🔍 Ver Reservas

### En Vista Cuadrícula
- Las reservas aparecen con el nombre del cliente
- Color rojo = reservada
- Click para ver detalles

### En Vista Lista
- Todas las reservas en tabla
- Buscar: escribe nombre o teléfono
- Filtrar: selecciona fecha
- Eliminar: click en 🗑️

## 🎨 Personalización

### Cambiar Colores

Editar `public/index.html`:
```css
:root {
    --primary: #0fb9b1;      /* Turquesa */
    --secondary: #c19031;    /* Dorado */
    --accent: #e74c3c;       /* Rojo */
}
```

### Cambiar Horarios

Editar `public/app.js`:
```javascript
const HORARIOS_COMIDA = ["13:00", "13:30", ...];
const HORARIOS_CENA = ["20:00", "20:30", ...];
```

### Cambiar Número de Mesas

Editar `public/app.js`:
```javascript
const MESAS_TOTALES = 20;  // Cambiar a tu cantidad
```

## 🚀 Desplegar a Producción

### Opción 1: Vercel (Recomendado)

1. Subir código a GitHub
2. Ir a [vercel.com](https://vercel.com)
3. Importar repositorio
4. Configurar variables de entorno
5. Deploy!

Ver guía completa en `DEPLOYMENT.md`

### Opción 2: Servidor VPS

```bash
# En tu servidor
git clone tu-repositorio
cd casa-jose-reservas
npm install
npm run server  # Producción
```

Usar PM2 para mantener el servidor:
```bash
npm install -g pm2
pm2 start server/index.js --name casa-jose
pm2 save
pm2 startup
```

## 🐛 Solución de Problemas

### No carga el frontend

✅ Verificar que el servidor está corriendo
✅ Abrir http://localhost:3001 (no 3000)
✅ Ver console del navegador (F12)

### Error al crear reserva

✅ Verificar que Supabase está configurado
✅ Verificar `.env` con credenciales correctas
✅ Ver terminal del servidor para logs

### No aparecen reservas

✅ Abrir F12 → Network → Ver si hay errores
✅ Verificar que backend responde en `/api/reservas`
✅ Probar crear una reserva nueva

## 📊 API Endpoints Disponibles

```
GET    /api/reservas           → Todas las reservas
GET    /api/reservas/:id       → Una reserva
POST   /api/reservas           → Crear reserva
DELETE /api/reservas/:id       → Eliminar reserva

GET    /api/clientes           → Todos los clientes
GET    /api/analytics/dashboard → Dashboard analytics
```

## 💡 Tips

### Desarrollo
- Backend auto-reload: `npm run server:dev`
- Ver logs en terminal del servidor
- Console del navegador para debugging

### Producción
- Usar HTTPS (Vercel lo hace automático)
- Configurar variables de entorno
- Hacer backup de base de datos

### Rendimiento
- El servidor sirve archivos estáticos muy rápido
- Las APIs responden en <300ms
- Base de datos con índices optimizados

## ✅ Checklist

Antes de usar en producción:

- [ ] Schema SQL ejecutado en Supabase
- [ ] Variables de entorno configuradas
- [ ] Servidor inicia sin errores
- [ ] Puedes crear una reserva
- [ ] Puedes ver reservas en cuadrícula
- [ ] Puedes ver reservas en lista
- [ ] Puedes eliminar una reserva
- [ ] Analytics funciona (en Next.js)

## 🆚 HTML vs Next.js

### ¿Por qué elegiste HTML?

**Ventajas:**
- ✅ Más simple
- ✅ Menos dependencias
- ✅ Más rápido de implementar
- ✅ Fácil de entender
- ✅ Un solo servidor (puerto 3001)

**Desventajas:**
- ⚠️ Sin routing avanzado
- ⚠️ Sin server-side rendering
- ⚠️ Menos features modernas

### Si quieres Next.js en el futuro

Los componentes React ya están creados en `src/`:
- Solo necesitas instalar dependencias
- Y ejecutar `npm run dev` (frontend)
- Servidor separado: `npm run server:dev` (backend)

## 📚 Próximos Pasos

1. **Crear reservas de prueba** para familiarizarte
2. **Personalizar colores y horarios** según tu negocio
3. **Ver analytics** (si usas Next.js)
4. **Desplegar a producción** siguiendo DEPLOYMENT.md

## 🎯 Estructura de Archivos

### `public/index.html`
- Interfaz principal
- Estilos CSS embebidos
- Estructura HTML

### `public/api-client.js`
- Funciones para llamar API
- Manejo de errores
- Utilidades

### `public/app.js`
- Lógica de aplicación
- Renderizado de vistas
- Gestión de modales

## 🔐 Seguridad

- ✅ Variables sensibles en `.env`
- ✅ CORS configurado en servidor
- ✅ Validaciones en backend
- ✅ HTTPS en producción (Vercel)

## 📞 Ayuda

Si tienes problemas:

1. Ver logs del servidor (terminal)
2. Ver console del navegador (F12)
3. Consultar `README.md`
4. Revisar `DEPLOYMENT.md`

---

## 🎉 ¡Felicidades!

Tienes un sistema profesional funcionando con:
- ✅ Frontend HTML responsivo
- ✅ API REST completa
- ✅ Base de datos PostgreSQL
- ✅ Clasificación automática de clientes
- ✅ Listo para producción

**Siguiente paso:** Crear tu primera reserva y explorar el sistema.

**Desarrollado con ❤️ para Casa José**
