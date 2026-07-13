const mongoose = require('mongoose');

async function connectDB(uri) {
  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(uri);
    console.log('✅ Terhubung ke MongoDB:', mongoose.connection.name);
  } catch (err) {
    console.error('❌ Gagal terhubung ke MongoDB:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
