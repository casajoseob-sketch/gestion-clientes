# 🚀 Guía de Deployment en Vercel - Casa José Reservas

## ✅ Cambios Realizados

Se ha actualizado el proyecto para ser 100% compatible con Vercel:

1. ✅ Creada estructura `pages/` y `pages/api/` para Next.js
2. ✅ Simplificado `vercel.json`
3. ✅ Agregado health check en `/api/health`
4. ✅ Frontend HTML servido desde `public/`

## 📋 Variables de Entorno Requeridas

**IMPORTANTE**: Debes configurar estas variables de entorno en Vercel antes de desplegar:

### En Vercel Dashboard → Settings → Environment Variables:

```bash
# Supabase URL (obtenerlo de tu proyecto Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co

# Supabase Anon Key (clave pública)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase Service Role Key (clave privada - IMPORTANTE!)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Node Environment (automático en Vercel, pero puedes agregarlo)
NODE_ENV=production
```

### 🔍 Cómo Obtener las Credenciales de Supabase:

1. Ve a [supabase.com](https://supabase.com)
2. Abre tu proyecto
3. Ve a **Settings** → **API**
4. Copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ MANTENER SECRETA

## 🚀 Pasos para Desplegar

### Opción 1: Desde GitHub (Recomendado)

1. **Subir a GitHub** (si no lo has hecho):
   ```bash
   git init
   git add .
   git commit -m "Configuración para Vercel"
   git branch -M main
   git remote add origin https://github.com/tu-usuario/casa-jose-reservas.git
   git push -u origin main
   ```

2. **Importar en Vercel**:
   - Ve a [vercel.com](https://vercel.com)
   - Click en **"Add New Project"**
   - Selecciona tu repositorio de GitHub
   - Click en **"Import"**

3. **Configurar Variables de Entorno**:
   - En la pantalla de configuración, expande **"Environment Variables"**
   - Agrega las 3 variables mencionadas arriba
   - Asegúrate de marcar todas las opciones: Production, Preview, Development

4. **Deploy**:
   - Click en **"Deploy"**
   - Espera 2-3 minutos
   - ¡Listo! 🎉

### Opción 2: Con Vercel CLI

1. **Instalar Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Configurar Variables de Entorno**:
   - Ve al dashboard de Vercel
   - Selecciona tu proyecto
   - Settings → Environment Variables
   - Agrega las 3 variables

5. **Re-deploy**:
   ```bash
   vercel --prod
   ```

## ✅ Verificar que Funciona

Una vez desplegado, verifica:

### 1. Health Check
```bash
curl https://tu-proyecto.vercel.app/api/health
```

Debería retornar:
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "message": "Casa José Reservas API is running"
}
```

### 2. Frontend
Abre en el navegador:
```
https://tu-proyecto.vercel.app
```

Deberías ver la interfaz de Casa José Reservas.

### 3. API de Reservas
```bash
curl https://tu-proyecto.vercel.app/api/reservas
```

Debería retornar un array de reservas (puede estar vacío si no hay datos).

## 🐛 Solución de Problemas

### Error: "FUNCTION_INVOCATION_FAILED"

**Causa**: Variables de entorno faltantes o incorrectas.

**Solución**:
1. Ve a Vercel Dashboard → Tu Proyecto → Settings → Environment Variables
2. Verifica que las 3 variables estén configuradas correctamente
3. Re-deploy el proyecto

### Error: "Faltan variables de entorno de Supabase"

**Causa**: Las variables de Supabase no están configuradas.

**Solución**:
1. Configura `NEXT_PUBLIC_SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`
2. Re-deploy

### Error 404 en las rutas de API

**Causa**: El routing no está funcionando correctamente.

**Solución**:
1. Verifica que la carpeta `pages/api/` exista
2. Re-deploy desde cero
3. Limpia el caché de Vercel

### Frontend no carga

**Causa**: Archivos estáticos no se están sirviendo.

**Solución**:
1. Verifica que `public/index.html` existe
2. Asegúrate de que el build de Next.js fue exitoso
3. Revisa los logs de deployment en Vercel

## 📊 Rutas de la API

Una vez desplegado, tu API estará disponible en:

```
https://tu-proyecto.vercel.app/api/health
https://tu-proyecto.vercel.app/api/reservas
https://tu-proyecto.vercel.app/api/reservas/:id
https://tu-proyecto.vercel.app/api/clientes
https://tu-proyecto.vercel.app/api/mesas
https://tu-proyecto.vercel.app/api/analytics/dashboard
...y todas las demás rutas definidas en el backend
```

## 🔒 Seguridad

### Variables de Entorno

- ✅ **NEXT_PUBLIC_*** variables son seguras en el cliente
- ⚠️ **SUPABASE_SERVICE_ROLE_KEY** NUNCA debe exponerse al cliente
- ⚠️ Solo usa Service Role Key en el servidor (API routes)

### Recomendaciones

1. **NO** subas el archivo `.env` a GitHub
2. **NO** expongas `SUPABASE_SERVICE_ROLE_KEY` en el frontend
3. Configura las variables de entorno directamente en Vercel
4. Usa `.env.example` como referencia

## 📱 Dominio Personalizado (Opcional)

Una vez verificado que todo funciona:

1. Ve a Vercel Dashboard → Tu Proyecto → Settings → Domains
2. Agrega tu dominio personalizado (ej: `reservas.casajose.com`)
3. Sigue las instrucciones para configurar DNS
4. Vercel configurará SSL automáticamente

## 🔄 Actualizaciones Futuras

Para actualizaciones:

```bash
# Hacer cambios en tu código
git add .
git commit -m "Descripción de cambios"
git push

# Vercel auto-desplegará los cambios
```

## 📈 Monitoreo

Vercel proporciona:
- Logs en tiempo real
- Analytics de uso
- Métricas de performance
- Alertas de errores

Accede desde: Vercel Dashboard → Tu Proyecto → Analytics/Logs

## 🆘 Ayuda Adicional

- [Documentación de Vercel](https://vercel.com/docs)
- [Guía de Next.js](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)

---

## 📋 Checklist Pre-Deployment

Antes de desplegar, verifica:

- [ ] Variables de entorno configuradas en Vercel
- [ ] Schema SQL ejecutado en Supabase
- [ ] Proyecto subido a GitHub
- [ ] `.env` NO está en el repositorio (debe estar en .gitignore)
- [ ] Build local funciona (`npm run build`)

## 📋 Checklist Post-Deployment

Después de desplegar, verifica:

- [ ] Health check responde (200 OK)
- [ ] Frontend carga correctamente
- [ ] API de reservas funciona
- [ ] Puedes crear una reserva de prueba
- [ ] No hay errores en los logs de Vercel

---

**¡Listo para producción! 🚀**

**Desarrollado con ❤️ para Casa José**
