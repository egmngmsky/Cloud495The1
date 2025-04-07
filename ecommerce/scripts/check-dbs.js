const mongoose = require('mongoose');
require('dotenv').config();

async function checkDatabases() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB bağlantısı başarılı!');

    // Mevcut veritabanlarını listele
    const admin = mongoose.connection.db.admin();
    const dbs = await admin.listDatabases();
    
    console.log('\nMevcut veritabanları:');
    dbs.databases.forEach(db => {
      console.log(`- ${db.name} (${db.sizeOnDisk} bytes)`);
    });

    // Şu anki veritabanı adını göster
    console.log(`\nŞu anki veritabanı: ${mongoose.connection.db.databaseName}`);

    // Şu anki veritabanındaki koleksiyonları listele
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nMevcut koleksiyonlar:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkDatabases(); 