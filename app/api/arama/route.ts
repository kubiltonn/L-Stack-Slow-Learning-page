import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

// GET — Kullanıcının notlarında arama yap
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { data: null, error: 'Giriş yapman gerekiyor.' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.trim()
    const kategori = searchParams.get('kategori')
    const etiket = searchParams.get('etiket')
    const baslangic = searchParams.get('baslangic')
    const bitis = searchParams.get('bitis')

    if (!q && !kategori && !etiket) {
      return NextResponse.json(
        { data: null, error: 'En az bir arama kriteri gerekli.' },
        { status: 400 }
      )
    }

    // Notları soru bilgisiyle birlikte getir
    let query = supabase
      .from('notlar')
      .select('*, sorular!inner(soru_metni, kategori, tarih)')
      .eq('kullanici_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    // Metin araması (not içeriği veya soru metni)
    if (q) {
      query = query.or(`icerik.ilike.%${q}%,sorular.soru_metni.ilike.%${q}%`)
    }

    // Kategori filtresi
    if (kategori) {
      query = query.eq('sorular.kategori', kategori)
    }

    // Tarih aralığı filtresi
    if (baslangic) {
      query = query.gte('created_at', `${baslangic}T00:00:00`)
    }
    if (bitis) {
      query = query.lte('created_at', `${bitis}T23:59:59`)
    }

    const { data: sonuclar, error } = await query

    if (error) {
      return NextResponse.json(
        { data: null, error: 'Arama yapılamadı.' },
        { status: 500 }
      )
    }

    // Etiket filtresi (post-filter — join yapamadığımız için)
    let filtrelenmis = sonuclar || []

    if (etiket) {
      const notIdler = filtrelenmis.map(n => n.id)
      if (notIdler.length > 0) {
        const { data: notEtiketler } = await supabase
          .from('not_etiketler')
          .select('not_id')
          .eq('etiket_id', etiket)
          .in('not_id', notIdler)

        const etiketliNotIdler = new Set((notEtiketler || []).map(ne => ne.not_id))
        filtrelenmis = filtrelenmis.filter(n => etiketliNotIdler.has(n.id))
      } else {
        filtrelenmis = []
      }
    }

    // Etiket bilgilerini ekle
    const sonucNotIdler = filtrelenmis.map(n => n.id)
    let etiketMap: Record<string, { id: string; ad: string; renk: string | null }[]> = {}

    if (sonucNotIdler.length > 0) {
      const { data: notEtiketler } = await supabase
        .from('not_etiketler')
        .select('not_id, etiket_id')
        .in('not_id', sonucNotIdler)

      if (notEtiketler && notEtiketler.length > 0) {
        const etiketIdler = [...new Set(notEtiketler.map(ne => ne.etiket_id))]
        const { data: etiketler } = await supabase
          .from('etiketler')
          .select('id, ad, renk')
          .in('id', etiketIdler)

        const etiketLookup = new Map((etiketler || []).map(e => [e.id, e]))

        for (const ne of notEtiketler) {
          const et = etiketLookup.get(ne.etiket_id)
          if (et) {
            if (!etiketMap[ne.not_id]) etiketMap[ne.not_id] = []
            etiketMap[ne.not_id].push(et)
          }
        }
      }
    }

    // Sonuçları zenginleştir
    const zenginSonuclar = filtrelenmis.map(n => ({
      id: n.id,
      icerik: n.icerik,
      kelime_sayisi: n.kelime_sayisi,
      paylasim: n.paylasim,
      created_at: n.created_at,
      soru_metni: n.sorular?.soru_metni,
      kategori: n.sorular?.kategori,
      tarih: n.sorular?.tarih,
      etiketler: etiketMap[n.id] || [],
    }))

    return NextResponse.json({ data: zenginSonuclar, error: null })
  } catch {
    return NextResponse.json(
      { data: null, error: 'Sunucu hatası.' },
      { status: 500 }
    )
  }
}
