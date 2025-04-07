import mongoose from 'mongoose';
import { connectDB } from './db';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// .env dosyasını yükle
dotenv.config({ path: '.env' });

// Şema tanımlamaları
const userSchema = new mongoose.Schema({
  name: String,
  username: String,
  email: String,
  password: String,
  role: String,
  reviews: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
    },
    rating: Number,
    review: String,
    createdAt: Date
  }]
});

const itemSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  image: String,
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  batteryLife: String,
  age: Number,
  size: String,
  material: String,
}, {
  timestamps: true
});

// User ve Item modelleri oluştur
const User = mongoose.models.User || mongoose.model('User', userSchema);
const Item = mongoose.models.Item || mongoose.model('Item', itemSchema);

async function seedData() {
  try {
    // Veritabanına bağlan
    await connectDB();
    console.log('MongoDB bağlantısı başarılı!');

    // Mevcut verileri temizle
    await User.deleteMany({});
    await Item.deleteMany({});
    console.log('Mevcut veriler temizlendi');

    // Admin ve test kullanıcıları oluştur
    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    const admin = await User.create({
      name: 'Admin User',
      username: 'admin',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'admin'
    });

    const user = await User.create({
      name: 'Test User',
      username: 'testuser',
      email: 'user@example.com',
      password: userPassword,
      role: 'user'
    });

    console.log('Kullanıcılar oluşturuldu:', { admin: admin._id, user: user._id });

    // Test ürünleri oluştur
    const items = [
      {
        name: 'Garmin Forerunner 945',
        description: 'GPS koşu saati, müzik çalma, ödeme ve daha fazla özellik',
        price: 499.99,
        stock: 10,
        category: 'GPS Sport Watches',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop',
        seller: admin._id,
        batteryLife: '2 hafta'
      },
      {
        name: 'Antika Ahşap Sandalye',
        description: '1920\'lerden kalma antika meşe sandalye',
        price: 349.99,
        stock: 1,
        category: 'Antique Furniture',
        image: 'https://images.unsplash.com/photo-1550226891-ef816aed4a98?q=80&w=1000&auto=format&fit=crop',
        seller: admin._id,
        age: 100,
        material: 'Meşe'
      },
      {
        name: 'The Beatles - Abbey Road',
        description: 'Orijinal baskı, mükemmel durumda',
        price: 129.99,
        stock: 5,
        category: 'Vinyls',
        image: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?q=80&w=1000&auto=format&fit=crop',
        seller: admin._id,
        age: 50
      },
      {
        name: 'Nike ZoomX Vaporfly',
        description: 'Yüksek performanslı koşu ayakkabısı',
        price: 249.99,
        stock: 8,
        category: 'Running Shoes',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop',
        seller: user._id,
        size: '43',
        material: 'Sentetik'
      }
    ];

    const createdItems = await Item.insertMany(items);
    console.log(`${createdItems.length} ürün oluşturuldu`);

    console.log('\nTest verileri başarıyla oluşturuldu!');
    console.log('\nGiriş bilgileri:');
    console.log('Admin - Email: admin@example.com, Şifre: admin123');
    console.log('User - Email: user@example.com, Şifre: user123');

  } catch (error) {
    console.error('Seed işlemi sırasında hata:', error);
  } finally {
    // Bağlantıyı kapat
    await mongoose.disconnect();
    console.log('MongoDB bağlantısı kapatıldı');
  }
}

// Fonksiyonu çalıştır
seedData(); 