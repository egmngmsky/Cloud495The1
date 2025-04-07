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

async function updateUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB bağlantısı başarılı!');

    // Admin olmayan tüm kullanıcıları bul
    const users = await User.find({ username: { $ne: 'admin' } });
    
    // Her kullanıcıyı güncelle
    for (const user of users) {
      await User.updateOne(
        { _id: user._id },
        { 
          $set: { 
            role: 'user',
            email: `${user.username}@example.com`,
            name: user.username.charAt(0).toUpperCase() + user.username.slice(1) + ' User'
          } 
        }
      );
    }

    console.log(`${users.length} kullanıcı başarıyla güncellendi!`);

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await mongoose.disconnect();
  }
}

updateUsers(); 