# 🍽️ Casa José - Sistema de Gestión de Reservas

Sistema completo de gestión de reservas con análisis de clientes, clasificación automática y dashboard de analytics.

## 🚀 Características

### 📊 Gestión de Reservas
- Vista Cuadrícula: Tabla tipo planilla con horarios y mesas
- Vista Plano: Mapa visual con mesas arrastrables
- Vista Lista: Tabla completa de todas las reservas
- Sistema de combinación de mesas
- Validación de disponibilidad en tiempo real
- Estados: Confirmada, Completada, Cancelada, No-show

### 👥 Análisis de Clientes
- **Tracking automático** de todas las visitas
- **Clasificación inteligente**:
  - **VIP**: >10 visitas, ticket medio alto, <10% problemas
  - **Standard**: Comportamiento normal
  - **Poco fiable**: >30% cancelaciones/no-shows
- **Estadísticas por cliente**:
  - Frecuencia de visitas
  - Importe total y medio por comensal
  - Tasa de cancelación
  - Historial completo

### 📈 Dashboard de Analytics
- Resumen general del negocio
- Tendencias de reservas e ingresos
- Análisis de ocupación por mesa y horario
- Top clientes VIP
- Identificación de clientes problemáticos
- Reportes de ingresos por período

### 🎨 Diseño
- Paleta de colores personalizada (turquesa, dorado, rojo)
- Responsive para móviles y tablets
- Interfaz moderna con Tailwind CSS

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14 + React + Tailwind CSS
- **Backend**: Node.js + Express
- **Base de Datos**: Supabase (PostgreSQL)
- **Despliegue**: Vercel

## 📋 Requisitos Previos

- Node.js 18+
- Cuenta de Supabase (gratuita)
- Cuenta de Vercel (gratuita)

## 🔧 Instalación Local

### 1. Configurar Supabase

1. Crear cuenta en [Supabase](https://supabase.com)
2. Crear un nuevo proyecto
3. En SQL Editor, ejecutar el archivo `database/schema.sql`
4. Copiar:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Clonar y Configurar

```bash
# Instalar dependencias
npm install

# Copiar archivo de entorno
cp .env.example .env

# Editar .env con tus credenciales de Supabase
```

### 3. Iniciar Desarrollo

```bash
# Terminal 1: Backend (Puerto 3001)
npm run server:dev

# Terminal 2: Frontend (Puerto 3000)
npm run dev
```

Abrir: `http://localhost:3000`

## 📦 Estructura del Proyecto

```
casa-jose-reservas/
├── database/
│   └── schema.sql              # Esquema de base de datos
├── server/
│   ├── index.js                # Servidor Express
│   ├── config/
│   │   └── supabase.js         # Cliente de Supabase
│   └── routes/
│       ├── reservas.js         # API de reservas
│       ├── clientes.js         # API de clientes
│       ├── mesas.js            # API de mesas
│       └── analytics.js        # API de analytics
├── src/
│   ├── pages/                  # Páginas de Next.js
│   ├── components/             # Componentes React
│   └── lib/                    # Utilidades
├── .env.example
├── package.json
├── next.config.js
└── tailwind.config.js
```

## 🌐 API Endpoints

### Reservas
- `GET /api/reservas` - Listar reservas
- `GET /api/reservas/:id` - Obtener reserva
- `POST /api/reservas` - Crear reserva
- `PUT /api/reservas/:id` - Actualizar reserva
- `PATCH /api/reservas/:id/estado` - Cambiar estado
- `DELETE /api/reservas/:id` - Eliminar reserva

### Clientes
- `GET /api/clientes` - Listar clientes
- `GET /api/clientes/:id` - Obtener cliente
- `GET /api/clientes/:id/reservas` - Historial de reservas
- `GET /api/clientes/:id/estadisticas` - Estadísticas del cliente
- `POST /api/clientes` - Crear cliente
- `PUT /api/clientes/:id` - Actualizar cliente
- `PATCH /api/clientes/:id/clasificacion` - Cambiar clasificación
- `POST /api/clientes/:id/recalcular` - Recalcular estadísticas

### Mesas
- `GET /api/mesas` - Obtener posiciones
- `PUT /api/mesas/:mesa` - Actualizar posición
- `POST /api/mesas/actualizar-posiciones` - Actualizar múltiples
- `POST /api/mesas/restablecer` - Restablecer posiciones

### Analytics
- `GET /api/analytics/dashboard` - Dashboard general
- `GET /api/analytics/tendencias` - Tendencias de reservas
- `GET /api/analytics/ocupacion` - Análisis de ocupación
- `GET /api/analytics/clientes-vip` - Clientes VIP
- `GET /api/analytics/clientes-poco-fiables` - Clientes problemáticos
- `GET /api/analytics/ingresos` - Reporte de ingresos

## 🚀 Despliegue en Vercel

### Opción 1: Desde GitHub (Recomendado)

1. Subir el proyecto a GitHub
2. Ir a [Vercel](https://vercel.com)
3. Importar repositorio
4. Configurar variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Deploy!

### Opción 2: CLI de Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configurar variables de entorno en dashboard
```

## 🎯 Clasificación Automática de Clientes

El sistema clasifica automáticamente a los clientes usando triggers de PostgreSQL:

### Criterios de Clasificación

#### 🏆 VIP
- ≥ 10 visitas completadas
- Ticket medio ≥ 30€ por comensal
- < 10% de cancelaciones/no-shows

#### ⭐ Standard
- Comportamiento normal
- No cumple criterios de VIP ni Poco Fiable

#### ⚠️ Poco Fiable
- > 30% de cancelaciones/no-shows
- Se recalcula automáticamente después de cada reserva

### Recalcular Manualmente

```bash
curl -X POST http://localhost:3001/api/clientes/{id}/recalcular
```

## 📊 Ejemplos de Uso de Analytics

### Dashboard General
```bash
GET /api/analytics/dashboard?desde=2024-01-01&hasta=2024-12-31
```

Retorna:
- Total de clientes
- Total de reservas
- Ingresos totales
- Ticket medio
- Tasa de cancelación
- Top 10 clientes
- Mesas más usadas

### Tendencias
```bash
GET /api/analytics/tendencias?periodo=mes
```

Parámetros: `dia`, `semana`, `mes`

### Ocupación
```bash
GET /api/analytics/ocupacion?fecha=2024-06-15
```

Muestra ocupación por horario y turno.

## 🔐 Seguridad

- Variables de entorno para credenciales sensibles
- Service Role Key solo en servidor (nunca en cliente)
- Validaciones en backend y frontend
- Row Level Security (RLS) en Supabase (opcional)

## 🐛 Solución de Problemas

### Error: "Faltan variables de entorno de Supabase"
Verificar que `.env` tenga todas las variables necesarias.

### Error de conexión a Supabase
- Verificar que el proyecto de Supabase esté activo
- Comprobar que las credenciales sean correctas
- Verificar que el schema SQL se haya ejecutado

### Backend no inicia
```bash
# Verificar puerto 3001 libre
lsof -i :3001

# Matar proceso si es necesario
kill -9 <PID>
```

## 📝 Notas Importantes

### Capacidades de Mesas
- Mesas rectangulares (M1-M13): 4 personas
- Mesas circulares (M14-M20): 6 personas
- Se pueden combinar mesas para grupos grandes

### Horarios
- **Comida**: 13:00 a 16:30 (intervalos de 30 min)
- **Cena**: 20:00 a 23:30 (intervalos de 30 min)

### Estados de Reserva
1. **Confirmada**: Reserva activa
2. **Completada**: Cliente vino y consumió (agregar importes)
3. **Cancelada**: Cliente canceló
4. **No-show**: Cliente no vino

## 🤝 Contribuir

Este proyecto fue creado específicamente para Casa José. Para personalizarlo:

1. Cambiar colores en `tailwind.config.js`
2. Modificar capacidades de mesas en el schema SQL
3. Ajustar criterios de clasificación en `database/schema.sql` (función `actualizar_estadisticas_cliente`)

## 📄 Licencia

Proyecto propietario de Casa José.

## 🆘 Soporte

Para reportar problemas o sugerencias, contactar con el desarrollador.

---

**Desarrollado con ❤️ para Casa José**
