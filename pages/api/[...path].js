// API Route handler que envuelve el servidor Express
const app = require('../../server/index');

export default function handler(req, res) {
  // Reconstruir la ruta completa
  const { path } = req.query;
  const fullPath = `/api/${Array.isArray(path) ? path.join('/') : path}`;

  // Actualizar la URL del request
  req.url = fullPath;

  // Pasar el request al servidor Express
  return app(req, res);
}

// Configuración para manejar body parsing
export const config = {
  api: {
    bodyParser: true,
    externalResolver: true,
  },
};
