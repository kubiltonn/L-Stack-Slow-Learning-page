import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { bugunTarih } from '@/lib/utils'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const tarih = bugunTarih()

    const { data: soru, error } = await supabase
      .from('sorular')
      .select('*')
      .eq('tarih', tarih)
      .single()

    if (error || !soru) {
      return NextResponse.json(
        { data: null, error: 'Bugün için soru bulunamadı.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: soru, error: null })
  } catch {
    return NextResponse.json(
      { data: null, error: 'Sunucu hatası.' },
      { status: 500 }
    )
  }
}
