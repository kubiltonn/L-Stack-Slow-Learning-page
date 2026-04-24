import { NextRequest, NextResponse } from 'next/server'
import { adminKontrol } from '@/lib/admin'

const gecerliKategoriler = ['felsefe','bilim','sanat','teknoloji','hayat','tarih','spor','sosyal-medya','oyun','muzik','sinema','yemek','psikoloji','dogal-yasam','tartisma']

// GET — Tüm soruları listele
export async function GET(request: NextRequest) {
  try {
    const { supabase, admin } = await adminKontrol()
    if (!admin) {
      return NextResponse.json({ data: null, error: 'Yetkisiz erişim.' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const kategori = searchParams.get('kategori')
    const sayfa = parseInt(searchParams.get('sayfa') || '1')
    const limit = 20
    const offset = (sayfa - 1) * limit

    let sorgu = supabase
      .from('sorular')
      .select('*', { count: 'exact' })
      .order('tarih', { ascending: false })
      .range(offset, offset + limit - 1)

    if (kategori) {
      sorgu = sorgu.eq('kategori', kategori)
    }

    const { data, error, count } = await sorgu

    if (error) {
      return NextResponse.json({ data: null, error: 'Sorular yüklenemedi.' }, { status: 500 })
    }

    return NextResponse.json({ data, count, error: null })
  } catch {
    return NextResponse.json({ data: null, error: 'Sunucu hatası.' }, { status: 500 })
  }
}

// PUT — Soru güncelle
export async function PUT(request: NextRequest) {
  try {
    const { supabase, admin } = await adminKontrol()
    if (!admin) {
      return NextResponse.json({ data: null, error: 'Yetkisiz erişim.' }, { status: 403 })
    }

    const { id, soru_metni, kategori } = await request.json()

    if (!id) {
      return NextResponse.json({ data: null, error: 'Soru ID gerekli.' }, { status: 400 })
    }

    if (soru_metni && typeof soru_metni !== 'string') {
      return NextResponse.json({ data: null, error: 'Geçersiz soru metni.' }, { status: 400 })
    }

    if (kategori && !gecerliKategoriler.includes(kategori)) {
      return NextResponse.json({ data: null, error: 'Geçersiz kategori.' }, { status: 400 })
    }

    const guncellenecek: Record<string, string> = {}
    if (soru_metni) guncellenecek.soru_metni = soru_metni.trim()
    if (kategori) guncellenecek.kategori = kategori

    const { data, error } = await supabase
      .from('sorular')
      .update(guncellenecek)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ data: null, error: 'Soru güncellenemedi.' }, { status: 500 })
    }

    return NextResponse.json({ data, error: null })
  } catch {
    return NextResponse.json({ data: null, error: 'Sunucu hatası.' }, { status: 500 })
  }
}

// DELETE — Soru sil
export async function DELETE(request: NextRequest) {
  try {
    const { supabase, admin } = await adminKontrol()
    if (!admin) {
      return NextResponse.json({ data: null, error: 'Yetkisiz erişim.' }, { status: 403 })
    }

    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ data: null, error: 'Soru ID gerekli.' }, { status: 400 })
    }

    const { error } = await supabase
      .from('sorular')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ data: null, error: 'Soru silinemedi.' }, { status: 500 })
    }

    return NextResponse.json({ data: { silindi: true }, error: null })
  } catch {
    return NextResponse.json({ data: null, error: 'Sunucu hatası.' }, { status: 500 })
  }
}
