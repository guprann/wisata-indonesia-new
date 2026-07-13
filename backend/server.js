require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const connectDB = require('./src/config/db');
const apiRoutes = require('./src/routes/destinasi');
const swaggerSpec = require('./src/config/swagger');

const app = express();
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wisata_indonesia';

app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json({ limit: '12mb' }));
app.use(express.urlencoded({ extended: true, limit: '12mb' }));

// Dokumentasi Swagger / OpenAPI
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Wisata Indonesia API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
  })
);
// Spesifikasi mentah (JSON)
app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));

app.get('/', (req, res) => {
  res.json({
    name: 'Wisata Indonesia REST API',
    status: 'ok',
    docs: `http://localhost:${PORT}/api-docs`,
    endpoints: [
      'GET    /api/destinasi',
      'GET    /api/destinasi/:id',
      'POST   /api/destinasi',
      'PUT    /api/destinasi/:id',
      'PATCH  /api/destinasi/:id',
      'DELETE /api/destinasi/:id',
      'GET    /api/stats',
      'GET    /api/meta',
    ],
  });
});

app.use('/api', apiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint tidak ditemukan.' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: 'Validasi gagal.', errors: Object.values(err.errors).map((e) => e.message) });
  }
  res.status(500).json({ message: 'Terjadi kesalahan server.', error: err.message });
});

connectDB(MONGODB_URI).then(() => {
  app.listen(PORT, () => {
    console.log(`\n🌴 Backend Wisata Indonesia berjalan di http://localhost:${PORT}`);
    console.log(`📡 REST API: http://localhost:${PORT}/api/destinasi`);
    console.log(`📖 Swagger Docs: http://localhost:${PORT}/api-docs\n`);
  });
});
