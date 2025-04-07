const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  username: String,
  email: String,
  password: String,
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  reviews: [{
    productId: mongoose.Schema.Types.ObjectId,
    rating: Number,
    review: String,
    createdAt: Date
  }]
});

// Product Schema
const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  seller: String,
  imageUrl: String,
  category: String,
  stock: Number,
  reviews: [{
    userId: mongoose.Schema.Types.ObjectId,
    rating: Number,
    review: String,
    createdAt: Date
  }]
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

async function createTestUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB bağlantısı başarılı!');

    // Normal kullanıcı oluştur
    const userPassword = await bcrypt.hash('user123', 10);
    const user = await User.create({
      name: 'Test User',
      username: 'testuser',
      email: 'testuser@example.com',
      password: userPassword,
      role: 'user'
    });
    console.log('Normal kullanıcı oluşturuldu:', user);

    console.log('\nGiriş bilgileri:');
    console.log('User - Username: testuser, Şifre: user123');

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createTestUser(); 