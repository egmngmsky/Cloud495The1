const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  username: String,
  password: String,
  role: String,
  reviews: [{
    productId: mongoose.Schema.Types.ObjectId,
    rating: Number,
    review: String,
    createdAt: Date
  }]
});

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB bağlantısı başarılı!');

    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    // Admin kullanıcısı oluştur
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      username: 'admin',
      password: adminPassword,
      role: 'admin'
    });
    console.log('Admin kullanıcısı oluşturuldu:', admin);

    // Normal kullanıcı oluştur
    const user = await User.create({
      name: 'Normal User',
      email: 'user@example.com',
      username: 'user',
      password: userPassword,
      role: 'user'
    });
    console.log('Normal kullanıcı oluşturuldu:', user);

    console.log('\nGiriş bilgileri:');
    console.log('Admin - Email: admin@example.com, Şifre: admin123');
    console.log('User - Email: user@example.com, Şifre: user123');

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin(); 