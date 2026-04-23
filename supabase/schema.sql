-- L-Stack — Veritabanı Şeması
-- Supabase SQL Editor'da çalıştırılacak

-- UUID eklentisi
create extension if not exists "uuid-ossp";

-- ============================================
-- TABLOLAR
-- ============================================

-- Günlük sorular tablosu
create table sorular (
  id uuid primary key default uuid_generate_v4(),
  tarih date unique not null,
  soru_metni text not null,
  kategori text not null check (kategori in ('felsefe', 'bilim', 'sanat', 'teknoloji', 'hayat', 'tarih', 'spor', 'sosyal-medya', 'oyun', 'muzik', 'sinema', 'yemek', 'psikoloji', 'dogal-yasam', 'tartisma')),
  created_at timestamptz default now()
);

-- Kullanıcı notları tablosu
create table notlar (
  id uuid primary key default uuid_generate_v4(),
  kullanici_id uuid references auth.users(id) on delete cascade not null,
  soru_id uuid references sorular(id) on delete cascade not null,
  icerik text not null,
  kelime_sayisi integer not null check (kelime_sayisi between 1 and 300),
  paylasim boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  -- Bir kullanıcı bir soruya sadece bir not yazabilir
  unique (kullanici_id, soru_id)
);

-- Kullanıcı profilleri tablosu
create table profiller (
  id uuid primary key references auth.users(id) on delete cascade,
  kullanici_adi text unique not null,
  bio text,
  avatar_url text,
  created_at timestamptz default now()
);

-- ============================================
-- INDEX'LER
-- ============================================

create index idx_sorular_tarih on sorular(tarih);
create index idx_notlar_kullanici on notlar(kullanici_id);
create index idx_notlar_soru on notlar(soru_id);
create index idx_notlar_paylasim on notlar(paylasim) where paylasim = true;
create index idx_profiller_kullanici_adi on profiller(kullanici_adi);

-- ============================================
-- RLS POLİTİKALARI
-- ============================================

-- Sorular: herkes okuyabilir
alter table sorular enable row level security;

create policy "Sorular herkese açık"
  on sorular for select
  to authenticated, anon
  using (true);

-- Notlar: kendi notlarını görebilir + paylaşılan notlar herkese açık
alter table notlar enable row level security;

create policy "Kullanıcı kendi notlarını görebilir"
  on notlar for select
  to authenticated
  using (kullanici_id = auth.uid());

create policy "Paylaşılan notlar herkese açık"
  on notlar for select
  to authenticated, anon
  using (paylasim = true);

create policy "Kullanıcı not oluşturabilir"
  on notlar for insert
  to authenticated
  with check (kullanici_id = auth.uid());

create policy "Kullanıcı kendi notunu güncelleyebilir"
  on notlar for update
  to authenticated
  using (kullanici_id = auth.uid())
  with check (kullanici_id = auth.uid());

-- Silme yok — notlar silinemez

-- Profiller: herkes okuyabilir, kendi profilini yönetebilir
alter table profiller enable row level security;

create policy "Profiller herkese açık"
  on profiller for select
  to authenticated, anon
  using (true);

create policy "Kullanıcı kendi profilini oluşturabilir"
  on profiller for insert
  to authenticated
  with check (id = auth.uid());

create policy "Kullanıcı kendi profilini güncelleyebilir"
  on profiller for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- ============================================
-- İLHAMLAR TABLOSU (Keşfet sayfası beğeni sistemi)
-- ============================================

create table ilhamlar (
  id uuid primary key default uuid_generate_v4(),
  kullanici_id uuid references auth.users(id) on delete cascade not null,
  not_id uuid references notlar(id) on delete cascade not null,
  created_at timestamptz default now(),
  -- Bir kullanıcı bir nota sadece bir kez ilham verebilir
  unique (kullanici_id, not_id)
);

create index idx_ilhamlar_not on ilhamlar(not_id);

alter table ilhamlar enable row level security;

create policy "İlhamlar herkese görünür"
  on ilhamlar for select
  to authenticated, anon
  using (true);

create policy "Kullanıcı ilham verebilir"
  on ilhamlar for insert
  to authenticated
  with check (kullanici_id = auth.uid());

create policy "Kullanıcı ilhamını geri alabilir"
  on ilhamlar for delete
  to authenticated
  using (kullanici_id = auth.uid());

-- ============================================
-- updated_at otomatik güncelleme
-- ============================================

create or replace function guncelle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger notlar_updated_at
  before update on notlar
  for each row
  execute function guncelle_updated_at();

-- ============================================
-- SORU HAVUZU (otomatik günlük soru seçimi)
-- ============================================

create table soru_havuzu (
  id uuid primary key default uuid_generate_v4(),
  soru_metni text not null,
  kategori text not null check (kategori in ('felsefe', 'bilim', 'sanat', 'teknoloji', 'hayat', 'tarih', 'spor', 'sosyal-medya', 'oyun', 'muzik', 'sinema', 'yemek', 'psikoloji', 'dogal-yasam', 'tartisma')),
  kullanildi boolean default false,
  created_at timestamptz default now()
);

create index idx_soru_havuzu_kullanilmamis on soru_havuzu(kullanildi) where kullanildi = false;

-- Havuzdan rastgele bir soru seçip bugüne ata
create or replace function gunluk_soru_sec()
returns void as $$
declare
  secilen_id uuid;
  secilen_metin text;
  secilen_kategori text;
  bugun date := (now() at time zone 'Europe/Istanbul')::date;
begin
  -- Bugün zaten soru varsa çık
  if exists (select 1 from sorular where tarih = bugun) then
    return;
  end if;

  -- Havuzdan rastgele kullanılmamış soru seç
  select id, soru_metni, kategori
  into secilen_id, secilen_metin, secilen_kategori
  from soru_havuzu
  where kullanildi = false
  order by random()
  limit 1;

  -- Havuz boşsa tüm soruları sıfırla ve tekrar seç
  if secilen_id is null then
    update soru_havuzu set kullanildi = false;
    select id, soru_metni, kategori
    into secilen_id, secilen_metin, secilen_kategori
    from soru_havuzu
    where kullanildi = false
    order by random()
    limit 1;
  end if;

  -- Hâlâ yoksa (havuz tamamen boş) çık
  if secilen_id is null then
    return;
  end if;

  -- Soruyu ekle ve kullanıldı olarak işaretle
  insert into sorular (tarih, soru_metni, kategori)
  values (bugun, secilen_metin, secilen_kategori);

  update soru_havuzu set kullanildi = true where id = secilen_id;
end;
$$ language plpgsql;

-- pg_cron ile her gece 21:00 UTC (00:00 Türkiye) çalıştır
-- NOT: Supabase Dashboard > Database > Extensions'dan pg_cron'u etkinleştir
-- Sonra SQL Editor'da bu satırı çalıştır:
-- select cron.schedule('gunluk-soru', '0 21 * * *', 'select gunluk_soru_sec()');

-- İlk çalıştırma: bugün için hemen soru seç
select gunluk_soru_sec();

-- ============================================
-- ETİKET SİSTEMİ
-- ============================================

-- Etiketler tablosu
create table etiketler (
  id uuid primary key default uuid_generate_v4(),
  ad text unique not null check (char_length(ad) between 2 and 20),
  renk text,
  created_at timestamptz default now()
);

-- Not-etiket ilişki tablosu (çoka-çok)
create table not_etiketler (
  not_id uuid references notlar(id) on delete cascade,
  etiket_id uuid references etiketler(id) on delete cascade,
  primary key (not_id, etiket_id)
);

create index idx_not_etiketler_not on not_etiketler(not_id);
create index idx_not_etiketler_etiket on not_etiketler(etiket_id);

-- RLS: Etiketler herkes okuyabilir, authenticated kullanıcılar oluşturabilir
alter table etiketler enable row level security;

create policy "Etiketler herkese açık"
  on etiketler for select
  to authenticated, anon
  using (true);

create policy "Kullanıcı etiket oluşturabilir"
  on etiketler for insert
  to authenticated
  with check (true);

-- RLS: Not-etiketler — notlar politikalarını takip eder
alter table not_etiketler enable row level security;

create policy "Not etiketleri herkese görünür"
  on not_etiketler for select
  to authenticated, anon
  using (true);

create policy "Kullanıcı kendi notuna etiket ekleyebilir"
  on not_etiketler for insert
  to authenticated
  with check (
    exists (
      select 1 from notlar
      where notlar.id = not_id
      and notlar.kullanici_id = auth.uid()
    )
  );

create policy "Kullanıcı kendi not etiketlerini silebilir"
  on not_etiketler for delete
  to authenticated
  using (
    exists (
      select 1 from notlar
      where notlar.id = not_id
      and notlar.kullanici_id = auth.uid()
    )
  );

-- Önceden tanımlı etiketler
insert into etiketler (ad, renk) values
  ('kisisel', '#8B5CF6'),
  ('ilham-verici', '#F59E0B'),
  ('sorgulayici', '#3B82F6'),
  ('pratik', '#10B981'),
  ('felsefi', '#6366F1'),
  ('bilimsel', '#06B6D4'),
  ('yaratici', '#EC4899'),
  ('motivasyon', '#EF4444');

-- ============================================
-- ROZET/BADGE SİSTEMİ
-- ============================================

create table rozet_tipleri (
  id text primary key,
  ad text not null,
  aciklama text not null,
  ikon text not null,
  kosul_tipi text not null check (kosul_tipi in ('not_sayisi', 'seri', 'paylasim', 'kelime')),
  kosul_degeri integer not null,
  created_at timestamptz default now()
);

create table kullanici_rozetler (
  kullanici_id uuid references auth.users(id) on delete cascade,
  rozet_id text references rozet_tipleri(id),
  kazanildi_at timestamptz default now(),
  primary key (kullanici_id, rozet_id)
);

create index idx_kullanici_rozetler_kullanici on kullanici_rozetler(kullanici_id);

-- RLS
alter table rozet_tipleri enable row level security;

create policy "Rozetler herkese açık"
  on rozet_tipleri for select
  to authenticated, anon
  using (true);

alter table kullanici_rozetler enable row level security;

create policy "Kullanıcı rozetleri herkese açık"
  on kullanici_rozetler for select
  to authenticated, anon
  using (true);

create policy "Sistem rozet verebilir"
  on kullanici_rozetler for insert
  to authenticated
  with check (kullanici_id = auth.uid());

-- Rozet tanımları
insert into rozet_tipleri (id, ad, aciklama, ikon, kosul_tipi, kosul_degeri) values
  ('ilk-not', 'İlk Adım', 'İlk notunu yazdın!', '🌱', 'not_sayisi', 1),
  ('not-10', 'Düşünür', '10 not yazdın', '🧠', 'not_sayisi', 10),
  ('not-50', 'Filozof', '50 not yazdın', '📚', 'not_sayisi', 50),
  ('not-100', 'Bilge', '100 not yazdın', '🎓', 'not_sayisi', 100),
  ('seri-7', 'Haftalık', '7 gün üst üste yazdın', '🔥', 'seri', 7),
  ('seri-30', 'Aylık', '30 g��n üst üste yazdın', '⚡', 'seri', 30),
  ('seri-100', 'Yüzgüncü', '100 gün üst üste yazdın', '💎', 'seri', 100),
  ('paylasim-10', 'Toplulukçu', '10 not paylaştın', '🤝', 'paylasim', 10),
  ('kelime-uzun', 'Romancı', '280+ kelimelik not yazdın', '✍️', 'kelime', 280);

-- ============================================
-- TOPLULUKTAN SORU ÖNERİSİ
-- ============================================

create table soru_onerileri (
  id uuid primary key default uuid_generate_v4(),
  kullanici_id uuid references auth.users(id) on delete cascade not null,
  soru_metni text not null check (char_length(soru_metni) between 10 and 300),
  kategori text not null check (kategori in ('felsefe','bilim','sanat','teknoloji','hayat','tarih','spor','sosyal-medya','oyun','muzik','sinema','yemek','psikoloji','dogal-yasam','tartisma')),
  durum text not null default 'beklemede' check (durum in ('beklemede','onaylandi','reddedildi')),
  admin_notu text,
  created_at timestamptz default now()
);

create index idx_soru_onerileri_kullanici on soru_onerileri(kullanici_id);
create index idx_soru_onerileri_durum on soru_onerileri(durum);

alter table soru_onerileri enable row level security;

create policy "Kullanıcı kendi önerilerini görebilir"
  on soru_onerileri for select
  to authenticated
  using (kullanici_id = auth.uid());

create policy "Kullanıcı öneri oluşturabilir"
  on soru_onerileri for insert
  to authenticated
  with check (kullanici_id = auth.uid());

-- Onaylanan öneriler otomatik soru havuzuna eklensin
create or replace function oneri_onayla_trigger()
returns trigger as $$
begin
  if new.durum = 'onaylandi' and old.durum != 'onaylandi' then
    insert into soru_havuzu (soru_metni, kategori)
    values (new.soru_metni, new.kategori);
  end if;
  return new;
end;
$$ language plpgsql;

create trigger soru_onerisi_onay
  after update on soru_onerileri
  for each row execute function oneri_onayla_trigger();
