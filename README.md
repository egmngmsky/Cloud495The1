# Cloud495The1 - E-Ticaret Uygulaması

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

3. `.env` dosyasını düzenleyin ve gerekli ortam değişkenlerini ayarlayın (ecommerce klasöründe):
   ```
   MONGODB_URI=your_mongodb_connection_string
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
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
