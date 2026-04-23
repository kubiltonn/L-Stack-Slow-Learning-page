import { createServerSupabaseClient } from '@/lib/supabase-server'
import { Not, Profil } from '@/lib/types'
import { seriHesapla } from '@/lib/utils'
import IstatistikKarti from '@/components/IstatistikKarti'
import ProfilDuzenle from '@/components/ProfilDuzenle'
import RozetVitrin from '@/components/RozetVitrin'

export default async function ProfilSayfasi() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  let { data: profil } = await supabase
    .from('profiller')
    .select('*')
    .eq('id', user.id)
    .single<Profil>()

  if (!profil) {
    const temelAd = (user.email?.split('@')[0] || 'kullanici').replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 14)
    let varsayilanAd = temelAd

    const { data: mevcut } = await supabase
      .from('profiller')
      .select('id')
      .eq('kullanici_adi', varsayilanAd)
      .maybeSingle()

    if (mevcut) {
      varsayilanAd = `${temelAd}_${Math.floor(1000 + Math.random() * 9000)}`
    }

    const { data: yeniProfil } = await supabase
      .from('profiller')
      .insert({ id: user.id, kullanici_adi: varsayilanAd })
      .select()
      .single<Profil>()
    profil = yeniProfil
  }

  const { data: notlar } = await supabase
    .from('notlar')
    .select('*, sorular(soru_metni, kategori)')
    .eq('kullanici_id', user.id)
    .order('created_at', { ascending: false })

  const tumNotlar: Not[] = notlar || []
  const toplamNot = tumNotlar.length

  const ortKelime = toplamNot > 0
    ? Math.round(tumNotlar.reduce((t, n) => t + n.kelime_sayisi, 0) / toplamNot)
    : 0

  const kategoriler: Record<string, number> = {}
  tumNotlar.forEach((not) => {
    const soru = (not as unknown as Record<string, unknown>).sorular as { kategori: string } | null
    if (soru?.kategori) {
      kategoriler[soru.kategori] = (kategoriler[soru.kategori] || 0) + 1
    }
  })
  const enCokKategori = Object.entries(kategoriler).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'

  const tarihler = tumNotlar.map(n => n.created_at.split('T')[0])
  const { mevcutSeri: seri } = seriHesapla(tarihler)

  const sonNotlar = tumNotlar.slice(0, 5)

  // hydration uyumsuzluğu olmasın diye server'da hesaplıyoruz
  const katilimSuresi = (() => {
    if (!profil) return ''
    const baslangic = new Date(profil.created_at)
    const simdi = new Date()
    const farkGun = Math.floor((simdi.getTime() - baslangic.getTime()) / (1000 * 60 * 60 * 24))
    if (farkGun < 1) return 'Bugün katıldı'
    if (farkGun < 30) return `${farkGun} gündür aramızda`
    const ay = Math.floor(farkGun / 30)
    if (ay < 12) return `${ay} aydır aramızda`
    const yil = Math.floor(ay / 12)
    const kalanAy = ay % 12
    if (kalanAy === 0) return `${yil} yıldır aramızda`
    return `${yil} yıl ${kalanAy} aydır aramızda`
  })()

  return (
    <div className="space-y-8 animate-fade-in">
      {profil && (
        <ProfilDuzenle
          profil={profil}
          email={user.email || ''}
          katilimSuresi={katilimSuresi}
        />
      )}

      <RozetVitrin />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <IstatistikKarti
          baslik="Toplam not"
          deger={toplamNot}
          index={0}
          ikon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14,2 14,8 20,8" />
            </svg>
          }
        />
        <IstatistikKarti
          baslik="Ort. kelime"
          deger={ortKelime}
          index={1}
          ikon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="17" y1="10" x2="3" y2="10" />
              <line x1="21" y1="6" x2="3" y2="6" />
              <line x1="21" y1="14" x2="3" y2="14" />
              <line x1="17" y1="18" x2="3" y2="18" />
            </svg>
          }
        />
        <IstatistikKarti
          baslik="Favori kategori"
          deger={enCokKategori}
          index={2}
          ikon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4l3 3" />
            </svg>
          }
        />
        <IstatistikKarti
          baslik="Yazma serisi"
          deger={`${seri} gün`}
          index={3}
          ikon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          }
        />
      </div>

      <div>
        <h2
          className="text-lg text-primary mb-4"
          style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
        >
          Son notların
        </h2>
        {sonNotlar.length === 0 ? (
          <p className="text-muted text-sm italic">Henüz not yazmadın.</p>
        ) : (
          <div className="space-y-3">
            {sonNotlar.map((not) => {
              const soru = (not as unknown as Record<string, unknown>).sorular as { soru_metni: string; kategori: string } | null
              return (
                <div
                  key={not.id}
                  className="rounded-xl border border-border bg-card p-4 shadow-base animate-fade-in-up not-card-hover"
                >
                  {soru && (
                    <p className="text-xs text-muted mb-1.5 line-clamp-1">{soru.soru_metni}</p>
                  )}
                  <p className="text-body text-sm leading-relaxed line-clamp-2">
                    {not.icerik}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-muted tabular-nums">
                      {not.kelime_sayisi} kelime
                    </span>
                    <span className="text-xs text-muted">·</span>
                    <span className="text-xs text-muted">
                      {new Date(not.created_at).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
