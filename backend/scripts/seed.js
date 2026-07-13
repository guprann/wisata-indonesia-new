require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const Destinasi = require('../src/models/Destinasi');

const CSV_PATH = path.join(__dirname, '..', '..', 'DATASETWISATA_FINAL.csv');
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wisata_indonesia';

/** Parser CSV yang mendukung field berkutip & koma di dalam kutip */
function parseCsv(text) {
  const rows = [];
  let field = '';
  let record = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];
    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      record.push(field);
      field = '';
    } else if (char === '\r') {
      // abaikan
    } else if (char === '\n') {
      record.push(field);
      rows.push(record);
      record = [];
      field = '';
    } else {
      field += char;
    }
  }
  if (field.length > 0 || record.length > 0) {
    record.push(field);
    rows.push(record);
  }
  return rows;
}

function toNumber(value) {
  if (value === undefined || value === null) return null;
  const cleaned = String(value).replace(/[^0-9.,-]/g, '').replace(',', '.');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}

function parseRating(value) {
  if (value === undefined || value === null) return null;
  const match = String(value).replace(',', '.').match(/[0-9]+(\.[0-9]+)?/);
  if (!match) return null;
  const n = parseFloat(match[0]);
  if (!Number.isFinite(n)) return null;
  return n > 5 ? Math.min(5, n / 2) : n;
}

async function run() {
  await connectDB(MONGODB_URI);

  const raw = fs.readFileSync(CSV_PATH, 'utf8');
  const rows = parseCsv(raw);
  rows.shift(); // buang header

  const docs = rows
    .filter((r) => r.length > 1 && r[1] && r[1].trim() !== '')
    .map((r, idx) => ({
      id: toNumber(r[0]) || idx + 1,
      nama: (r[1] || '').trim(),
      provinsi: (r[2] || '').trim(),
      kategori: (r[3] || '').trim(),
      rating: parseRating(r[4]),
      pengunjungPerBulan: toNumber(r[5]),
      hargaTiket: toNumber(r[6]),
      fasilitas: (r[7] || '')
        .split(/[,;]/)
        .map((f) => f.trim())
        .filter(Boolean),
      latitude: toNumber(r[8]),
      longitude: toNumber(r[9]),
      gambar: (r[10] || '').trim(),
    }));

  console.log(`📥 Menghapus data lama & mengimpor ${docs.length} destinasi...`);
  await Destinasi.deleteMany({});
  await Destinasi.insertMany(docs, { ordered: false });

  const count = await Destinasi.countDocuments();
  console.log(`✅ Seed selesai! Total destinasi di MongoDB: ${count}`);

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Seed gagal:', err);
  process.exit(1);
});
