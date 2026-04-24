import { NextRequest, NextResponse } from 'next/server'
import { adminKontrol } from '@/lib/admin'

const gecerliKategoriler = ['felsefe','bilim','sanat','teknoloji','hayat','tarih','spor','sosyal-medya','oyun','muzik','sinema','yemek','psikoloji','dogal-yasam','tartisma']

// GET — Soru havuzunu listele
export async function GET(request: NextRequest) {
  try {
    const { supabase, admin } = await adminKontrol()
    if (!admin) {
      return NextResponse.json({ data: null, error: 'Yetkisiz erişim.' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const kullanildi = searchParams.get('kullanildi')
    const sayfa = parseInt(searchParams.get('sayfa') || '1')
    const limit = 20
    const offset = (sayfa - 1) * limit

    let sorgu = supabase
      .from('soru_havuzu')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (kullanildi !== null) {
      sorgu = sorgu.eq('kullanildi', kullanildi === 'true')
    }

    const { data, error, count } = await sorgu

    if (error) {
      return NextResponse.json({ data: null, error: 'Havuz yüklenemedi.' }, { status: 500 })
    }

    return NextResponse.json({ data, count, error: null })
  } catch {
    return NextResponse.json({ data: null, error: 'Sunucu hatası.' }, { status: 500 })
  }
}

// POST — Havuza yeni soru ekle
export async function POST(request: NextRequest) {
  try {
    const { supabase, admin } = await adminKontrol()
    if (!admin) {
      return NextResponse.json({ data: null, error: 'Yetkisiz erişim.' }, { status: 403 })
    }

    const { soru_metni, kategori } = await request.json()

    if (!soru_metni?.trim()) {
      return NextResponse.json({ data: null, error: 'Soru metni gerekli.' }, { status: 400 })
    }

    if (!kategori || !gecerliKategoriler.includes(kategori)) {
      return NextResponse.json({ data: null, error: 'Geçerli bir kategori seçin.' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('soru_havuzu')
      .insert({ soru_metni: soru_metni.trim(), kategori })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ data: null, error: 'Soru eklenemedi.' }, { status: 500 })
    }

    return NextResponse.json({ data, error: null }, { status: 201 })
  } catch {
    return NextResponse.json({ data: null, error: 'Sunucu hatası.' }, { status: 500 })
  }
}

// PUT — Havuzdaki soruyu güncelle
export async function PUT(request: NextRequest) {
  try {
    const { supabase, admin } = await adminKontrol()
    if (!admin) {
      return NextResponse.json({ data: null, error: 'Yetkisiz erişim.' }, { status: 403 })
    }

    const { id, soru_metni, kategori, kullanildi } = await request.json()

    if (!id) {
      return NextResponse.json({ data: null, error: 'ID gerekli.' }, { status: 400 })
    }

    if (kategori && !gecerliKategoriler.includes(kategori)) {
      return NextResponse.json({ data: null, error: 'Geçersiz kategori.' }, { status: 400 })
    }

    const guncellenecek: Record<string, unknown> = {}
    if (soru_metni) guncellenecek.soru_metni = soru_metni.trim()
    if (kategori) guncellenecek.kategori = kategori
    if (typeof kullanildi === 'boolean') guncellenecek.kullanildi = kullanildi

    const { data, error } = await supabase
      .from('soru_havuzu')
      .update(guncellenecek)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ data: null, error: 'Güncellenemedi.' }, { status: 500 })
    }

    return NextResponse.json({ data, error: null })
  } catch {
    return NextResponse.json({ data: null, error: 'Sunucu hatası.' }, { status: 500 })
  }
}

// DELETE — Havuzdan soru sil
export async function DELETE(request: NextRequest) {
  try {
    const { supabase, admin } = await adminKontrol()
    if (!admin) {
      return NextResponse.json({ data: null, error: 'Yetkisiz erişim.' }, { status: 403 })
    }

    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ data: null, error: 'ID gerekli.' }, { status: 400 })
    }

    const { error } = await supabase
      .from('soru_havuzu')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ data: null, error: 'Silinemedi.' }, { status: 500 })
    }

    return NextResponse.json({ data: { silindi: true }, error: null })
  } catch {
    return NextResponse.json({ data: null, error: 'Sunucu hatası.' }, { status: 500 })
  }
}
