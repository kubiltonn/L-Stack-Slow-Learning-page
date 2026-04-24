import { createServerSupabaseClient } from '@/lib/supabase-server'

export default async function AdminDashboard() {
  const supabase = await createServerSupabaseClient()

  const [sorular, notlar, profiller, bekleyenOneriler] = await Promise.all([
    supabase.from('sorular').select('*', { count: 'exact', head: true }),
    supabase.from('notlar').select('*', { count: 'exact', head: true }),
    supabase.from('profiller').select('*', { count: 'exact', head: true }),
    supabase.from('soru_onerileri').select('*', { count: 'exact', head: true }).eq('durum', 'beklemede'),
  ])

  const istatistikler = [
    { baslik: 'Toplam Soru', deger: sorular.count || 0 },
    { baslik: 'Toplam Not', deger: notlar.count || 0 },
    { baslik: 'Kullanıcı', deger: profiller.count || 0 },
    { baslik: 'Bekleyen Öneri', deger: bekleyenOneriler.count || 0 },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {istatistikler.map((stat) => (
        <div
          key={stat.baslik}
          className="rounded-xl border border-border bg-card p-5 shadow-base text-center"
        >
          <p
            className="text-2xl sm:text-3xl text-primary mb-1"
            style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
          >
            {stat.deger}
          </p>
          <p className="text-xs text-muted">{stat.baslik}</p>
        </div>
      ))}
    </div>
  )
}
