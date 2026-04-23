import { createServerSupabaseClient } from '@/lib/supabase-server'
import { Soru, Not } from '@/lib/types'
import { bugunTarih } from '@/lib/utils'
import SoruKarti from '@/components/SoruKarti'
import NotEditor from '@/components/NotEditor'

export default async function AnaSayfa() {
  const supabase = await createServerSupabaseClient()
  const tarih = bugunTarih()

  const { data: soru } = await supabase
    .from('sorular')
    .select('*')
    .eq('tarih', tarih)
    .single<Soru>()

  const { data: { user } } = await supabase.auth.getUser()

  let mevcutNot: Not | null = null
  if (user && soru) {
    const { data } = await supabase
      .from('notlar')
      .select('*')
      .eq('kullanici_id', user.id)
      .eq('soru_id', soru.id)
      .single<Not>()
    mevcutNot = data
  }

  const gosterilecekSoru: Soru = soru || {
    id: 'varsayilan',
    tarih,
    soru_metni: 'Bugün henüz bir soru eklenmedi. Yarın tekrar gel.',
    kategori: 'hayat',
    created_at: new Date().toISOString(),
  }

  return (
    <div className="space-y-2">
      <SoruKarti soru={gosterilecekSoru} />
      <NotEditor
        soruId={gosterilecekSoru.id}
        mevcutNot={mevcutNot}
        girisYapildi={!!user}
      />
    </div>
  )
}
