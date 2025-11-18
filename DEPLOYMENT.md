# 🚀 Guía Completa de Despliegue

Esta guía te llevará paso a paso para desplegar el sistema de Casa José en Vercel con Supabase.

## 📋 Pre-requisitos

- [ ] Cuenta de GitHub (gratuita)
- [ ] Cuenta de Supabase (gratuita)
- [ ] Cuenta de Vercel (gratuita)

## Paso 1️⃣: Configurar Supabase

### 1.1 Crear Proyecto
1. Ir a [https://supabase.com](https://supabase.com)
2. Click en "Start your project"
3. Crear un nuevo proyecto:
   - **Name**: `casa-jose-reservas`
   - **Database Password**: Guardar en lugar seguro
   - **Region**: Elegir más cercana (ejemplo: West EU)
4. Esperar a que el proyecto se cree (~2 minutos)

### 1.2 Ejecutar Schema SQL
1. En el proyecto de Supabase, ir a "SQL Editor"
2. Click en "New query"
3. Copiar TODO el contenido de `database/schema.sql`
4. Pegar en el editor
5. Click en "Run" (esquina inferior derecha)
6. Verificar: "Success. No rows returned"

### 1.3 Copiar Credenciales
1. Ir a "Project Settings" → "API"
2. Copiar estos valores (los necesitarás después):

```
Project URL: https://xxxxxxxxxxxxx.supabase.co
anon public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **IMPORTANTE**: Guardar `service_role` en lugar seguro, es una clave secreta.

## Paso 2️⃣: Subir Código a GitHub

### 2.1 Crear Repositorio
1. Ir a [GitHub](https://github.com)
2. Click en "New repository"
3. Configurar:
   - **Name**: `casa-jose-reservas`
   - **Visibility**: Private (recomendado)
4. Click "Create repository"

### 2.2 Subir Código
En tu terminal, en la carpeta del proyecto:

```bash
# Inicializar git
git init

# Agregar archivos
git add .

# Crear commit
git commit -m "Sistema de reservas Casa José"

# Conectar con GitHub (reemplazar USERNAME)
git remote add origin https://github.com/USERNAME/casa-jose-reservas.git

# Subir código
git branch -M main
git push -u origin main
```

## Paso 3️⃣: Desplegar en Vercel

### 3.1 Importar Proyecto
1. Ir a [https://vercel.com](https://vercel.com)
2. Click en "Add New..." → "Project"
3. Importar repositorio de GitHub `casa-jose-reservas`
4. Click "Import"

### 3.2 Configurar Variables de Entorno
En la sección "Environment Variables", agregar:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Tu Project URL de Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Tu anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Tu service_role key |

⚠️ **Marcar todas como disponibles en**: Production, Preview, Development

### 3.3 Deploy
1. Click en "Deploy"
2. Esperar ~2-3 minutos
3. ¡Listo! Tu app está en línea

## Paso 4️⃣: Verificar Instalación

### 4.1 Health Check
Abrir en navegador:
```
https://tu-dominio.vercel.app/api/health
```

Debe retornar:
```json
{
  "status": "OK",
  "timestamp": "2024-..."
}
```

### 4.2 Probar Dashboard
```
https://tu-dominio.vercel.app/api/analytics/dashboard
```

Debe retornar datos vacíos (no hay reservas aún).

### 4.3 Crear Primera Reserva
1. Ir a tu dominio: `https://tu-dominio.vercel.app`
2. En Vista Cuadrícula, seleccionar fecha de hoy
3. Click en cualquier celda disponible
4. Llenar formulario y guardar
5. ¡Primera reserva creada!

## 🔄 Actualizar Código

Cuando hagas cambios al código:

```bash
# Hacer cambios en tu código
# ...

# Guardar cambios
git add .
git commit -m "Descripción de cambios"
git push

# Vercel desplegará automáticamente
```

## 🔧 Configuración Avanzada

### Dominio Personalizado

1. En Vercel, ir a proyecto → "Settings" → "Domains"
2. Agregar tu dominio (ejemplo: `reservas.casajose.com`)
3. Configurar DNS según instrucciones de Vercel
4. Esperar propagación (~24 horas máximo)

### Configurar Backup Automático

Supabase hace backups automáticos, pero puedes configurar adicionales:

1. En Supabase → "Database" → "Backups"
2. Ver historial de backups
3. Descargar backup manualmente si es necesario

### Monitoreo de Errores

1. Vercel automáticamente monitorea:
   - Errores de servidor
   - Tiempo de carga
   - Tráfico

2. Ver logs: Proyecto → "Logs"

## 🐛 Solución de Problemas

### Error 500 en /api/*

**Causa**: Variables de entorno mal configuradas

**Solución**:
1. Vercel → Proyecto → "Settings" → "Environment Variables"
2. Verificar que las 3 variables estén correctas
3. "Redeploy" el proyecto

### Base de datos vacía

**Causa**: Schema SQL no ejecutado

**Solución**:
1. Ir a Supabase SQL Editor
2. Ejecutar `database/schema.sql` de nuevo

### No se ven las reservas

**Causa**: Frontend no conecta con backend

**Solución**:
1. Verificar en DevTools (F12) → Console
2. Ver si hay errores de red
3. Verificar que el dominio sea correcto en llamadas API

### Clasificación de clientes no funciona

**Causa**: Función SQL no creada correctamente

**Solución**:
```sql
-- Ejecutar en Supabase SQL Editor
SELECT actualizar_estadisticas_cliente('cliente-uuid');
```

Si da error, re-ejecutar todo el schema.sql

## 📊 Datos de Prueba

Para probar el sistema con datos ficticios:

```sql
-- Ejecutar en Supabase SQL Editor

-- Crear clientes de prueba
INSERT INTO clientes (nombre, telefono, email) VALUES
  ('Juan Pérez', '600111222', 'juan@email.com'),
  ('María García', '600222333', 'maria@email.com'),
  ('Carlos López', '600333444', 'carlos@email.com');

-- Ver clientes creados
SELECT * FROM clientes;
```

Luego crear reservas desde la interfaz web.

## 🔐 Seguridad

### Buenas Prácticas

✅ **HACER**:
- Mantener `service_role` key en secreto
- Usar HTTPS (Vercel lo hace automáticamente)
- Hacer backups regulares de Supabase
- Revisar logs de Vercel regularmente

❌ **NO HACER**:
- Compartir credenciales de Supabase
- Subir `.env` a GitHub (ya está en `.gitignore`)
- Usar `service_role` en el frontend
- Dar acceso público al repositorio

### Row Level Security (Opcional)

Para máxima seguridad, habilitar RLS en Supabase:

```sql
-- Ejecutar en Supabase SQL Editor
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mesas_posiciones ENABLE ROW LEVEL SECURITY;

-- Crear políticas según tus necesidades
```

⚠️ Esto requiere configuración adicional de autenticación.

## 📈 Escalabilidad

### Límites del Tier Gratuito

**Supabase Free**:
- 500 MB de base de datos
- 2 GB de almacenamiento de archivos
- 5 GB de ancho de banda

**Vercel Free**:
- 100 GB de ancho de banda
- Despliegues ilimitados

### ¿Cuándo Actualizar?

Considera tier de pago cuando:
- BD > 400 MB (upgrade Supabase a $25/mes)
- > 100K visitas/mes (upgrade Vercel a $20/mes)
- Necesites soporte prioritario

## ✅ Checklist de Despliegue

- [ ] Proyecto creado en Supabase
- [ ] Schema SQL ejecutado correctamente
- [ ] Credenciales de Supabase copiadas
- [ ] Código subido a GitHub
- [ ] Proyecto importado en Vercel
- [ ] Variables de entorno configuradas
- [ ] Deploy completado exitosamente
- [ ] Health check funciona
- [ ] Primera reserva creada correctamente
- [ ] Analytics muestra datos

## 🎉 ¡Listo!

Tu sistema de reservas está en producción.

**URL de tu aplicación**: `https://tu-dominio.vercel.app`

**Compartir con el equipo**:
- URL principal
- Credenciales de acceso (si hay login)
- Manual de usuario

---

**¿Necesitas ayuda?** Consulta el README.md o contacta al desarrollador.
