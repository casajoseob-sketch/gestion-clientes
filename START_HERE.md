# 🚀 EMPIEZA AQUÍ - Casa José Reservas

## ✅ ¡Proyecto Completado!

Has recibido un **sistema completo full-stack** con:

### 🎯 Backend (Node.js + Express)
- ✅ 4 APIs completas (Reservas, Clientes, Mesas, Analytics)
- ✅ Base de datos PostgreSQL en Supabase
- ✅ Clasificación automática de clientes
- ✅ Sistema de triggers y funciones SQL

### 🎨 Frontend (Next.js + React)
- ✅ 3 vistas de reservas (Cuadrícula, Plano, Lista)
- ✅ Dashboard de Analytics con gráficas
- ✅ Modales interactivos
- ✅ Diseño responsive con Tailwind CSS

## 📁 Estructura del Proyecto

```
casa-jose-reservas/
├── database/
│   └── schema.sql                  ← Ejecutar en Supabase
│
├── server/                         ← BACKEND
│   ├── index.js
│   ├── config/supabase.js
│   └── routes/
│       ├── reservas.js
│       ├── clientes.js
│       ├── mesas.js
│       └── analytics.js
│
├── src/                            ← FRONTEND
│   ├── pages/
│   │   ├── _app.js
│   │   ├── index.js                (Reservas)
│   │   └── analytics.js            (Analytics)
│   ├── components/
│   │   ├── Layout.js
│   │   └── reservas/
│   │       ├── VistaCuadricula.js
│   │       ├── VistaPlano.js
│   │       ├── VistaLista.js
│   │       ├── ModalReserva.js
│   │       └── ModalInfoReserva.js
│   ├── lib/
│   │   ├── api.js                  (Cliente API)
│   │   ├── constants.js
│   │   └── utils.js
│   └── styles/
│       └── globals.css
│
├── .env.example
├── package.json
├── README.md
├── DEPLOYMENT.md
└── QUICK_START.md
```

## 🚀 INICIO RÁPIDO (5 Pasos)

### Paso 1: Configurar Supabase

1. Crear cuenta en [supabase.com](https://supabase.com)
2. Crear nuevo proyecto
3. En SQL Editor, ejecutar `database/schema.sql`
4. Ir a Settings → API y copiar:
   - Project URL
   - anon public key
   - service_role key

### Paso 2: Instalar Dependencias

```bash
cd casa-jose-reservas
npm install
```

### Paso 3: Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con tus credenciales de Supabase
```

`.env` debe contener:
```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima
SUPABASE_SERVICE_ROLE_KEY=tu-clave-de-servicio
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Paso 4: Iniciar Backend

```bash
npm run server:dev
```

Deberías ver:
```
🚀 Servidor corriendo en http://localhost:3001
📊 API disponible en http://localhost:3001/api
```

Verificar: http://localhost:3001/api/health

### Paso 5: Iniciar Frontend

En **otra terminal**:

```bash
npm run dev
```

Deberías ver:
```
ready - started server on 0.0.0.0:3000
```

Abrir: **http://localhost:3000**

## 🎉 ¡Ya está funcionando!

Ahora puedes:

1. **Crear Reservas**:
   - Ir a Vista Cuadrícula
   - Seleccionar fecha de hoy
   - Click en celda disponible
   - Llenar formulario

2. **Ver Analytics**:
   - Click en pestaña "Analytics"
   - Ver dashboard con métricas
   - Explorar gráficas

3. **Gestionar Clientes**:
   - Se crean automáticamente al hacer reservas
   - Clasificación automática (VIP, Standard, Poco Fiable)

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Frontend (puerto 3000)
npm run server:dev       # Backend (puerto 3001)

# Producción
npm run build            # Build de Next.js
npm start                # Start Next.js producción
npm run server           # Backend producción
```

## 📊 Funcionalidades Principales

### 1. Sistema de Reservas

#### Vista Cuadrícula
- Tabla con horarios (filas) y mesas (columnas)
- Estados visuales: disponible, reservada, combinada
- Click para crear o ver reserva

#### Vista Plano
- Mapa visual del restaurante
- Mesas con estado en tiempo real
- Click en mesa para reservar

#### Vista Lista
- Tabla completa de reservas
- Filtros por nombre, fecha, mesa
- Búsqueda en tiempo real

### 2. Analytics

#### Dashboard General
- Total clientes, reservas, ingresos
- Ticket medio
- Tasa de cancelación

#### Gráficas
- Tendencias de reservas
- Ingresos por período
- Clasificación de clientes
- Estados de reservas

#### Top Clientes VIP
- Ranking por importe total
- Estadísticas detalladas

#### Mesas Más Usadas
- Análisis de ocupación
- Preferencias de clientes

### 3. Clasificación Automática

El sistema clasifica automáticamente a los clientes:

**🏆 VIP**
- ≥ 10 visitas completadas
- Ticket medio ≥ 30€
- < 10% de problemas

**⭐ Standard**
- Comportamiento normal

**⚠️ Poco Fiable**
- > 30% cancelaciones/no-shows

## 🐛 Solución de Problemas

### Error: "Faltan variables de entorno"
✅ Verificar que `.env` existe y tiene todas las variables

### Backend no inicia
✅ Verificar que puerto 3001 esté libre
✅ Comprobar credenciales de Supabase

### Frontend no conecta con Backend
✅ Verificar que backend esté corriendo en puerto 3001
✅ Comprobar `NEXT_PUBLIC_API_URL` en .env

### No aparecen datos
✅ Verificar que schema SQL se ejecutó correctamente
✅ Crear primera reserva manualmente

## 📈 Próximos Pasos

### Despliegue a Producción

1. **Seguir DEPLOYMENT.md** para instrucciones detalladas
2. **Subir a GitHub**
3. **Desplegar en Vercel** (frontend + backend)
4. **¡Listo para usar!**

### Mejoras Opcionales

1. **Autenticación**: Agregar login para staff
2. **Notificaciones**: Email/SMS de confirmación
3. **Vista Plano Avanzada**: Drag & drop de mesas
4. **Exportar PDF**: Reportes descargables
5. **Integración WhatsApp**: Confirmaciones automáticas

## 🎓 Recursos

### Documentación del Proyecto
- `README.md` - Visión general
- `DEPLOYMENT.md` - Guía de despliegue
- `ARCHITECTURE.md` - Arquitectura técnica
- `QUICK_START.md` - Inicio rápido
- `FRONTEND_STATUS.md` - Estado del frontend

### Tecnologías Utilizadas
- [Next.js](https://nextjs.org)
- [React](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Supabase](https://supabase.com)
- [Express](https://expressjs.com)
- [Recharts](https://recharts.org)

## ✅ Checklist de Verificación

Antes de desplegar, verifica:

- [ ] Schema SQL ejecutado en Supabase
- [ ] Variables de entorno configuradas
- [ ] Backend inicia sin errores
- [ ] Frontend inicia sin errores
- [ ] Puedes crear una reserva
- [ ] Analytics muestra datos
- [ ] Clasificación de clientes funciona
- [ ] Todas las vistas de reservas funcionan
- [ ] Modales se abren y cierran correctamente

## 🎯 Testing Rápido

```bash
# 1. Health check del backend
curl http://localhost:3001/api/health

# 2. Crear primera reserva desde UI
# - Ir a http://localhost:3000
# - Vista Cuadrícula
# - Seleccionar hoy
# - Click en celda
# - Llenar formulario
# - Guardar

# 3. Ver en Analytics
# - Click en pestaña Analytics
# - Verificar que aparecen datos

# 4. Ver en Vista Lista
# - Click en Vista Lista
# - Ver reserva creada
```

## 📞 Soporte

Si encuentras problemas:

1. Revisar los logs del backend (terminal 1)
2. Revisar console del navegador (F12)
3. Consultar `README.md` y `DEPLOYMENT.md`
4. Verificar que Supabase está activo

## 🎉 ¡Felicidades!

Tienes un sistema completo de gestión de reservas con:

- ✅ Backend robusto con API REST
- ✅ Frontend moderno con Next.js
- ✅ Base de datos PostgreSQL
- ✅ Analytics en tiempo real
- ✅ Clasificación automática de clientes
- ✅ Listo para desplegar en producción

**Tiempo de desarrollo**: Sistema completo profesional
**Tecnologías**: Next.js, React, Node.js, PostgreSQL, Tailwind CSS
**Listo para**: Producción

---

**¿Siguiente paso?** → Seguir `DEPLOYMENT.md` para desplegar en Vercel

**Desarrollado con ❤️ para Casa José**
