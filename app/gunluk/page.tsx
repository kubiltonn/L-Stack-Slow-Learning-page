import { createServerSupabaseClient } from '@/lib/supabase-server'
import { Not, Etiket } from '@/lib/types'
import { seriHesapla } from '@/lib/utils'
import TakvimGorunu from '@/components/TakvimGorunu'
import IstatistikKarti from '@/components/IstatistikKarti'
import GunlukNotListesi from '@/components/GunlukNotListesi'
import AramaKutusu from '@/components/AramaKutusu'

export default async function GunlukSayfasi() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: notlar } = await supabase
    .from('notlar')
    .select('*')
    .eq('kullanici_id', user.id)
    .order('created_at', { ascending: false })

  const tumNotlar: Not[] = notlar || []

  const notIdler = tumNotlar.map(n => n.id)
  let notEtiketMap: Record<string, Etiket[]> = {}

  if (notIdler.length > 0) {
    const { data: notEtiketler } = await supabase
      .from('not_etiketler')
      .select('not_id, etiket_id')
      .in('not_id', notIdler)

    if (notEtiketler && notEtiketler.length > 0) {
      const etiketIdler = [...new Set(notEtiketler.map(ne => ne.etiket_id))]
      const { data: etiketler } = await supabase
        .from('etiketler')
        .select('*')
        .in('id', etiketIdler)

      const etiketMap = new Map((etiketler || []).map(e => [e.id, e]))

      for (const ne of notEtiketler) {
        const etiket = etiketMap.get(ne.etiket_id)
        if (etiket) {
          if (!notEtiketMap[ne.not_id]) notEtiketMap[ne.not_id] = []
          notEtiketMap[ne.not_id].push(etiket)
        }
      }
    }
  }

  const { data: tumEtiketler } = await supabase
    .from('etiketler')
    .select('*')
    .order('ad')
  const etiketListesi: Etiket[] = tumEtiketler || []

  const toplamNot = tumNotlar.length
  const tarihler = tumNotlar.map(n => n.created_at.split('T')[0])
  const { mevcutSeri, enUzunSeri } = seriHesapla(tarihler)

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1
          className="text-2xl sm:text-3xl text-primary mb-1"
          style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, letterSpacing: '-0.02em' }}
        >
          Günlüğün
        </h1>
        <p className="text-body text-sm">Yazma yolculuğunun haritası</p>
      </div>

      <AramaKutusu etiketler={etiketListesi} />

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
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
          baslik="Mevcut seri"
          deger={`${mevcutSeri} gün`}
          index={1}
          ikon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          }
        />
        <IstatistikKarti
          baslik="En uzun seri"
          deger={`${enUzunSeri} gün`}
          index={2}
          ikon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
            </svg>
          }
        />
      </div>

      <div
        className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-base animate-fade-in-up"
        style={{ animationDelay: '0.3s', opacity: 0 }}
      >
        <TakvimGorunu notlar={tumNotlar} />
      </div>

      {tumNotlar.length > 0 && (
        <GunlukNotListesi
          notlar={tumNotlar}
          notEtiketMap={notEtiketMap}
          etiketler={etiketListesi}
        />
      )}
    </div>
  )
}
