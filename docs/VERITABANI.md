# Veritabanı Şeması

## Tablolar

### sorular
Günlük soruları tutan tablo.

| Kolon | Tip | Açıklama |
|-------|-----|----------|
| id | uuid (PK) | Birincil anahtar |
| tarih | date (UNIQUE) | Sorunun ait olduğu gün |
| soru_metni | text | Soru içeriği |
| kategori | text | Soru kategorisi (felsefe, bilim, sanat, teknoloji, hayat, tarih) |
| created_at | timestamptz | Oluşturulma zamanı |

### notlar
Kullanıcıların yazdığı notlar.

| Kolon | Tip | Açıklama |
|-------|-----|----------|
| id | uuid (PK) | Birincil anahtar |
| kullanici_id | uuid (FK → auth.users) | Notu yazan kullanıcı |
| soru_id | uuid (FK → sorular) | Hangi soruya yazıldı |
| icerik | text | Not içeriği (max 300 kelime) |
| kelime_sayisi | integer | Kelime sayısı |
| paylasim | boolean | Toplulukla paylaşıldı mı (varsayılan: false) |
| created_at | timestamptz | Oluşturulma zamanı |
| updated_at | timestamptz | Son güncelleme |

**Kısıt:** (kullanici_id, soru_id) çifti UNIQUE — bir kullanıcı bir soruya tek not yazar.

### profiller
Kullanıcı profil bilgileri.

| Kolon | Tip | Açıklama |
|-------|-----|----------|
| id | uuid (PK, FK → auth.users) | Kullanıcı ID |
| kullanici_adi | text (UNIQUE) | Görünen ad |
| bio | text | Kısa biyografi |
| avatar_url | text | Profil fotoğrafı URL'i |
| created_at | timestamptz | Kayıt tarihi |

## RLS Politikaları

### sorular
- **SELECT:** Herkes okuyabilir (public)

### notlar
- **SELECT (kendi):** Kullanıcı kendi notlarını görebilir
- **SELECT (paylaşılan):** paylasim = true olan notlar herkes tarafından görülebilir
- **INSERT:** Giriş yapmış kullanıcı kendi adına not oluşturabilir
- **UPDATE:** Kullanıcı sadece kendi notunu güncelleyebilir
- **DELETE:** Yok — notlar silinemez

### profiller
- **SELECT:** Herkes okuyabilir
- **INSERT:** Kullanıcı kendi profilini oluşturabilir
- **UPDATE:** Kullanıcı sadece kendi profilini güncelleyebilir

## Index'ler
- `idx_sorular_tarih` → sorular(tarih)
- `idx_notlar_kullanici` → notlar(kullanici_id)
- `idx_notlar_soru` → notlar(soru_id)
- `idx_notlar_paylasim` → notlar(paylasim) WHERE paylasim = true
- `idx_profiller_kullanici_adi` → profiller(kullanici_adi)
