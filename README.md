# E-Ticaret Uygulaması

Bu proje, çeşitli ürün kategorileri ve kullanıcı yorumları içeren bir e-ticaret uygulamasıdır.

## Özellikler

- Ürün listeleme ve filtreleme
- Kullanıcı kaydı ve girişi
- Ürün incelemeleri ve puanlamaları
- Kullanıcı profili yönetimi
- Admin paneli (yöneticiler için)

## Kurulum

1. Projeyi klonlayın
2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   cd ecommerce
   npm install
   ```

3. `.env.local` dosyasını oluşturun ve gerekli ortam değişkenlerini ayarlayın (ecommerce klasöründe):
   ```
   MONGODB_URI=your_mongodb_connection_string
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

## Uygulamayı Çalıştırma

Ana dizinde aşağıdaki komutu çalıştırın:
```bash
npm run dev
```

veya
```bash
npm start
```

Uygulama http://localhost:3000 adresinde çalışacaktır.

## Kullanım

- Ana sayfada mevcut ürünleri görebilirsiniz
- Ürün detayına tıklayarak ürün hakkında daha fazla bilgi alabilirsiniz
- Oturum açarak ürünlere inceleme yazabilirsiniz
- Profil sayfanızda bilgilerinizi görüntüleyebilir ve yazdığınız incelemeleri yönetebilirsiniz

## Yeni Eklenen Özellikler

- Ana sayfaya dönüş butonu
- İnceleme silme özelliği 