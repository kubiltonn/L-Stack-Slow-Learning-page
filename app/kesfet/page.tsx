import { createServerSupabaseClient } from '@/lib/supabase-server'
import { bugunTarih } from '@/lib/utils'
import IlhamButonu from '@/components/IlhamButonu'
import TarihFiltresi from '@/components/TarihFiltresi'

export const dynamic = 'force-dynamic'

export default async function KesfetSayfasi({
  searchParams,
}: {
  searchParams: Promise<{ tarih?: string }>
}) {
  const supabase = await createServerSupabaseClient()
  const bugun = bugunTarih()
  const params = await searchParams
  const tarih = params.tarih || bugun

  const { data: { user } } = await supabase.auth.getUser()

  const { data: soru } = await supabase
    .from('sorular')
    .select('*')
    .eq('tarih', tarih)
    .single()

  // Notları ve profilleri ayrı çek (doğrudan FK olmadığı için join çalışmayabiliyor)
  const { data: notlar, error: notlarError } = soru
    ? await supabase
        .from('notlar')
        .select('*')
        .eq('paylasim', true)
        .eq('soru_id', soru.id)
        .order('created_at', { ascending: false })
    : { data: [], error: null }

  if (notlarError) {
    console.error('Notlar yüklenemedi:', notlarError)
  }

  const paylasimlar = notlar || []

  // Profilleri ayrı çek
  const kullaniciIdleri = [...new Set(paylasimlar.map(n => n.kullanici_id))]
  const { data: profiller } = kullaniciIdleri.length > 0
    ? await supabase
        .from('profiller')
        .select('id, kullanici_adi')
        .in('id', kullaniciIdleri)
    : { data: [] }

  const profilHaritasi = new Map(
    (profiller || []).map((p: { id: string; kullanici_adi: string }) => [p.id, p.kullanici_adi])
  )

  const notIdleri = paylasimlar.map(n => n.id)

  const { data: ilhamSayilari } = notIdleri.length > 0
    ? await supabase
        .from('ilhamlar')
        .select('not_id')
        .in('not_id', notIdleri)
    : { data: [] }

  const { data: kullaniciIlhamlari } = user && notIdleri.length > 0
    ? await supabase
        .from('ilhamlar')
        .select('not_id')
        .eq('kullanici_id', user.id)
        .in('not_id', notIdleri)
    : { data: [] }

  const ilhamHaritasi = new Map<string, number>()
  ;(ilhamSayilari || []).forEach((i: { not_id: string }) => {
    ilhamHaritasi.set(i.not_id, (ilhamHaritasi.get(i.not_id) || 0) + 1)
  })

  const kullaniciIlhamSeti = new Set(
    (kullaniciIlhamlari || []).map((i: { not_id: string }) => i.not_id)
  )

  const bugunMu = tarih === bugun

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1
          className="text-2xl sm:text-3xl text-primary mb-1"
          style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, letterSpacing: '-0.02em' }}
        >
          Keşfet
        </h1>
        <p className="text-body text-sm">
          {bugunMu ? 'Bugünün sorusuna topluluğun yazdıkları' : 'Geçmiş günlerin paylaşımları'}
        </p>
      </div>

      <TarihFiltresi bugun={bugun} />

      {soru ? (
        <div
          className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-base animate-fade-in-up"
          style={{ animationDelay: '0.1s', opacity: 0 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <p className="text-xs text-muted uppercase tracking-wider">
              {bugunMu ? 'Bugünün sorusu' : 'O günün sorusu'}
            </p>
            {!bugunMu && (
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                style={{ color: 'var(--color-accent)', backgroundColor: 'rgba(212,163,115,0.1)' }}
              >
                {soru.kategori}
              </span>
            )}
          </div>
          <p
            className="text-lg sm:text-xl text-primary"
            style={{ fontFamily: 'var(--font-heading)', fontStyle: 'italic', fontWeight: 500 }}
          >
            {soru.soru_metni}
          </p>
        </div>
      ) : (
        <div
          className="rounded-xl border border-border bg-card p-5 text-center"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        >
          <p className="text-muted text-sm italic">Bu tarih için soru bulunamadı.</p>
        </div>
      )}

      {paylasimlar.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" className="text-accent">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
          </div>
          <p className="text-body mb-1" style={{ fontFamily: 'var(--font-heading)', fontSize: '18px' }}>
            Henüz kimse paylaşmamış
          </p>
          <p className="text-sm text-muted">
            {bugunMu ? 'İlk paylaşan sen ol!' : 'Bu gün için paylaşım yok.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {paylasimlar.map((not) => {
            const kullaniciAdi = profilHaritasi.get(not.kullanici_id) || null
            return (
              <div
                key={not.id}
                className="animate-fade-in-up rounded-xl border border-border bg-card p-5 shadow-base not-card-hover"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-secondary/10 flex items-center justify-center">
                      <span className="text-xs font-medium text-secondary">
                        {kullaniciAdi?.[0]?.toUpperCase() || '?'}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {kullaniciAdi || 'Anonim'}
                    </span>
                  </div>
                  <span className="text-xs text-muted tabular-nums">
                    {not.kelime_sayisi} kelime
                  </span>
                </div>
                <p className="text-body leading-relaxed text-sm mb-3">
                  {not.icerik.length > 100
                    ? not.icerik.slice(0, 100) + '...'
                    : not.icerik}
                </p>
                <IlhamButonu
                  notId={not.id}
                  ilhamSayisi={ilhamHaritasi.get(not.id) || 0}
                  ilhamVerilmis={kullaniciIlhamSeti.has(not.id)}
                  girisYapildi={!!user}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
