# L-Stack (Learning Stack) — Claude Code Rehberi

## Proje özeti
Günde tek soru, tek konu. Kullanıcılar o günkü soruyu okur, kısa bir not yazar (max 300 kelime), yıllar içinde kişisel bir bilgi arşivi oluşur. Toplulukla paylaşım isteğe bağlıdır.

## Tech stack
- **Framework**: Next.js 14 (App Router)
- **Veritabanı + Auth**: Supabase
- **Styling**: Tailwind CSS
- **Hosting**: Vercel
- **Dil**: TypeScript

## Klasör yapısı
```
/app
  /page.tsx               → Ana sayfa (bugünün sorusu)
  /gunluk/page.tsx        → Kişisel günlük (takvim görünümü)
  /kesfet/page.tsx        → Topluluk notları
  /profil/page.tsx        → İstatistikler
  /api/
    /soru/route.ts        → Günlük soru endpoint'i
    /not/route.ts         → Not kaydetme endpoint'i
/components
  /SoruKarti.tsx
  /NotEditor.tsx
  /TakvimGorunu.tsx
  /IstatistikKarti.tsx
/lib
  /supabase.ts            → Supabase client
  /types.ts               → TypeScript tipleri
/docs
  VERITABANI.md
  OZELLIKLER.md
  TASARIM.md
```

## Geliştirme kuralları
1. Her component TypeScript ile yazılacak, `any` kullanma
2. Supabase sorguları daima `lib/supabase.ts` üzerinden geçecek
3. Form validasyonu hem client hem server tarafında yapılacak
4. Not uzunluğu max 300 kelime — her yerde aynı kural uygulanacak
5. Mobil-first tasarım, her şey önce mobilde test edilecek
6. Tüm metinler Türkçe, kod yorumları da Türkçe olabilir

## Ortam değişkenleri (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Önemli iş kuralları
- Günlük soru gece 00:00 Türkiye saatiyle değişir (UTC+3)
- Kullanıcı bir soruya sadece 1 not yazabilir, düzenleyebilir ama silemez
- "Geç yazma" penceresi: soru değiştikten sonra 24 saat içinde önceki güne yazılabilir
- Notlar varsayılan olarak özeldir; kullanıcı açıkça "paylaş" demeden toplulukta görünmez
- Kelime sayısı client'ta anlık gösterilecek, 300'ü geçince kayıt engellenir
