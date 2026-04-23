# Tasarım Rehberi

## Konsept
Sakin, minimal, odaklanmayı teşvik eden bir tasarım. "Yavaş" kelimesi tasarıma da yansımalı — huzurlu renkler, geniş boşluklar, sade tipografi.

## Renk Paleti

### Ana Renkler
- **Birincil (Primary):** `#1B4332` — koyu orman yeşili (güven, bilgelik)
- **İkincil (Secondary):** `#2D6A4F` — orta yeşil (aksiyon butonları)
- **Vurgu (Accent):** `#D4A373` — sıcak kum rengi (vurgular, badge'ler)

### Nötr Tonlar
- **Arka plan:** `#FEFCF3` — sıcak krem
- **Kart arka planı:** `#FFFFFF`
- **Metin (başlık):** `#1A1A1A`
- **Metin (gövde):** `#4A4A4A`
- **Metin (soluk):** `#9CA3AF`
- **Kenarlık:** `#E8E4DA`

### Isı Haritası Renkleri (günlük)
- Boş gün: `#EBEDF0`
- 1–75 kelime: `#A7F3D0` (açık yeşil)
- 76–150 kelime: `#6EE7B7`
- 151–225 kelime: `#34D399`
- 226–300 kelime: `#059669` (koyu yeşil)

### Durum Renkleri
- Başarı: `#059669`
- Uyarı: `#D97706`
- Hata: `#DC2626`

## Tipografi
- **Başlıklar:** `'Playfair Display', serif` — zarif, kitap hissi
- **Gövde metni:** `'Inter', sans-serif` — temiz, okunabilir
- **Soru metni:** `'Playfair Display', serif`, 28px, italic

### Boyutlar
- H1: 32px / font-bold
- H2: 24px / font-semibold
- H3: 20px / font-medium
- Body: 16px / font-normal / line-height: 1.7
- Small: 14px / font-normal
- Caption: 12px / font-light

## Boşluklar
- Sayfa kenar boşluğu: 24px (mobil), 48px (tablet), max-w-3xl (masaüstü)
- Bileşenler arası: 24px
- Kart iç boşluğu: 24px
- Küçük elemanlar arası: 8px–12px

## Bileşen Stilleri

### Kartlar
- Arka plan: beyaz
- Kenarlık: 1px solid `#E8E4DA`
- Köşe yuvarlaklığı: 12px
- Gölge: `0 1px 3px rgba(0, 0, 0, 0.04)`

### Butonlar
- **Birincil:** bg `#2D6A4F`, text beyaz, hover `#1B4332`, rounded-lg, py-3 px-6
- **İkincil:** bg şeffaf, border `#2D6A4F`, text `#2D6A4F`, hover bg `#2D6A4F/10`
- **Tehlike:** bg `#DC2626`, text beyaz (sadece kritik aksiyonlar)
- Tüm butonlarda `transition-transform duration-150` ve active `scale-[0.98]`

### Form Elemanları
- Textarea: border `#E8E4DA`, focus border `#2D6A4F`, rounded-lg, p-4
- Input: aynı stil, h-12

## Animasyonlar
- Sayfa geçişleri: fade-in 300ms ease
- Kart hover: translateY(-2px), gölge artışı
- Buton tıklama: scale(0.98) 150ms
- Isı haritası: her kutu 50ms arayla fade-in (stagger)

## Responsive Kuralları
- Mobil (<640px): tek kolon, tam genişlik
- Tablet (640–1024px): bazı yerlerde 2 kolon
- Masaüstü (>1024px): merkezi düzen, max-w-3xl
