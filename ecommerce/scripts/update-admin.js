const mongoose = require('mongoose');
require('dotenv').config();

const userSchema = new mongoose.Schema({
  name: String,
  username: String,
  email: String,
  role: String,
  password: String
});

const User = mongoose.model('User', userSchema);

async function updateAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB bağlantısı başarılı!');

    // Admin kullanıcısını bul ve güncelle
    const result = await User.updateOne(
      { username: 'admin' },
      { 
        $set: { 
          role: 'admin',
          name: 'Admin User',
          email: 'admin@example.com'
        } 
      }
    );

    if (result.modifiedCount > 0) {
      console.log('Admin kullanıcısı başarıyla güncellendi!');
    } else {
      console.log('Admin kullanıcısı bulunamadı veya zaten güncel.');
    }

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await mongoose.disconnect();
  }
}

updateAdmin(); 