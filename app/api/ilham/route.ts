import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

// POST — İlham ver (toggle: varsa sil, yoksa ekle)
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
    const { not_id } = body

    if (!not_id) {
      return NextResponse.json(
        { data: null, error: 'Not ID gerekli.' },
        { status: 400 }
      )
    }

    // Zaten ilham verilmiş mi kontrol et
    const { data: mevcut } = await supabase
      .from('ilhamlar')
      .select('id')
      .eq('kullanici_id', user.id)
      .eq('not_id', not_id)
      .single()

    if (mevcut) {
      // Geri al
      await supabase
        .from('ilhamlar')
        .delete()
        .eq('id', mevcut.id)

      return NextResponse.json({ data: { ilham: false }, error: null })
    }

    // İlham ver
    const { error } = await supabase
      .from('ilhamlar')
      .insert({ kullanici_id: user.id, not_id })

    if (error) {
      return NextResponse.json(
        { data: null, error: 'İlham kaydedilemedi.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: { ilham: true }, error: null }, { status: 201 })
  } catch {
    return NextResponse.json(
      { data: null, error: 'Sunucu hatası.' },
      { status: 500 }
    )
  }
}
