import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

// GET — Kullanıcının önerilerini getir
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

    const { data, error } = await supabase
      .from('soru_onerileri')
      .select('*')
      .eq('kullanici_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { data: null, error: 'Öneriler yüklenemedi.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data, error: null })
  } catch {
    return NextResponse.json(
      { data: null, error: 'Sunucu hatası.' },
      { status: 500 }
    )
  }
}

// POST — Yeni öneri oluştur
export async function POST(request: NextRequest) {
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
    const { soru_metni, kategori } = body

    // Validasyon
    if (!soru_metni || typeof soru_metni !== 'string') {
      return NextResponse.json(
        { data: null, error: 'Soru metni gerekli.' },
        { status: 400 }
      )
    }

    const temizMetin = soru_metni.trim()
    if (temizMetin.length < 10 || temizMetin.length > 300) {
      return NextResponse.json(
        { data: null, error: 'Soru metni 10-300 karakter arası olmalı.' },
        { status: 400 }
      )
    }

    const gecerliKategoriler = ['felsefe','bilim','sanat','teknoloji','hayat','tarih','spor','sosyal-medya','oyun','muzik','sinema','yemek','psikoloji','dogal-yasam','tartisma']
    if (!kategori || !gecerliKategoriler.includes(kategori)) {
      return NextResponse.json(
        { data: null, error: 'Geçerli bir kategori seçin.' },
        { status: 400 }
      )
    }

    // Bekleyen öneri limiti: max 3
    const { count } = await supabase
      .from('soru_onerileri')
      .select('*', { count: 'exact', head: true })
      .eq('kullanici_id', user.id)
      .eq('durum', 'beklemede')

    if ((count || 0) >= 3) {
      return NextResponse.json(
        { data: null, error: 'En fazla 3 bekleyen öneriniz olabilir.' },
        { status: 429 }
      )
    }

    const { data, error } = await supabase
      .from('soru_onerileri')
      .insert({
        kullanici_id: user.id,
        soru_metni: temizMetin,
        kategori,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { data: null, error: 'Öneri kaydedilemedi.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data, error: null }, { status: 201 })
  } catch {
    return NextResponse.json(
      { data: null, error: 'Sunucu hatası.' },
      { status: 500 }
    )
  }
}
