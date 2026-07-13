const mongoose = require('mongoose');

const destinasiSchema = new mongoose.Schema(
  {
    // id numerik berurutan agar mudah dipakai di frontend
    id: { type: Number, unique: true, index: true },
    nama: { type: String, required: [true, 'Nama destinasi wajib diisi'], trim: true },
    provinsi: { type: String, required: [true, 'Provinsi wajib diisi'], trim: true, index: true },
    kategori: { type: String, required: [true, 'Kategori wajib diisi'], trim: true, index: true },
    rating: { type: Number, min: 0, max: 5, default: null },
    pengunjungPerBulan: { type: Number, default: null },
    hargaTiket: { type: Number, default: null },
    fasilitas: { type: [String], default: [] },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    gambar: { type: String, default: '' },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform(doc, ret) {
        delete ret._id;
        return ret;
      },
    },
  }
);

// Index teks untuk pencarian
destinasiSchema.index({ nama: 'text', provinsi: 'text', kategori: 'text' });

module.exports = mongoose.model('Destinasi', destinasiSchema);
