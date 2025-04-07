require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB bağlantısı başarılı!');
    
    // Kullanıcıları listele
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log('\nKullanıcı listesi:');
    console.log(JSON.stringify(users, null, 2));
    
  } catch (error) {
    console.error('MongoDB bağlantı hatası:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testConnection(); 