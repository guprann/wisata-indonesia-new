// Spesifikasi OpenAPI 3.0 untuk REST API Wisata Indonesia.
// Digunakan oleh Swagger UI di endpoint /api-docs.

const PORT = process.env.PORT || 4000;

const destinasiSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer', example: 1 },
    nama: { type: 'string', example: 'Candi Prambanan' },
    provinsi: { type: 'string', example: 'DI Yogyakarta' },
    kategori: { type: 'string', example: 'Sejarah & Budaya' },
    rating: { type: 'number', format: 'float', example: 4.5 },
    pengunjungPerBulan: { type: 'integer', example: 252458 },
    hargaTiket: { type: 'integer', example: 50000 },
    fasilitas: {
      type: 'array',
      items: { type: 'string' },
      example: ['Toilet', 'Warung Makan', 'Area Parkir'],
    },
    latitude: { type: 'number', format: 'float', example: -7.75207 },
    longitude: { type: 'number', format: 'float', example: 110.49213 },
    gambar: { type: 'string', example: 'https://contoh.com/prambanan.jpg' },
  },
};

const destinasiInput = {
  type: 'object',
  required: ['nama', 'provinsi', 'kategori'],
  properties: {
    nama: { type: 'string', example: 'Pantai Kuta' },
    provinsi: { type: 'string', example: 'Bali' },
    kategori: { type: 'string', example: 'Pantai & Bahari' },
    rating: { type: 'number', format: 'float', minimum: 0, maximum: 5, example: 4.6 },
    pengunjungPerBulan: { type: 'integer', example: 120000 },
    hargaTiket: { type: 'integer', example: 15000 },
    fasilitas: {
      type: 'array',
      items: { type: 'string' },
      example: ['Toilet', 'Area Parkir', 'Warung Makan'],
    },
    latitude: { type: 'number', format: 'float', example: -8.7177 },
    longitude: { type: 'number', format: 'float', example: 115.1685 },
    gambar: { type: 'string', example: 'https://contoh.com/kuta.jpg' },
  },
};

const idParam = {
  name: 'id',
  in: 'path',
  required: true,
  description: 'ID numerik wisata',
  schema: { type: 'integer' },
};

const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Wisata Indonesia REST API',
    version: '1.0.0',
    description:
      'Dokumentasi REST API untuk data wisata Indonesia. Dibangun dengan Express.js + MongoDB. ' +
      'Mendukung operasi lengkap: GET, POST, PUT, PATCH, DELETE.',
  },
  servers: [{ url: `http://localhost:${PORT}`, description: 'Server lokal' }],
  tags: [
    { name: 'Wisata', description: 'CRUD data wisata' },
    { name: 'Info', description: 'Statistik & metadata' },
  ],
  components: {
    schemas: {
      Destinasi: destinasiSchema,
      DestinasiInput: destinasiInput,
      Pesan: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Operasi berhasil.' },
          data: { $ref: '#/components/schemas/Destinasi' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Validasi gagal.' },
          errors: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  },
  paths: {
    '/api/destinasi': {
      get: {
        tags: ['Wisata'],
        summary: 'Ambil daftar wisata',
        description: 'Mendukung pencarian, filter, pengurutan, dan pagination.',
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Cari di nama/provinsi/kategori' },
          { name: 'provinsi', in: 'query', schema: { type: 'string' }, description: 'Filter berdasarkan provinsi' },
          { name: 'kategori', in: 'query', schema: { type: 'string' }, description: 'Filter berdasarkan kategori' },
          { name: 'sort', in: 'query', schema: { type: 'string', example: 'rating' }, description: 'Field pengurutan' },
          { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] }, description: 'Arah pengurutan' },
          { name: 'page', in: 'query', schema: { type: 'integer', example: 1 }, description: 'Halaman' },
          { name: 'limit', in: 'query', schema: { type: 'integer', example: 12 }, description: 'Jumlah per halaman' },
        ],
        responses: {
          200: {
            description: 'Daftar wisata',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    total: { type: 'integer', example: 1000 },
                    count: { type: 'integer', example: 12 },
                    data: { type: 'array', items: { $ref: '#/components/schemas/Destinasi' } },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Wisata'],
        summary: 'Tambah wisata baru',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/DestinasiInput' } } },
        },
        responses: {
          201: { description: 'Berhasil dibuat', content: { 'application/json': { schema: { $ref: '#/components/schemas/Pesan' } } } },
          400: { description: 'Validasi gagal', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/destinasi/{id}': {
      get: {
        tags: ['Wisata'],
        summary: 'Ambil satu wisata berdasarkan ID',
        parameters: [idParam],
        responses: {
          200: { description: 'Data wisata', content: { 'application/json': { schema: { $ref: '#/components/schemas/Destinasi' } } } },
          404: { description: 'Tidak ditemukan', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      put: {
        tags: ['Wisata'],
        summary: 'Ganti seluruh data wisata (PUT)',
        parameters: [idParam],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/DestinasiInput' } } },
        },
        responses: {
          200: { description: 'Berhasil diganti', content: { 'application/json': { schema: { $ref: '#/components/schemas/Pesan' } } } },
          400: { description: 'Validasi gagal', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Tidak ditemukan', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      patch: {
        tags: ['Wisata'],
        summary: 'Perbarui sebagian data wisata (PATCH)',
        parameters: [idParam],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: destinasiInput.properties,
                example: { rating: 4.8, hargaTiket: 30000 },
              },
            },
          },
        },
        responses: {
          200: { description: 'Berhasil diperbarui', content: { 'application/json': { schema: { $ref: '#/components/schemas/Pesan' } } } },
          400: { description: 'Permintaan tidak valid', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Tidak ditemukan', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      delete: {
        tags: ['Wisata'],
        summary: 'Hapus wisata',
        parameters: [idParam],
        responses: {
          200: { description: 'Berhasil dihapus', content: { 'application/json': { schema: { $ref: '#/components/schemas/Pesan' } } } },
          404: { description: 'Tidak ditemukan', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/stats': {
      get: {
        tags: ['Info'],
        summary: 'Statistik ringkas wisata',
        responses: {
          200: {
            description: 'Statistik',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    totalDestinasi: { type: 'integer', example: 1000 },
                    totalProvinsi: { type: 'integer', example: 38 },
                    totalKategori: { type: 'integer', example: 32 },
                    totalPengunjungPerBulan: { type: 'integer', example: 12345678 },
                    rataRating: { type: 'number', example: 4.5 },
                    kategori: { type: 'object', additionalProperties: { type: 'integer' } },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/meta': {
      get: {
        tags: ['Info'],
        summary: 'Daftar provinsi & kategori (untuk filter)',
        responses: {
          200: {
            description: 'Metadata',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    provinsi: { type: 'array', items: { type: 'string' } },
                    kategori: { type: 'array', items: { type: 'string' } },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

module.exports = swaggerSpec;
