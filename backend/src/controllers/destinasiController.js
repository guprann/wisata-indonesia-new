const Destinasi = require('../models/Destinasi');
const aiService = require('../services/aiService');

// Menentukan id numerik berikutnya (berurutan)
async function nextId() {
  const last = await Destinasi.findOne().sort({ id: -1 }).select('id').lean();
  return last && last.id ? last.id + 1 : 1;
}

// Field yang boleh di-set dari body
function pickBody(body) {
  const num = (v) => (v === undefined || v === null || v === '' ? null : Number(v));
  const fasilitas = Array.isArray(body.fasilitas)
    ? body.fasilitas.map((f) => String(f).trim()).filter(Boolean)
    : typeof body.fasilitas === 'string'
    ? body.fasilitas.split(',').map((f) => f.trim()).filter(Boolean)
    : [];
  return {
    nama: body.nama !== undefined ? String(body.nama).trim() : undefined,
    provinsi: body.provinsi !== undefined ? String(body.provinsi).trim() : undefined,
    kategori: body.kategori !== undefined ? String(body.kategori).trim() : undefined,
    rating: body.rating !== undefined ? num(body.rating) : undefined,
    pengunjungPerBulan: body.pengunjungPerBulan !== undefined ? num(body.pengunjungPerBulan) : undefined,
    hargaTiket: body.hargaTiket !== undefined ? num(body.hargaTiket) : undefined,
    latitude: body.latitude !== undefined ? num(body.latitude) : undefined,
    longitude: body.longitude !== undefined ? num(body.longitude) : undefined,
    gambar: body.gambar !== undefined ? String(body.gambar).trim() : undefined,
    fasilitas: body.fasilitas !== undefined ? fasilitas : undefined,
  };
}

// GET /api/destinasi
exports.list = async (req, res, next) => {
  try {
    const { search, provinsi, kategori, sort, order = 'asc', page, limit } = req.query;
    const query = {};
    if (search) {
      const rx = new RegExp(String(search).trim(), 'i');
      query.$or = [{ nama: rx }, { provinsi: rx }, { kategori: rx }];
    }
    if (provinsi) query.provinsi = provinsi;
    if (kategori) query.kategori = kategori;

    let cursor = Destinasi.find(query);

    if (sort) {
      const dir = order === 'desc' ? -1 : 1;
      cursor = cursor.sort({ [sort]: dir });
    } else {
      cursor = cursor.sort({ id: 1 });
    }

    const total = await Destinasi.countDocuments(query);

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    if (Number.isFinite(pageNum) && Number.isFinite(limitNum) && limitNum > 0) {
      cursor = cursor.skip((pageNum - 1) * limitNum).limit(limitNum);
    }

    const data = await cursor.lean({ virtuals: true });
    res.json({ total, count: data.length, data });
  } catch (err) {
    next(err);
  }
};

// GET /api/destinasi/:id
exports.getOne = async (req, res, next) => {
  try {
    const item = await Destinasi.findOne({ id: Number(req.params.id) });
    if (!item) {
      return res.status(404).json({ message: `Destinasi dengan id ${req.params.id} tidak ditemukan.` });
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
};

// POST /api/destinasi
exports.create = async (req, res, next) => {
  try {
    const payload = pickBody(req.body);
    const errors = [];
    if (!payload.nama) errors.push('Field "nama" wajib diisi.');
    if (!payload.provinsi) errors.push('Field "provinsi" wajib diisi.');
    if (!payload.kategori) errors.push('Field "kategori" wajib diisi.');
    if (payload.rating !== undefined && payload.rating !== null && (payload.rating < 0 || payload.rating > 5)) {
      errors.push('Field "rating" harus angka antara 0 dan 5.');
    }
    if (errors.length) return res.status(400).json({ message: 'Validasi gagal.', errors });

    const doc = await Destinasi.create({ ...payload, id: await nextId() });
    res.status(201).json({ message: 'Destinasi berhasil dibuat.', data: doc });
  } catch (err) {
    next(err);
  }
};

// PUT /api/destinasi/:id  (ganti seluruh resource)
exports.replace = async (req, res, next) => {
  try {
    const payload = pickBody(req.body);
    const errors = [];
    if (!payload.nama) errors.push('Field "nama" wajib diisi.');
    if (!payload.provinsi) errors.push('Field "provinsi" wajib diisi.');
    if (!payload.kategori) errors.push('Field "kategori" wajib diisi.');
    if (payload.rating !== undefined && payload.rating !== null && (payload.rating < 0 || payload.rating > 5)) {
      errors.push('Field "rating" harus angka antara 0 dan 5.');
    }
    if (errors.length) return res.status(400).json({ message: 'Validasi gagal.', errors });

    const full = {
      nama: payload.nama,
      provinsi: payload.provinsi,
      kategori: payload.kategori,
      rating: payload.rating ?? null,
      pengunjungPerBulan: payload.pengunjungPerBulan ?? null,
      hargaTiket: payload.hargaTiket ?? null,
      latitude: payload.latitude ?? null,
      longitude: payload.longitude ?? null,
      gambar: payload.gambar ?? '',
      fasilitas: payload.fasilitas ?? [],
    };

    const updated = await Destinasi.findOneAndUpdate({ id: Number(req.params.id) }, full, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return res.status(404).json({ message: `Destinasi dengan id ${req.params.id} tidak ditemukan.` });
    }
    res.json({ message: 'Destinasi berhasil diganti (PUT).', data: updated });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/destinasi/:id  (update sebagian)
exports.update = async (req, res, next) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'Body tidak boleh kosong untuk PATCH.' });
    }
    const payload = pickBody(req.body);
    // buang key undefined agar hanya field terkirim yang diperbarui
    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

    if (payload.rating !== undefined && payload.rating !== null && (payload.rating < 0 || payload.rating > 5)) {
      return res.status(400).json({ message: 'Field "rating" harus angka antara 0 dan 5.' });
    }

    const updated = await Destinasi.findOneAndUpdate({ id: Number(req.params.id) }, payload, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return res.status(404).json({ message: `Destinasi dengan id ${req.params.id} tidak ditemukan.` });
    }
    res.json({ message: 'Destinasi berhasil diperbarui (PATCH).', data: updated });
  } catch (err) {
    next(err);
  }
};

// POST /api/destinasi/:id/ask  (AI tanya-jawab tentang destinasi)
exports.ask = async (req, res, next) => {
  try {
    const question = (req.body && req.body.question ? String(req.body.question) : '').trim();
    if (!question) {
      return res.status(400).json({ message: 'Field "question" wajib diisi.' });
    }
    if (question.length > 500) {
      return res.status(400).json({ message: 'Pertanyaan terlalu panjang (maksimal 500 karakter).' });
    }

    const item = await Destinasi.findOne({ id: Number(req.params.id) }).lean();
    if (!item) {
      return res.status(404).json({ message: `Destinasi dengan id ${req.params.id} tidak ditemukan.` });
    }

    const history = Array.isArray(req.body.history) ? req.body.history : [];
    const { answer, source } = await aiService.ask(item, question, history);
    res.json({ answer, source });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/destinasi/:id
exports.remove = async (req, res, next) => {
  try {
    const removed = await Destinasi.findOneAndDelete({ id: Number(req.params.id) });
    if (!removed) {
      return res.status(404).json({ message: `Destinasi dengan id ${req.params.id} tidak ditemukan.` });
    }
    res.json({ message: 'Destinasi berhasil dihapus.', data: removed });
  } catch (err) {
    next(err);
  }
};

// GET /api/stats
exports.stats = async (req, res, next) => {
  try {
    const [agg] = await Destinasi.aggregate([
      {
        $group: {
          _id: null,
          totalDestinasi: { $sum: 1 },
          totalPengunjungPerBulan: { $sum: { $ifNull: ['$pengunjungPerBulan', 0] } },
          rataRating: { $avg: '$rating' },
          provinsiSet: { $addToSet: '$provinsi' },
          kategoriSet: { $addToSet: '$kategori' },
        },
      },
    ]);

    const kategoriAgg = await Destinasi.aggregate([
      { $group: { _id: '$kategori', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const kategori = {};
    kategoriAgg.forEach((k) => (kategori[k._id] = k.count));

    res.json({
      totalDestinasi: agg ? agg.totalDestinasi : 0,
      totalProvinsi: agg ? agg.provinsiSet.filter(Boolean).length : 0,
      totalKategori: agg ? agg.kategoriSet.filter(Boolean).length : 0,
      totalPengunjungPerBulan: agg ? agg.totalPengunjungPerBulan : 0,
      rataRating: agg && agg.rataRating ? +agg.rataRating.toFixed(2) : 0,
      kategori,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/meta
exports.meta = async (req, res, next) => {
  try {
    const provinsi = (await Destinasi.distinct('provinsi')).filter(Boolean).sort();
    const kategori = (await Destinasi.distinct('kategori')).filter(Boolean).sort();
    res.json({ provinsi, kategori });
  } catch (err) {
    next(err);
  }
};
