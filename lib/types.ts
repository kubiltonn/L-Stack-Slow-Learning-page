export interface Soru {
  id: string
  tarih: string
  soru_metni: string
  kategori: 'felsefe' | 'bilim' | 'sanat' | 'teknoloji' | 'hayat' | 'tarih' | 'spor' | 'sosyal-medya' | 'oyun' | 'muzik' | 'sinema' | 'yemek' | 'psikoloji' | 'dogal-yasam' | 'tartisma'
  created_at: string
}

export interface Not {
  id: string
  kullanici_id: string
  soru_id: string
  icerik: string
  kelime_sayisi: number
  paylasim: boolean
  created_at: string
  updated_at: string
}

export interface Profil {
  id: string
  kullanici_adi: string
  bio: string | null
  avatar_url: string | null
  created_at: string
}

export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export interface SoruResponse {
  soru: Soru
  mevcutNot: Not | null
}

export interface NotDetay extends Not {
  soru?: Soru
  profil?: Profil
}

export interface Etiket {
  id: string
  ad: string
  renk: string | null
  created_at: string
}

export interface NotEtiket {
  not_id: string
  etiket_id: string
}

export interface NotWithEtiketler extends Not {
  etiketler?: Etiket[]
}

export interface RozetTipi {
  id: string
  ad: string
  aciklama: string
  ikon: string
  kosul_tipi: 'not_sayisi' | 'seri' | 'paylasim' | 'kelime'
  kosul_degeri: number
}

export interface KullaniciRozet {
  kullanici_id: string
  rozet_id: string
  kazanildi_at: string
  rozet?: RozetTipi
}

export interface SoruOnerisi {
  id: string
  kullanici_id: string
  soru_metni: string
  kategori: string
  durum: 'beklemede' | 'onaylandi' | 'reddedildi'
  admin_notu: string | null
  created_at: string
}

export interface NotFormState {
  icerik: string
  paylasim: boolean
  kelimeSayisi: number
  kaydediliyor: boolean
  hata: string | null
  basarili: boolean
}

export interface AuthFormState {
  email: string
  sifre: string
  yukleniyor: boolean
  hata: string | null
}

export interface KayitFormState extends AuthFormState {
  kullaniciAdi: string
}

export interface ProfilFormState {
  kullaniciAdi: string
  bio: string
  avatarUrl: string | null
  kaydediliyor: boolean
  hata: string | null
  basarili: boolean
}
