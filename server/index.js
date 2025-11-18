const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const reservasRoutes = require('./routes/reservas');
const clientesRoutes = require('./routes/clientes');
const mesasRoutes = require('./routes/mesas');
const analyticsRoutes = require('./routes/analytics');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Servir archivos estáticos desde la carpeta public
app.use(express.static(path.join(__dirname, '../public')));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Rutas de la API
app.use('/api/reservas', reservasRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/mesas', mesasRoutes);
app.use('/api/analytics', analyticsRoutes);

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: err.message,
  });
});

// Ruta 404 solo para API (no archivos estáticos)
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'Ruta de API no encontrada' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 API disponible en http://localhost:${PORT}/api`);
  console.log(`🌐 Frontend disponible en http://localhost:${PORT}\n`);
});

module.exports = app;
