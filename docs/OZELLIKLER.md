# Özellikler

## Ana Sayfa — Bugünün Sorusu
- Sayfa açılınca günün sorusu büyük ve merkezi şekilde gösterilir
- Soru kategorisi küçük bir etiket olarak görünür
- Altında not editörü yer alır
- Giriş yapmamış kullanıcılar soruyu görebilir ama not yazamaz — "Yazmak için giriş yap" mesajı

## Not Editörü
- Büyük textarea alanı, placeholder: "Düşüncelerini yaz..."
- Anlık kelime sayacı (sağ altta)
  - 0–249 kelime: normal (gri)
  - 250–299 kelime: uyarı (sarı)
  - 300 kelime: limit (kırmızı) — kayıt engellenir
- "Kaydet" butonu — yeni not oluşturur veya mevcut notu günceller
- "Paylaş" toggle'ı — notun toplulukta görünüp görünmeyeceği
- Kullanıcı daha önce yazmışsa mevcut not yüklenir, düzenleme moduna geçer
- Otomatik kaydetme yok, kullanıcı bilinçli olarak "Kaydet" demeli

## Günlük Sayfası (/gunluk)
- GitHub tarzı ısı haritası (contribution graph)
  - Son 52 hafta gösterilir (masaüstü)
  - Mobilde son 12 hafta
- Her kutu bir günü temsil eder
  - Boş: not yazılmamış (açık gri)
  - Yazılmış: kelime sayısına göre ton derinliği
- Bir güne tıklayınca o günün sorusu ve notu açılır
- Alt kısımda basit istatistikler:
  - Toplam not sayısı
  - Üst üste yazma serisi (streak)
  - En uzun seri

## Keşfet Sayfası (/kesfet) — 2. Aşama
- Bugünün sorusuna yazılmış paylaşılan notlar listelenir
- Her not kartında: kullanıcı adı, ilk 100 karakter, kelime sayısı
- "İlham aldım" butonu (beğeni gibi, ama pozitif tonda)
- Tarih filtresi ile geçmiş günlerin notlarına bakılabilir

## Profil Sayfası (/profil)
- Kullanıcı adı ve biyografi
- İstatistik kartları:
  - Toplam not sayısı
  - Yazma serisi
  - En çok yazdığı kategori
  - Ortalama kelime sayısı
- Son 5 notun kısa önizlemesi

## Auth
- Giriş: e-posta + şifre
- Kayıt: e-posta + şifre + kullanıcı adı seçimi
- Hata mesajları Türkçe
- Şifre sıfırlama (basit, Supabase built-in)
