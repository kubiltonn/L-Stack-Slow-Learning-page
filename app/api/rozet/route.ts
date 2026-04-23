import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { seriHesapla } from '@/lib/utils'
import { kazanilacakRozetler } from '@/lib/rozet-kontrol'
import { RozetTipi } from '@/lib/types'

// GET — Kullanıcının rozetlerini getir
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { data: null, error: 'Giriş yapman gerekiyor.' },
        { status: 401 }
      )
    }

    // Tüm rozet tiplerini al
    const { data: rozetTipleri } = await supabase
      .from('rozet_tipleri')
      .select('*')
      .order('kosul_degeri')

    // Kullanıcının kazandığı rozetleri al
    const { data: kullaniciRozetler } = await supabase
      .from('kullanici_rozetler')
      .select('*')
      .eq('kullanici_id', user.id)

    return NextResponse.json({
      data: {
        rozetTipleri: rozetTipleri || [],
        kazanilanlar: kullaniciRozetler || [],
      },
      error: null,
    })
  } catch {
    return NextResponse.json(
      { data: null, error: 'Sunucu hatası.' },
      { status: 500 }
    )
  }
}

// POST — Rozet kontrolü yap ve yeni rozetleri ver
export async function POST() {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { data: null, error: 'Giriş yapman gerekiyor.' },
        { status: 401 }
      )
    }

    // İstatistikleri hesapla
    const { data: notlar } = await supabase
      .from('notlar')
      .select('kelime_sayisi, paylasim, created_at')
      .eq('kullanici_id', user.id)

    const tumNotlar = notlar || []
    const toplamNot = tumNotlar.length
    const paylasimSayisi = tumNotlar.filter(n => n.paylasim).length
    const enUzunNot = tumNotlar.reduce((max, n) => Math.max(max, n.kelime_sayisi), 0)
    const tarihler = tumNotlar.map(n => n.created_at.split('T')[0])
    const { mevcutSeri, enUzunSeri } = seriHesapla(tarihler)

    // Tüm rozet tiplerini al
    const { data: rozetTipleri } = await supabase
      .from('rozet_tipleri')
      .select('*')

    // Mevcut rozetleri al
    const { data: mevcutRozetler } = await supabase
      .from('kullanici_rozetler')
      .select('rozet_id')
      .eq('kullanici_id', user.id)

    const mevcutRozetIdler = (mevcutRozetler || []).map(r => r.rozet_id)

    // Yeni kazanılacak rozetleri hesapla
    const yeniRozetler = kazanilacakRozetler(
      (rozetTipleri || []) as RozetTipi[],
      mevcutRozetIdler,
      { toplamNot, mevcutSeri, enUzunSeri, paylasimSayisi, enUzunNot }
    )

    // Yeni rozetleri kaydet
    if (yeniRozetler.length > 0) {
      const kayitlar = yeniRozetler.map(r => ({
        kullanici_id: user.id,
        rozet_id: r.id,
      }))
      await supabase.from('kullanici_rozetler').insert(kayitlar)
    }

    return NextResponse.json({
      data: { yeniRozetler },
      error: null,
    })
  } catch {
    return NextResponse.json(
      { data: null, error: 'Sunucu hatası.' },
      { status: 500 }
    )
  }
}
