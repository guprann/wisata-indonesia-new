'use strict';

/**
 * Layanan AI tanya-jawab seputar satu destinasi wisata.
 * Bersifat HYBRID:
 *  - Jika tersedia GEMINI_API_KEY atau OPENAI_API_KEY, jawaban dihasilkan LLM
 *    dengan konteks data destinasi (grounded, tidak mengarang di luar data).
 *  - Jika tidak ada API key, otomatis fallback ke mesin jawaban lokal berbasis
 *    kata kunci yang membaca langsung field-field destinasi.
 */

const fmtNum = (n) =>
  n === null || n === undefined || Number.isNaN(Number(n))
    ? null
    : new Intl.NumberFormat('id-ID').format(Number(n));

const fmtRupiah = (n) => {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return null;
  if (Number(n) === 0) return 'gratis (tidak dipungut biaya)';
  return 'Rp ' + fmtNum(n);
};

// ---- Data koordinat kota untuk estimasi jarak ------------------------------
// Ibu kota provinsi & kota besar Indonesia (lat, lon).
const CITY_COORDS = {
  jakarta: [-6.2088, 106.8456],
  bandung: [-6.9147, 107.6098],
  semarang: [-6.9667, 110.4167],
  yogyakarta: [-7.7956, 110.3695],
  jogja: [-7.7956, 110.3695],
  surabaya: [-7.2575, 112.7521],
  malang: [-7.9797, 112.6304],
  denpasar: [-8.6705, 115.2126],
  bali: [-8.4095, 115.1889],
  medan: [3.5952, 98.6722],
  padang: [-0.9471, 100.4172],
  pekanbaru: [0.5071, 101.4478],
  palembang: [-2.9761, 104.7754],
  'bandar lampung': [-5.3971, 105.2668],
  lampung: [-5.3971, 105.2668],
  jambi: [-1.6101, 103.6131],
  bengkulu: [-3.8004, 102.2655],
  'pangkal pinang': [-2.1316, 106.1169],
  'tanjung pinang': [0.9186, 104.4552],
  'banda aceh': [5.5483, 95.3238],
  aceh: [5.5483, 95.3238],
  serang: [-6.1201, 106.1502],
  'tangerang': [-6.1783, 106.6319],
  bekasi: [-6.2383, 106.9756],
  bogor: [-6.5971, 106.806],
  cirebon: [-6.7063, 108.5571],
  tegal: [-6.8694, 109.1402],
  solo: [-7.5755, 110.8243],
  surakarta: [-7.5755, 110.8243],
  magelang: [-7.4706, 110.2178],
  kediri: [-7.8481, 112.0178],
  jember: [-8.1724, 113.7002],
  banyuwangi: [-8.2192, 114.3691],
  mataram: [-8.5833, 116.1167],
  lombok: [-8.65, 116.3249],
  kupang: [-10.1772, 123.607],
  labuan: [-8.4959, 119.8877],
  'labuan bajo': [-8.4959, 119.8877],
  pontianak: [-0.0263, 109.3425],
  palangkaraya: [-2.2081, 113.9163],
  banjarmasin: [-3.3186, 114.5944],
  samarinda: [-0.5017, 117.1536],
  balikpapan: [-1.2379, 116.8529],
  tarakan: [3.3273, 117.5773],
  makassar: [-5.1477, 119.4327],
  'bulukumba': [-5.5497, 120.1961],
  bira: [-5.6069, 120.4722],
  parepare: [-4.0135, 119.6255],
  palu: [-0.8917, 119.8707],
  kendari: [-3.9985, 122.5127],
  gorontalo: [0.5435, 123.0568],
  manado: [1.4748, 124.8421],
  mamuju: [-2.6748, 118.8885],
  ambon: [-3.6954, 128.1814],
  ternate: [0.7877, 127.3813],
  sofifi: [0.7333, 127.55],
  jayapura: [-2.5337, 140.7181],
  manokwari: [-0.8615, 134.062],
  sorong: [-0.8762, 131.2558],
  timika: [-4.5479, 136.8884],
  merauke: [-8.4932, 140.4018],
  nabire: [-3.3667, 135.4833],
};

const toRad = (deg) => (deg * Math.PI) / 180;

// Perbaiki koordinat yang rusak (titik desimal hilang), disesuaikan rentang Indonesia.
// Lintang Indonesia kira-kira -11..6, bujur 95..141.
function normLat(v) {
  let n = Number(v);
  if (!Number.isFinite(n)) return null;
  let guard = 0;
  while (Math.abs(n) > 11 && guard++ < 12) n /= 10;
  return n;
}
function normLon(v) {
  let n = Number(v);
  if (!Number.isFinite(n)) return null;
  let guard = 0;
  while (Math.abs(n) > 145 && guard++ < 12) n /= 10;
  return n;
}

// Jarak garis lurus (haversine) dalam km
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371; // radius bumi km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Cari kota yang disebut di pertanyaan lalu hitung jarak ke destinasi.
function findCityDistances(d, question) {
  if (d.latitude == null || d.longitude == null) return [];
  const dLat = normLat(d.latitude);
  const dLon = normLon(d.longitude);
  if (dLat == null || dLon == null) return [];
  const q = ` ${String(question).toLowerCase()} `;
  const results = [];
  const seen = new Set();
  for (const [city, [lat, lon]] of Object.entries(CITY_COORDS)) {
    if (q.includes(` ${city} `) || q.includes(`${city},`) || q.includes(`ke ${city}`) || q.includes(`dari ${city}`)) {
      const key = `${lat},${lon}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const km = haversine(dLat, dLon, lat, lon);
      results.push({ city, km: Math.round(km) });
    }
  }
  return results;
}

// Petunjuk jarak untuk disisipkan ke prompt / dipakai fallback.
function geoHint(d, question) {
  const list = findCityDistances(d, question);
  if (!list.length) return '';
  return list
    .map(
      (r) =>
        `Jarak garis lurus dari ${r.city.replace(/\b\w/g, (c) => c.toUpperCase())} ke ${d.nama} sekitar ${fmtNum(
          r.km
        )} km (jarak tempuh via jalan darat biasanya lebih jauh).`
    )
    .join(' ');
}

// ---- Ringkasan / konteks destinasi dalam bentuk teks -----------------------
function buildContext(d) {
  const lines = [];
  lines.push(`Nama: ${d.nama || '-'}`);
  lines.push(`Provinsi: ${d.provinsi || '-'}`);
  lines.push(`Kategori: ${d.kategori || '-'}`);
  lines.push(`Rating: ${d.rating != null ? `${d.rating} dari 5` : 'tidak tersedia'}`);
  lines.push(`Harga tiket masuk: ${fmtRupiah(d.hargaTiket) || 'tidak tersedia'}`);
  lines.push(
    `Rata-rata pengunjung per bulan: ${
      d.pengunjungPerBulan != null ? fmtNum(d.pengunjungPerBulan) + ' orang' : 'tidak tersedia'
    }`
  );
  lines.push(
    `Fasilitas: ${
      Array.isArray(d.fasilitas) && d.fasilitas.length ? d.fasilitas.join(', ') : 'tidak tersedia'
    }`
  );
  lines.push(
    `Koordinat: ${
      d.latitude != null && d.longitude != null
        ? `${normLat(d.latitude)}, ${normLon(d.longitude)}`
        : 'tidak tersedia'
    }`
  );
  return lines.join('\n');
}

// ---- Mesin jawaban lokal (offline) -----------------------------------------
function normalize(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function has(q, ...keys) {
  return keys.some((k) => q.includes(k));
}

function localAnswer(d, question) {
  const q = normalize(question);
  const nama = d.nama || 'destinasi ini';

  if (!q) {
    return `Silakan ajukan pertanyaan seputar ${nama}, misalnya tentang harga tiket, rating, lokasi, atau fasilitasnya.`;
  }

  // Sapaan
  if (has(q, 'halo', 'hai', 'hallo', 'assalam', 'pagi', 'siang', 'sore', 'malam') && q.length < 25) {
    return `Halo! Saya asisten wisata untuk ${nama}. Ada yang ingin kamu ketahui tentang tempat ini?`;
  }

  // Harga tiket
  if (has(q, 'harga', 'tiket', 'biaya', 'bayar', 'masuk', 'htm', 'mahal', 'murah')) {
    const r = fmtRupiah(d.hargaTiket);
    if (r == null) return `Maaf, data harga tiket masuk untuk ${nama} belum tersedia.`;
    return `Harga tiket masuk ${nama} adalah ${r}.`;
  }

  // Rating / ulasan
  if (has(q, 'rating', 'nilai', 'bagus', 'worth', 'rekomendasi', 'ulasan', 'review', 'kualitas', 'recommended')) {
    if (d.rating == null) return `Maaf, data rating untuk ${nama} belum tersedia.`;
    const r = Number(d.rating);
    let kesan = 'cukup baik';
    if (r >= 4.5) kesan = 'sangat baik dan sangat direkomendasikan';
    else if (r >= 4) kesan = 'baik dan layak dikunjungi';
    else if (r >= 3) kesan = 'lumayan';
    else kesan = 'kurang, sebaiknya cek ulasan lain dulu';
    return `${nama} punya rating ${r} dari 5 — tergolong ${kesan}.`;
  }

  // Pengunjung / ramai
  if (has(q, 'pengunjung', 'ramai', 'sepi', 'orang', 'populer', 'wisatawan', 'turis', 'crowd', 'jumlah')) {
    const n = fmtNum(d.pengunjungPerBulan);
    if (n == null) return `Maaf, data jumlah pengunjung ${nama} belum tersedia.`;
    const val = Number(d.pengunjungPerBulan);
    const kesan = val >= 100000 ? 'termasuk sangat ramai' : val >= 30000 ? 'cukup ramai' : 'relatif tidak terlalu ramai';
    return `${nama} dikunjungi rata-rata ${n} orang per bulan — ${kesan}.`;
  }

  // Fasilitas
  if (has(q, 'fasilitas', 'toilet', 'parkir', 'warung', 'makan', 'penginapan', 'wc', 'mushola', 'ada apa', 'tersedia', 'sarana')) {
    if (Array.isArray(d.fasilitas) && d.fasilitas.length) {
      return `Fasilitas yang tersedia di ${nama}: ${d.fasilitas.join(', ')}.`;
    }
    return `Maaf, data fasilitas untuk ${nama} belum tersedia.`;
  }

  // Jarak dari kota tertentu
  if (has(q, 'jarak', 'berapa km', 'berapa kilometer', 'seberapa jauh', 'jauh dari', 'jauhnya', 'jauh nya')) {
    const dists = findCityDistances(d, q);
    if (dists.length) {
      return dists
        .map(
          (r) =>
            `Jarak garis lurus dari ${r.city.replace(/\b\w/g, (c) => c.toUpperCase())} ke ${nama} sekitar ${fmtNum(
              r.km
            )} km. Jarak tempuh lewat jalan darat umumnya lebih jauh tergantung rute.`
        )
        .join(' ');
    }
    if (d.latitude == null || d.longitude == null) {
      return `Maaf, koordinat ${nama} belum tersedia sehingga jarak tidak bisa dihitung.`;
    }
    return `Sebutkan nama kota asalnya ya (misalnya "jarak dari Makassar ke ${nama}"), nanti saya hitung perkiraan jaraknya.`;
  }

  // Lokasi / provinsi
  if (has(q, 'lokasi', 'dimana', 'di mana', 'provinsi', 'alamat', 'daerah', 'letak', 'berada', 'kota')) {
    if (d.provinsi) return `${nama} berlokasi di Provinsi ${d.provinsi}.`;
    return `Maaf, data lokasi untuk ${nama} belum tersedia.`;
  }

  // Koordinat / peta / arah
  if (has(q, 'koordinat', 'latitude', 'longitude', 'peta', 'maps', 'gps', 'arah', 'rute', 'menuju', 'jalan')) {
    if (d.latitude != null && d.longitude != null) {
      return `Koordinat ${nama} adalah ${d.latitude}, ${d.longitude}. Kamu bisa memasukkan koordinat ini ke aplikasi peta untuk melihat rute.`;
    }
    return `Maaf, data koordinat untuk ${nama} belum tersedia.`;
  }

  // Kategori / jenis wisata
  if (has(q, 'kategori', 'jenis', 'tipe', 'wisata apa', 'termasuk')) {
    if (d.kategori) return `${nama} termasuk kategori wisata "${d.kategori}".`;
    return `Maaf, data kategori untuk ${nama} belum tersedia.`;
  }

  // Waktu terbaik / kegiatan / hal yang tidak ada di data
  if (has(q, 'jam buka', 'buka jam', 'jam operasional', 'kapan buka', 'tutup')) {
    return `Maaf, data jam operasional ${nama} belum tersedia di sistem kami. Untuk info pasti, sebaiknya hubungi pengelola setempat.`;
  }
  if (has(q, 'aktivitas', 'kegiatan', 'ngapain', 'lakukan', 'main', 'foto', 'spot')) {
    const catInfo = d.kategori ? ` Karena termasuk wisata ${d.kategori.toLowerCase()},` : '';
    return `${nama} cocok untuk menikmati suasana dan berfoto.${catInfo} kamu bisa menyesuaikan kegiatan dengan fasilitas yang tersedia${
      Array.isArray(d.fasilitas) && d.fasilitas.length ? `: ${d.fasilitas.join(', ')}.` : '.'
    }`;
  }

  // Ringkasan umum
  if (has(q, 'ceritakan', 'jelaskan', 'apa itu', 'tentang', 'info', 'gambaran', 'deskripsi', 'ringkas', 'overview')) {
    return summarize(d);
  }

  // Default: berikan ringkasan agar tetap membantu
  return `${summarize(d)}\n\nKamu bisa bertanya lebih spesifik, misalnya: "berapa harga tiketnya?", "ratingnya berapa?", "ada fasilitas apa saja?", atau "di mana lokasinya?".`;
}

function summarize(d) {
  const nama = d.nama || 'Destinasi ini';
  const parts = [];
  if (d.kategori && d.provinsi) parts.push(`${nama} adalah destinasi wisata ${d.kategori.toLowerCase()} yang berada di Provinsi ${d.provinsi}`);
  else if (d.provinsi) parts.push(`${nama} berlokasi di Provinsi ${d.provinsi}`);
  else parts.push(`${nama} adalah salah satu destinasi wisata`);

  if (d.rating != null) parts.push(`memiliki rating ${d.rating}/5`);
  const r = fmtRupiah(d.hargaTiket);
  if (r != null) parts.push(`dengan harga tiket ${r}`);
  const p = fmtNum(d.pengunjungPerBulan);
  if (p != null) parts.push(`serta rata-rata ${p} pengunjung per bulan`);

  let text = parts.join(', ') + '.';
  if (Array.isArray(d.fasilitas) && d.fasilitas.length) {
    text += ` Fasilitas yang tersedia antara lain ${d.fasilitas.join(', ')}.`;
  }
  return text;
}

// ---- Integrasi LLM ---------------------------------------------------------
function buildPrompt(d, question, history) {
  const system =
    'Kamu adalah asisten wisata Indonesia yang ramah, ringkas, dan akurat. ' +
    'Untuk data atribut destinasi (nama, provinsi, kategori, rating, harga tiket, jumlah pengunjung, ' +
    'fasilitas, koordinat), gunakan HANYA "DATA DESTINASI" di bawah sebagai sumber kebenaran dan jangan menggantinya. ' +
    'Untuk pertanyaan lain di luar atribut itu (misalnya jarak dari suatu kota, rute/cara ke sana, sejarah, ' +
    'waktu terbaik berkunjung, kuliner, tips, atraksi terdekat), kamu BOLEH menggunakan pengetahuan umummu ' +
    'untuk memberi jawaban yang membantu. Jika memberi angka perkiraan, sebutkan bahwa itu estimasi. ' +
    'Jika benar-benar tidak tahu, katakan jujur. Jawab langsung dalam Bahasa Indonesia.';

  const hint = geoHint(d, question);
  const parts = [system, '', 'DATA DESTINASI:', buildContext(d)];
  if (hint) parts.push('', 'FAKTA TAMBAHAN (hasil perhitungan akurat, gunakan bila relevan):', hint);
  parts.push('');
  (history || []).slice(-6).forEach((h) => {
    const who = h.role === 'assistant' ? 'Asisten' : 'Pengguna';
    if (h.content) parts.push(`${who}: ${String(h.content)}`);
  });
  parts.push(`Pengguna: ${String(question)}`);
  parts.push('Asisten:');
  return parts.join('\n');
}

async function askOllama(d, question, history) {
  const url = process.env.OLLAMA_URL || 'https://ollama.if.unismuh.ac.id/api/generate';
  const model = process.env.OLLAMA_MODEL || 'gemma4';

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(process.env.OLLAMA_TIMEOUT_MS) || 60000);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: buildPrompt(d, question, history),
        stream: false,
        options: { temperature: 0.4 },
      }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Ollama error ${res.status}`);
    const data = await res.json();
    const text = (data && data.response ? String(data.response) : '').trim();
    if (!text) throw new Error('Ollama kosong');
    return text;
  } finally {
    clearTimeout(timeout);
  }
}

async function askGemini(d, question, history) {
  const key = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

  const system =
    'Kamu adalah asisten wisata berbahasa Indonesia yang ramah dan ringkas. ' +
    'Jawab HANYA berdasarkan data destinasi berikut. Jika informasi tidak ada di data, ' +
    'katakan dengan jujur bahwa datanya belum tersedia. Jangan mengarang fakta.\n\n' +
    'DATA DESTINASI:\n' +
    buildContext(d);

  const contents = [];
  (history || []).slice(-6).forEach((h) => {
    contents.push({ role: h.role === 'assistant' ? 'model' : 'user', parts: [{ text: String(h.content || '') }] });
  });
  contents.push({ role: 'user', parts: [{ text: String(question) }] });

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents,
      generationConfig: { temperature: 0.4, maxOutputTokens: 512 },
    }),
  });
  if (!res.ok) throw new Error(`Gemini error ${res.status}`);
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
  if (!text.trim()) throw new Error('Gemini kosong');
  return text.trim();
}

async function askOpenAI(d, question, history) {
  const key = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const url = 'https://api.openai.com/v1/chat/completions';

  const system =
    'Kamu adalah asisten wisata berbahasa Indonesia yang ramah dan ringkas. ' +
    'Jawab HANYA berdasarkan data destinasi berikut. Jika informasi tidak ada di data, ' +
    'katakan dengan jujur bahwa datanya belum tersedia. Jangan mengarang fakta.\n\n' +
    'DATA DESTINASI:\n' +
    buildContext(d);

  const messages = [{ role: 'system', content: system }];
  (history || []).slice(-6).forEach((h) => {
    messages.push({ role: h.role === 'assistant' ? 'assistant' : 'user', content: String(h.content || '') });
  });
  messages.push({ role: 'user', content: String(question) });

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model, messages, temperature: 0.4, max_tokens: 512 }),
  });
  if (!res.ok) throw new Error(`OpenAI error ${res.status}`);
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content || '';
  if (!text.trim()) throw new Error('OpenAI kosong');
  return text.trim();
}

/**
 * Menjawab pertanyaan tentang satu destinasi.
 * @returns {Promise<{answer: string, source: 'ollama'|'gemini'|'openai'|'local'}>}
 */
async function ask(d, question, history) {
  // Ollama sebagai penyedia utama (aktif kecuali OLLAMA_DISABLED=1)
  if (process.env.OLLAMA_DISABLED !== '1') {
    try {
      const answer = await askOllama(d, question, history);
      return { answer, source: 'ollama' };
    } catch (err) {
      console.warn('⚠️  Ollama gagal, coba penyedia lain / fallback lokal:', err.message);
    }
  }
  if (process.env.GEMINI_API_KEY) {
    try {
      const answer = await askGemini(d, question, history);
      return { answer, source: 'gemini' };
    } catch (err) {
      console.warn('⚠️  Gemini gagal, fallback ke lokal:', err.message);
    }
  }
  if (process.env.OPENAI_API_KEY) {
    try {
      const answer = await askOpenAI(d, question, history);
      return { answer, source: 'openai' };
    } catch (err) {
      console.warn('⚠️  OpenAI gagal, fallback ke lokal:', err.message);
    }
  }
  return { answer: localAnswer(d, question), source: 'local' };
}

module.exports = { ask, buildContext, localAnswer };
