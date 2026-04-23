import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

// GET — Tüm etiketleri listele
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('etiketler')
      .select('*')
      .order('ad')

    if (error) {
      return NextResponse.json(
        { data: null, error: 'Etiketler yüklenemedi.' },
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

// POST — Yeni etiket oluştur
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
    const { ad } = body

    if (!ad || typeof ad !== 'string') {
      return NextResponse.json(
        { data: null, error: 'Etiket adı gerekli.' },
        { status: 400 }
      )
    }

    const temizAd = ad.trim().toLowerCase()

    if (temizAd.length < 2 || temizAd.length > 20) {
      return NextResponse.json(
        { data: null, error: 'Etiket adı 2-20 karakter olmalı.' },
        { status: 400 }
      )
    }

    // Önce mevcut mu kontrol et
    const { data: mevcut } = await supabase
      .from('etiketler')
      .select('*')
      .eq('ad', temizAd)
      .single()

    if (mevcut) {
      return NextResponse.json({ data: mevcut, error: null })
    }

    const { data, error } = await supabase
      .from('etiketler')
      .insert({ ad: temizAd })
      .select()
      .single()

    if (error) {
      // Unique constraint — zaten var
      if (error.code === '23505') {
        const { data: varolan } = await supabase
          .from('etiketler')
          .select('*')
          .eq('ad', temizAd)
          .single()
        return NextResponse.json({ data: varolan, error: null })
      }
      return NextResponse.json(
        { data: null, error: 'Etiket oluşturulamadı.' },
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
