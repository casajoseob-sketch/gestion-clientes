// Health check endpoint
export default function handler(req, res) {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'Casa José Reservas API is running'
  });
}
