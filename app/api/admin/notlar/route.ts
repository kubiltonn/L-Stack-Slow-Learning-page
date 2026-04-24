import { NextRequest, NextResponse } from 'next/server'
import { adminKontrol } from '@/lib/admin'
import { createServiceRoleClient } from '@/lib/supabase-admin'

function kelimeSay(metin: string): number {
  const temiz = metin.trim()
  if (!temiz) return 0
  return temiz.split(/\s+/).length
}

// GET — Tüm notları listele
export async function GET(request: NextRequest) {
  try {
    const { admin } = await adminKontrol()
    if (!admin) {
      return NextResponse.json({ data: null, error: 'Yetkisiz erişim.' }, { status: 403 })
    }

    const supabase = createServiceRoleClient()
    const { searchParams } = new URL(request.url)
    const paylasim = searchParams.get('paylasim')
    const sayfa = parseInt(searchParams.get('sayfa') || '1')
    const limit = 20
    const offset = (sayfa - 1) * limit

    let sorgu = supabase
      .from('notlar')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (paylasim === 'true') {
      sorgu = sorgu.eq('paylasim', true)
    } else if (paylasim === 'false') {
      sorgu = sorgu.eq('paylasim', false)
    }

    const { data: notlar, error, count } = await sorgu

    if (error) {
      return NextResponse.json({ data: null, error: 'Notlar yüklenemedi.' }, { status: 500 })
    }

    // Profil ve soru bilgilerini ayrı çek
    const kullaniciIdleri = [...new Set((notlar || []).map(n => n.kullanici_id))]
    const soruIdleri = [...new Set((notlar || []).map(n => n.soru_id))]

    const [profilSonuc, soruSonuc] = await Promise.all([
      kullaniciIdleri.length > 0
        ? supabase.from('profiller').select('id, kullanici_adi').in('id', kullaniciIdleri)
        : { data: [] },
      soruIdleri.length > 0
        ? supabase.from('sorular').select('id, soru_metni').in('id', soruIdleri)
        : { data: [] },
    ])

    const profilHaritasi = new Map(
      (profilSonuc.data || []).map((p: { id: string; kullanici_adi: string }) => [p.id, p.kullanici_adi])
    )
    const soruHaritasi = new Map(
      (soruSonuc.data || []).map((s: { id: string; soru_metni: string }) => [s.id, s.soru_metni])
    )

    const zenginNotlar = (notlar || []).map(n => ({
      ...n,
      kullanici_adi: profilHaritasi.get(n.kullanici_id) || 'Bilinmiyor',
      soru_metni: soruHaritasi.get(n.soru_id) || 'Silinmiş soru',
    }))

    return NextResponse.json({ data: zenginNotlar, count, error: null })
  } catch {
    return NextResponse.json({ data: null, error: 'Sunucu hatası.' }, { status: 500 })
  }
}

// PUT — Not güncelle
export async function PUT(request: NextRequest) {
  try {
    const { admin } = await adminKontrol()
    if (!admin) {
      return NextResponse.json({ data: null, error: 'Yetkisiz erişim.' }, { status: 403 })
    }

    const supabase = createServiceRoleClient()
    const { id, icerik, paylasim } = await request.json()

    if (!id) {
      return NextResponse.json({ data: null, error: 'Not ID gerekli.' }, { status: 400 })
    }

    const guncellenecek: Record<string, unknown> = {}

    if (icerik !== undefined) {
      if (typeof icerik !== 'string' || !icerik.trim()) {
        return NextResponse.json({ data: null, error: 'Geçersiz içerik.' }, { status: 400 })
      }
      const sayi = kelimeSay(icerik)
      if (sayi > 300) {
        return NextResponse.json({ data: null, error: 'Not en fazla 300 kelime olabilir.' }, { status: 400 })
      }
      guncellenecek.icerik = icerik.trim()
      guncellenecek.kelime_sayisi = sayi
    }

    if (paylasim !== undefined) {
      if (typeof paylasim !== 'boolean') {
        return NextResponse.json({ data: null, error: 'Geçersiz paylaşım değeri.' }, { status: 400 })
      }
      guncellenecek.paylasim = paylasim
    }

    if (Object.keys(guncellenecek).length === 0) {
      return NextResponse.json({ data: null, error: 'Güncellenecek alan yok.' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('notlar')
      .update(guncellenecek)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ data: null, error: 'Not güncellenemedi.' }, { status: 500 })
    }

    return NextResponse.json({ data, error: null })
  } catch {
    return NextResponse.json({ data: null, error: 'Sunucu hatası.' }, { status: 500 })
  }
}

// DELETE — Not sil
export async function DELETE(request: NextRequest) {
  try {
    const { admin } = await adminKontrol()
    if (!admin) {
      return NextResponse.json({ data: null, error: 'Yetkisiz erişim.' }, { status: 403 })
    }

    const supabase = createServiceRoleClient()
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ data: null, error: 'Not ID gerekli.' }, { status: 400 })
    }

    const { error } = await supabase
      .from('notlar')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ data: null, error: 'Not silinemedi.' }, { status: 500 })
    }

    return NextResponse.json({ data: { silindi: true }, error: null })
  } catch {
    return NextResponse.json({ data: null, error: 'Sunucu hatası.' }, { status: 500 })
  }
}
