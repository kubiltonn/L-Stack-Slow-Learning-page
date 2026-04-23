import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

// PUT — Profil güncelle (kullanıcı adı, bio, avatar_url)
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
    const { kullanici_adi, bio, avatar_url } = body

    // Güncellenecek alanları topla
    const guncellenecek: Record<string, unknown> = {}

    // Kullanıcı adı validasyonu
    if (kullanici_adi !== undefined) {
      const ad = kullanici_adi.trim()

      if (ad.length < 3 || ad.length > 20) {
        return NextResponse.json(
          { data: null, error: 'Kullanıcı adı 3-20 karakter olmalı.' },
          { status: 400 }
        )
      }

      if (!/^[a-zA-Z0-9_]+$/.test(ad)) {
        return NextResponse.json(
          { data: null, error: 'Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir.' },
          { status: 400 }
        )
      }

      // Unique kontrolü (kendisi hariç)
      const { data: mevcut } = await supabase
        .from('profiller')
        .select('id')
        .eq('kullanici_adi', ad)
        .neq('id', user.id)
        .maybeSingle()

      if (mevcut) {
        return NextResponse.json(
          { data: null, error: 'Bu kullanıcı adı zaten kullanılıyor.' },
          { status: 409 }
        )
      }

      guncellenecek.kullanici_adi = ad
    }

    // Bio validasyonu
    if (bio !== undefined) {
      if (bio.length > 150) {
        return NextResponse.json(
          { data: null, error: 'Bio en fazla 150 karakter olabilir.' },
          { status: 400 }
        )
      }
      guncellenecek.bio = bio.trim() || null
    }

    // Avatar URL
    if (avatar_url !== undefined) {
      guncellenecek.avatar_url = avatar_url || null
    }

    if (Object.keys(guncellenecek).length === 0) {
      return NextResponse.json(
        { data: null, error: 'Güncellenecek alan bulunamadı.' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('profiller')
      .update(guncellenecek)
      .eq('id', user.id)
      .select()
      .single()

    if (error || !data) {
      return NextResponse.json(
        { data: null, error: 'Profil güncellenemedi.' },
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
