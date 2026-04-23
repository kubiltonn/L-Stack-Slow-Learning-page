# L-Stack (Slow Learning)

Günde tek soru, tek not. Kişisel bilgi arşivini oluştur, toplulukla paylaş.

## Hakkında

L-Stack, yavaş öğrenme felsefesiyle tasarlanmış bir platformdur. Her gün tek bir düşündürücü soru yayınlanır. Kullanıcılar bu soruya kısa bir not yazarak kendi bilgi arşivlerini oluştururlar. Notlar varsayılan olarak özeldir, dileyen toplulukla paylaşabilir.

## Özellikler

- **Günlük Soru** — Her gün gece yarısı (UTC+3) yeni bir soru
- **Not Defteri** — Max 300 kelimelik kısa notlar, düzenleme desteği
- **Takvim Görünümü** — Hangi gün yazdığını, serilerini takip et
- **Keşfet** — Topluluk notlarını oku, ilham al
- **Rozet Sistemi** — Seri, not sayısı, paylaşım gibi başarılar
- **Etiketler** — Notlarını kategorize et, filtrele
- **Arama** — Tüm notlarında metin ve etiket bazlı arama
- **Profil & İstatistikler** — Kelime sayısı, seri, en aktif günler

## Teknolojiler

| Katman | Teknoloji |
|--------|-----------|
| Framework | Next.js 14 (App Router) |
| Veritabani | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Styling | Tailwind CSS |
| Dil | TypeScript |
| Hosting | Vercel |

## Kurulum

```bash
# Repoyu klonla
git clone https://github.com/kubiltonn/L-Stack-Slow-Learning-page.git
cd L-Stack-Slow-Learning-page

# Bağımlılıkları yükle
npm install

# Ortam değişkenlerini ayarla
cp .env.example .env.local
# .env.local dosyasını Supabase bilgilerinle doldur

# Geliştirme sunucusunu başlat
npm run dev
```

Tarayıcıda [http://localhost:3000](http://localhost:3000) adresini aç.

## Ortam Degiskenleri

`.env.local` dosyasında aşağıdaki değişkenler gerekli:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Proje Yapisi

```
app/
  page.tsx              Ana sayfa (gunun sorusu)
  gunluk/               Kisisel gunluk & takvim
  kesfet/               Topluluk notlari
  profil/               Istatistikler & profil
  oneriler/             Soru onerileri
  api/                  Backend endpoint'leri
components/             UI bileşenleri
lib/                    Yardimci fonksiyonlar & tipler
supabase/               Veritabani semasi & seed
docs/                   Proje dokumantasyonu
```

## Lisans

MIT
