# 🏗️ Arquitectura del Sistema

## 📊 Diagrama General

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENTE                              │
│                    (Navegador Web)                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTPS
                     │
┌────────────────────▼────────────────────────────────────────┐
│                    VERCEL (Frontend)                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Next.js Application                         │  │
│  │  • Vista Cuadrícula (Tabla de horarios)             │  │
│  │  • Vista Plano (Mesas arrastrables)                 │  │
│  │  • Vista Lista (Tabla de reservas)                  │  │
│  │  • Dashboard Analytics                               │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ API REST
                     │
┌────────────────────▼────────────────────────────────────────┐
│                  VERCEL (Backend)                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Express.js Server                           │  │
│  │                                                        │  │
│  │  Rutas:                                               │  │
│  │  • /api/reservas    → CRUD reservas                  │  │
│  │  • /api/clientes    → Gestión clientes               │  │
│  │  • /api/mesas       → Posiciones mesas               │  │
│  │  • /api/analytics   → Estadísticas                   │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ PostgreSQL Client
                     │
┌────────────────────▼────────────────────────────────────────┐
│                   SUPABASE                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           PostgreSQL Database                         │  │
│  │                                                        │  │
│  │  Tablas:                                              │  │
│  │  • clientes                                           │  │
│  │  • reservas                                           │  │
│  │  • mesas_posiciones                                   │  │
│  │  • historial_clasificacion                           │  │
│  │                                                        │  │
│  │  Funciones:                                           │  │
│  │  • actualizar_estadisticas_cliente()                 │  │
│  │                                                        │  │
│  │  Triggers:                                            │  │
│  │  • Actualización automática de updated_at            │  │
│  │  • Recalcular clasificación tras reserva             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Flujo de Datos

### 1. Crear una Reserva

```
Usuario → Frontend → Backend → Supabase
  ↓         ↓          ↓          ↓
Formulario  Validación Verificar   Buscar/Crear
            React     disponibilidad Cliente
                         ↓          ↓
                      Guardar    Trigger:
                      Reserva    Actualizar
                                 Estadísticas
                                    ↓
                                 Recalcular
                                Clasificación
```

### 2. Clasificación Automática

```
Nueva Reserva → Trigger SQL → Calcular Estadísticas
                                  ↓
                    ┌─────────────┴──────────────┐
                    │                            │
                Visitas ≥ 10              % Problemas > 30%
              Ticket Alto ≥ 30€                 │
              % Problemas < 10%                 │
                    ↓                            ↓
                  VIP                      POCO FIABLE
                    │                            │
                    └────────┬───────────────────┘
                             ↓
                        STANDARD
                             ↓
                   Guardar en historial
                   si hubo cambio
```

### 3. Analytics Dashboard

```
Frontend → GET /api/analytics/dashboard
             ↓
          Backend
             ↓
    ┌────────┴─────────┐
    │                  │
Consultas SQL      Agregaciones
    │                  │
    └────────┬─────────┘
             ↓
     Respuesta JSON
             ↓
          Frontend
             ↓
    Renderizar Gráficas
```

## 🗂️ Modelo de Datos

### Tabla: `clientes`

```sql
id                          UUID (PK)
nombre                      VARCHAR(255)
telefono                    VARCHAR(20) UNIQUE
email                       VARCHAR(255)
clasificacion               VARCHAR(50)  -- 'vip', 'standard', 'poco_fiable'
total_visitas               INTEGER
total_cancelaciones         INTEGER
total_no_shows              INTEGER
importe_total               DECIMAL(10,2)
importe_medio_por_comensal  DECIMAL(10,2)
ultima_visita               DATE
created_at, updated_at      TIMESTAMP
```

### Tabla: `reservas`

```sql
id                          UUID (PK)
cliente_id                  UUID (FK → clientes)
fecha                       DATE
turno                       VARCHAR(10)  -- 'comida', 'cena'
hora                        TIME
mesa                        VARCHAR(10)
mesas_combinadas            JSONB        -- ["M1", "M2", ...]
nombre_cliente              VARCHAR(255)
telefono_cliente            VARCHAR(20)
pax                         INTEGER
notas                       TEXT
estado                      VARCHAR(50)  -- 'confirmada', 'completada', ...
importe_total               DECIMAL(10,2)
importe_por_comensal        DECIMAL(10,2)
cancelada_por               VARCHAR(100)
fecha_cancelacion           TIMESTAMP
tiempo_antelacion_cancelacion INTEGER    -- en horas
created_at, updated_at      TIMESTAMP
```

### Relaciones

```
clientes (1) ──┐
               ├──< (N) reservas
               │
               └──< (N) historial_clasificacion
```

## 🔐 Seguridad

### Variables de Entorno

```
┌──────────────────────────────────────┐
│         FRONTEND (Público)           │
│  • NEXT_PUBLIC_SUPABASE_URL         │
│  • NEXT_PUBLIC_SUPABASE_ANON_KEY    │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│        BACKEND (Privado)             │
│  • SUPABASE_SERVICE_ROLE_KEY        │
└──────────────────────────────────────┘
```

⚠️ **NUNCA exponer** `SERVICE_ROLE_KEY` en el cliente.

### Niveles de Acceso

```
ANON KEY (Frontend)
  ↓
Permisos básicos de lectura/escritura
  ↓
Políticas de RLS (opcional)

SERVICE ROLE KEY (Backend)
  ↓
Acceso completo a la base de datos
  ↓
Bypass de RLS
```

## 📈 Escalabilidad

### Recursos por Tier

#### Free Tier (Actual)
```
Vercel:      100 GB bandwidth/mes
Supabase:    500 MB database
             2 GB storage
             5 GB bandwidth
```

#### Uso Estimado
```
1000 reservas/mes ≈ 5 MB
1000 clientes     ≈ 2 MB
Total proyectado: < 100 MB/año

✅ Free tier suficiente para años
```

### Crecimiento

```
0-1K reservas/mes    → Free Tier
1K-10K reservas/mes  → Considerar Supabase Pro ($25/mes)
10K+ reservas/mes    → Vercel Pro ($20/mes) + Supabase Pro
```

## 🚀 Performance

### Optimizaciones Implementadas

1. **Índices de Base de Datos**
   ```sql
   CREATE INDEX idx_reservas_fecha ON reservas(fecha);
   CREATE INDEX idx_reservas_cliente_id ON reservas(cliente_id);
   CREATE INDEX idx_clientes_telefono ON clientes(telefono);
   ```

2. **Triggers Automáticos**
   - Actualización de `updated_at`
   - Recalculación de estadísticas

3. **Consultas Optimizadas**
   - Select específico de campos
   - Joins eficientes
   - Agregaciones en SQL (no en JS)

### Métricas Esperadas

```
Tiempo de carga página:     < 2s
Respuesta API:              < 300ms
Query SQL:                  < 100ms
```

## 🔄 CI/CD Pipeline

```
Código Local
    ↓
  git push
    ↓
  GitHub
    ↓
Webhook → Vercel
    ↓
┌─────────────┐
│   Build     │
│  • Next.js  │
│  • Express  │
└──────┬──────┘
       ↓
┌─────────────┐
│   Deploy    │
│  • Frontend │
│  • Backend  │
└──────┬──────┘
       ↓
┌─────────────┐
│  Production │
└─────────────┘

Tiempo total: ~2-3 minutos
```

## 🧪 Testing

### Niveles de Testing (Recomendado)

1. **Unit Tests** (Futuro)
   - Funciones de validación
   - Cálculos de estadísticas

2. **Integration Tests** (Futuro)
   - API endpoints
   - Operaciones CRUD

3. **E2E Tests** (Futuro)
   - Flujo completo de reserva
   - Dashboard analytics

### Testing Manual Actual

```
✓ Health check: /api/health
✓ Crear reserva
✓ Listar reservas
✓ Verificar clasificación automática
✓ Dashboard analytics
```

## 📊 Monitoreo

### Logs de Vercel

```
Proyecto → Logs → Filtrar:
  • Errores (status 5xx)
  • Slow queries (> 1s)
  • Failures
```

### Métricas de Supabase

```
Dashboard → Database:
  • Tamaño de BD
  • Queries por minuto
  • Conexiones activas
```

## 🔮 Próximas Mejoras

1. **Autenticación**
   - Login para staff
   - Roles (admin, recepcionista)

2. **Notificaciones**
   - Email confirmación
   - SMS recordatorio

3. **Reporting Avanzado**
   - PDFs exportables
   - Excel con estadísticas

4. **Integración WhatsApp**
   - Confirmar reservas
   - Enviar recordatorios

---

**Última actualización**: 2024
