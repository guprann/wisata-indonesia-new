require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const Destinasi = require('../src/models/Destinasi');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wisata_indonesia';

// Koleksi gambar Unsplash yang stabil, dikelompokkan per tema.
// Dipilih berdasarkan kata kunci pada nama destinasi agar gambar tetap relevan.
const IMG = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

const THEMES = [
  {
    keys: ['pantai', 'beach', 'teluk', 'tanjung'],
    imgs: [
      IMG('photo-1507525428034-b723cf961d3e'),
      IMG('photo-1505228395891-9a51e7e86bf6'),
      IMG('photo-1519046904884-53103b34b206'),
    ],
  },
  {
    keys: ['pulau', 'kepulauan', 'gili', 'karimun'],
    imgs: [
      IMG('photo-1544550581-5f7ceaf7f992'),
      IMG('photo-1505228395891-9a51e7e86bf6'),
    ],
  },
  {
    keys: ['gunung', 'puncak', 'kawah', 'bukit', 'dieng', 'bromo', 'merapi'],
    imgs: [
      IMG('photo-1506905925346-21bda4d32df4'),
      IMG('photo-1464822759023-fed622ff2c3b'),
      IMG('photo-1454496522488-7a8e488e8606'),
    ],
  },
  {
    keys: ['air terjun', 'curug', 'coban', 'grojogan', 'air panas', 'pemandian'],
    imgs: [
      IMG('photo-1432405972618-c60b0225b8f9'),
      IMG('photo-1433086966358-54859d0ed716'),
    ],
  },
  {
    keys: ['danau', 'telaga', 'situ ', 'waduk', 'bendungan', 'rawa'],
    imgs: [
      IMG('photo-1439066615861-d1af74d74000'),
      IMG('photo-1500534314209-a25ddb2bd429'),
    ],
  },
  {
    keys: ['candi', 'pura', 'borobudur', 'prambanan'],
    imgs: [
      IMG('photo-1596402184320-417e7178b2cd'),
      IMG('photo-1518548419970-58e3b4079ab2'),
    ],
  },
  {
    keys: ['museum', 'monumen', 'benteng', 'keraton', 'istana', 'masjid', 'gereja', 'makam', 'situs', 'tugu'],
    imgs: [
      IMG('photo-1596402184320-417e7178b2cd'),
      IMG('photo-1518548419970-58e3b4079ab2'),
    ],
  },
  {
    keys: ['hutan', 'taman nasional', 'kebun raya', 'mangrove', 'goa', 'gua', 'bumi perkemahan'],
    imgs: [
      IMG('photo-1441974231531-c6227db76b6e'),
      IMG('photo-1448375240586-882707db888b'),
    ],
  },
  {
    keys: ['sawah', 'terasering', 'tegalalang', 'agro', 'kebun teh', 'perkebunan', 'desa wisata', 'kampung'],
    imgs: [
      IMG('photo-1537996194471-e657df975ab4'),
      IMG('photo-1512100356356-de1b84283e18'),
    ],
  },
];

// Cadangan (alam umum) bila tidak ada kata kunci yang cocok
const DEFAULT_IMGS = [
  IMG('photo-1506905925346-21bda4d32df4'),
  IMG('photo-1441974231531-c6227db76b6e'),
  IMG('photo-1537996194471-e657df975ab4'),
];

function pickImage(nama, kategori, id) {
  const text = `${nama} ${kategori || ''}`.toLowerCase();
  for (const theme of THEMES) {
    if (theme.keys.some((k) => text.includes(k))) {
      return theme.imgs[id % theme.imgs.length];
    }
  }
  return DEFAULT_IMGS[id % DEFAULT_IMGS.length];
}

// Cek apakah URL benar-benar gambar yang bisa diakses
async function isImageAccessible(url) {
  if (!url || !/^https?:\/\//i.test(url)) return false;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WisataBot/1.0)' },
    });
    const type = res.headers.get('content-type') || '';
    controller.abort(); // hentikan unduhan body, cukup header
    return res.ok && type.toLowerCase().startsWith('image');
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

async function run() {
  await connectDB(MONGODB_URI);
  const docs = await Destinasi.find({}, 'id nama kategori gambar').lean();
  console.log(`🔍 Memeriksa ${docs.length} URL gambar...`);

  const broken = [];
  const CONCURRENCY = 25;
  let checked = 0;

  for (let i = 0; i < docs.length; i += CONCURRENCY) {
    const batch = docs.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map((d) => isImageAccessible(d.gambar)));
    results.forEach((ok, j) => {
      if (!ok) broken.push(batch[j]);
    });
    checked += batch.length;
    process.stdout.write(`\r   Diperiksa: ${checked}/${docs.length} (rusak: ${broken.length})`);
  }
  console.log();

  if (broken.length === 0) {
    console.log('✅ Semua gambar dapat diakses. Tidak ada yang perlu diganti.');
  } else {
    console.log(`🛠️  Mengganti ${broken.length} gambar rusak dengan gambar sesuai nama...`);
    const ops = broken.map((d) => ({
      updateOne: {
        filter: { _id: d._id },
        update: { $set: { gambar: pickImage(d.nama, d.kategori, d.id) } },
      },
    }));
    const res = await Destinasi.bulkWrite(ops);
    console.log(`✅ Selesai! ${res.modifiedCount} gambar diperbarui.`);
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('❌ Gagal:', err);
  process.exit(1);
});
