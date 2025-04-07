const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Ecommerce klasörünün tam yolunu oluştur
const ecommerceDir = path.join(__dirname, 'ecommerce');

// Ecommerce klasörünün var olup olmadığını kontrol et
if (!fs.existsSync(ecommerceDir)) {
  console.error('Ecommerce klasörü bulunamadı.');
  process.exit(1);
}

console.log('E-ticaret uygulaması başlatılıyor...');

try {
  // Ecommerce klasörüne geçiş yap ve uygulamayı başlat
  process.chdir(ecommerceDir);
  console.log('Konum:', process.cwd());
  console.log('npm run dev komutu çalıştırılıyor...');
  
  // npm run dev komutunu çalıştır
  execSync('npm run dev', { stdio: 'inherit' });
} catch (error) {
  console.error('Uygulama başlatılırken bir hata oluştu:', error);
  process.exit(1);
} 