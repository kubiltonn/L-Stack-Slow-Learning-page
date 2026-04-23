import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

// Kelime sayısını hesapla (server-side validasyon)
function kelimeSay(metin: string): number {
  const temiz = metin.trim()
  if (!temiz) return 0
  return temiz.split(/\s+/).length
}

// POST — Yeni not oluştur
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    // Kullanıcı doğrulaması
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { data: null, error: 'Giriş yapman gerekiyor.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { soru_id, icerik, paylasim, etiket_idler } = body

    // Validasyon
    if (!soru_id || !icerik?.trim()) {
      return NextResponse.json(
        { data: null, error: 'Soru ID ve içerik gerekli.' },
        { status: 400 }
      )
    }

    const sayi = kelimeSay(icerik)
    if (sayi > 300) {
      return NextResponse.json(
        { data: null, error: 'Not en fazla 300 kelime olabilir.' },
        { status: 400 }
      )
    }

    if (sayi < 1) {
      return NextResponse.json(
        { data: null, error: 'Lütfen bir şeyler yaz.' },
        { status: 400 }
      )
    }

    // "Geç yazma" kontrolü: sorunun tarihinden 24 saatten fazla geçmişse yazılamaz
    const { data: soru } = await supabase
      .from('sorular')
      .select('tarih')
      .eq('id', soru_id)
      .single()

    if (!soru) {
      return NextResponse.json(
        { data: null, error: 'Geçersiz soru.' },
        { status: 404 }
      )
    }

    const soruTarihi = new Date(soru.tarih + 'T00:00:00+03:00') // UTC+3
    const sonYazmaSaati = new Date(soruTarihi.getTime() + 48 * 60 * 60 * 1000) // Sorunun günü + ertesi gün (24 saat geç yazma)
    if (new Date() > sonYazmaSaati) {
      return NextResponse.json(
        { data: null, error: 'Bu sorunun yazma süresi dolmuş.' },
        { status: 403 }
      )
    }

    const { data, error } = await supabase
      .from('notlar')
      .insert({
        kullanici_id: user.id,
        soru_id,
        icerik: icerik.trim(),
        kelime_sayisi: sayi,
        paylasim: paylasim || false,
      })
      .select()
      .single()

    if (error) {
      // Unique constraint ihlali — zaten not var
      if (error.code === '23505') {
        return NextResponse.json(
          { data: null, error: 'Bu soruya zaten not yazdın. Güncellemek için PUT kullan.' },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { data: null, error: 'Not kaydedilemedi.' },
        { status: 500 }
      )
    }

    // Etiketleri kaydet (varsa)
    if (data && Array.isArray(etiket_idler) && etiket_idler.length > 0) {
      const etiketKayitlari = etiket_idler.slice(0, 3).map((etiket_id: string) => ({
        not_id: data.id,
        etiket_id,
      }))
      await supabase.from('not_etiketler').insert(etiketKayitlari)
    }

    return NextResponse.json({ data, error: null }, { status: 201 })
  } catch {
    return NextResponse.json(
      { data: null, error: 'Sunucu hatası.' },
      { status: 500 }
    )
  }
}

// PUT — Mevcut notu güncelle
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { data: null, error: 'Giriş yapman gerekiyor.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { soru_id, icerik, paylasim, etiket_idler } = body

    if (!soru_id || !icerik?.trim()) {
      return NextResponse.json(
        { data: null, error: 'Soru ID ve içerik gerekli.' },
        { status: 400 }
      )
    }

    const sayi = kelimeSay(icerik)
    if (sayi > 300) {
      return NextResponse.json(
        { data: null, error: 'Not en fazla 300 kelime olabilir.' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('notlar')
      .update({
        icerik: icerik.trim(),
        kelime_sayisi: sayi,
        paylasim: paylasim ?? false,
      })
      .eq('kullanici_id', user.id)
      .eq('soru_id', soru_id)
      .select()
      .single()

    if (error || !data) {
      return NextResponse.json(
        { data: null, error: 'Güncellenecek not bulunamadı.' },
        { status: 404 }
      )
    }

    // Etiketleri güncelle (varsa)
    if (Array.isArray(etiket_idler)) {
      // Mevcut etiketleri sil, yenilerini ekle
      await supabase.from('not_etiketler').delete().eq('not_id', data.id)
      if (etiket_idler.length > 0) {
        const etiketKayitlari = etiket_idler.slice(0, 3).map((etiket_id: string) => ({
          not_id: data.id,
          etiket_id,
        }))
        await supabase.from('not_etiketler').insert(etiketKayitlari)
      }
    }

    return NextResponse.json({ data, error: null })
  } catch {
    return NextResponse.json(
      { data: null, error: 'Sunucu hatası.' },
      { status: 500 }
    )
  }
}
