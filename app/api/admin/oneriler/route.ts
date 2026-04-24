import { NextRequest, NextResponse } from 'next/server'
import { adminKontrol } from '@/lib/admin'

// GET — Tüm önerileri listele
export async function GET(request: NextRequest) {
  try {
    const { supabase, admin } = await adminKontrol()
    if (!admin) {
      return NextResponse.json({ data: null, error: 'Yetkisiz erişim.' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const durum = searchParams.get('durum')
    const sayfa = parseInt(searchParams.get('sayfa') || '1')
    const limit = 20
    const offset = (sayfa - 1) * limit

    let sorgu = supabase
      .from('soru_onerileri')
      .select('*, profiller(kullanici_adi)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (durum) {
      sorgu = sorgu.eq('durum', durum)
    }

    const { data, error, count } = await sorgu

    if (error) {
      // Profiller join başarısız olursa join'siz dene
      const { data: data2, error: error2, count: count2 } = await supabase
        .from('soru_onerileri')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)
        .eq('durum', durum || 'beklemede')

      if (error2) {
        return NextResponse.json({ data: null, error: 'Öneriler yüklenemedi.' }, { status: 500 })
      }

      return NextResponse.json({ data: data2, count: count2, error: null })
    }

    return NextResponse.json({ data, count, error: null })
  } catch {
    return NextResponse.json({ data: null, error: 'Sunucu hatası.' }, { status: 500 })
  }
}

// PUT — Öneriyi onayla/reddet
export async function PUT(request: NextRequest) {
  try {
    const { supabase, admin } = await adminKontrol()
    if (!admin) {
      return NextResponse.json({ data: null, error: 'Yetkisiz erişim.' }, { status: 403 })
    }

    const { id, durum, admin_notu } = await request.json()

    if (!id) {
      return NextResponse.json({ data: null, error: 'Öneri ID gerekli.' }, { status: 400 })
    }

    if (!durum || !['onaylandi', 'reddedildi'].includes(durum)) {
      return NextResponse.json({ data: null, error: 'Geçersiz durum. "onaylandi" veya "reddedildi" olmalı.' }, { status: 400 })
    }

    const guncellenecek: Record<string, string> = { durum }
    if (admin_notu) guncellenecek.admin_notu = admin_notu.trim()

    const { data, error } = await supabase
      .from('soru_onerileri')
      .update(guncellenecek)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ data: null, error: 'Öneri güncellenemedi.' }, { status: 500 })
    }

    return NextResponse.json({ data, error: null })
  } catch {
    return NextResponse.json({ data: null, error: 'Sunucu hatası.' }, { status: 500 })
  }
}
