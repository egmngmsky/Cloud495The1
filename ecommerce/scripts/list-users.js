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

async function listUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB bağlantısı başarılı!');

    const users = await User.find({}, '-password');
    console.log('\nKullanıcılar:');
    users.forEach(user => {
      console.log(`\nID: ${user._id}`);
      console.log(`İsim: ${user.name}`);
      console.log(`Kullanıcı adı: ${user.username}`);
      console.log(`E-posta: ${user.email}`);
      console.log(`Rol: ${user.role}`);
    });

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await mongoose.disconnect();
  }
}

listUsers(); 