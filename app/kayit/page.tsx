'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { KayitFormState } from '@/lib/types'

export default function KayitSayfasi() {
  const [form, setForm] = useState<KayitFormState>({
    email: '',
    sifre: '',
    kullaniciAdi: '',
    yukleniyor: false,
    hata: null,
  })
  const [basarili, setBasarili] = useState(false)

  const kayitOl = async (e: React.FormEvent) => {
    e.preventDefault()

    // Kullanıcı adı validasyonu
    if (form.kullaniciAdi.length < 3) {
      setForm(f => ({ ...f, hata: 'Kullanıcı adı en az 3 karakter olmalı.' }))
      return
    }
    if (!/^[a-zA-Z0-9_]+$/.test(form.kullaniciAdi)) {
      setForm(f => ({ ...f, hata: 'Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir.' }))
      return
    }
    if (form.sifre.length < 6) {
      setForm(f => ({ ...f, hata: 'Şifre en az 6 karakter olmalı.' }))
      return
    }

    setForm(f => ({ ...f, yukleniyor: true, hata: null }))

    const supabase = createClient()

    // Kullanıcı adı benzersizliğini kontrol et
    const { data: mevcutProfil } = await supabase
      .from('profiller')
      .select('id')
      .eq('kullanici_adi', form.kullaniciAdi)
      .single()

    if (mevcutProfil) {
      setForm(f => ({ ...f, yukleniyor: false, hata: 'Bu kullanıcı adı zaten alınmış.' }))
      return
    }

    // Kayıt ol
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.sifre,
    })

    if (authError) {
      const turkceHata =
        authError.message.includes('already registered')
          ? 'Bu e-posta zaten kayıtlı.'
          : 'Kayıt olunamadı. Tekrar dene.'
      setForm(f => ({ ...f, yukleniyor: false, hata: turkceHata }))
      return
    }

    // Profil oluştur
    if (authData.user) {
      await supabase.from('profiller').insert({
        id: authData.user.id,
        kullanici_adi: form.kullaniciAdi,
      })
    }

    setForm(f => ({ ...f, yukleniyor: false }))
    setBasarili(true)
  }

  if (basarili) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in-up">
        <div className="w-full max-w-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
            <svg width="32" height="32" viewBox="0 0 24 24" className="text-success">
              <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
          </div>
          <h2 className="text-2xl text-primary" style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
            Kayıt başarılı!
          </h2>
          <p className="text-body text-sm">
            E-posta adresine bir doğrulama linki gönderdik. Linke tıkladıktan sonra giriş yapabilirsin.
          </p>
          <a
            href="/giris"
            className="inline-block px-6 py-3 rounded-lg text-white font-medium text-sm transition-[transform,box-shadow,opacity] duration-150"
            style={{
              backgroundColor: 'var(--color-secondary)',
              boxShadow: '0 1px 3px rgba(45,106,79,0.3)',
            }}
          >
            Giriş sayfasına git
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-sm animate-fade-in-up">
        <div className="text-center mb-8">
          <h1
            className="text-3xl text-primary mb-2"
            style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, letterSpacing: '-0.02em' }}
          >
            Yolculuğa başla
          </h1>
          <p className="text-body text-sm">
            Her gün bir soru, her gün bir düşünce
          </p>
        </div>

        <form
          onSubmit={kayitOl}
          className="rounded-xl border border-border bg-card p-6 space-y-5"
          style={{
            boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(27,67,50,0.03)',
          }}
        >
          <div className="space-y-1.5">
            <label htmlFor="kullaniciAdi" className="block text-sm font-medium text-foreground">
              Kullanıcı adı
            </label>
            <input
              id="kullaniciAdi"
              type="text"
              required
              value={form.kullaniciAdi}
              onChange={(e) => setForm(f => ({ ...f, kullaniciAdi: e.target.value }))}
              placeholder="dusunce_yazari"
              className="w-full h-12 px-4 rounded-lg border border-border bg-background/50 text-foreground placeholder:text-muted/50 focus:border-secondary focus:ring-2 focus:ring-secondary/10 focus:outline-none transition-[border-color,box-shadow] duration-200"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-medium text-foreground">
              E-posta
            </label>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="ornek@email.com"
              className="w-full h-12 px-4 rounded-lg border border-border bg-background/50 text-foreground placeholder:text-muted/50 focus:border-secondary focus:ring-2 focus:ring-secondary/10 focus:outline-none transition-[border-color,box-shadow] duration-200"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="sifre" className="block text-sm font-medium text-foreground">
              Şifre
            </label>
            <input
              id="sifre"
              type="password"
              required
              value={form.sifre}
              onChange={(e) => setForm(f => ({ ...f, sifre: e.target.value }))}
              placeholder="En az 6 karakter"
              className="w-full h-12 px-4 rounded-lg border border-border bg-background/50 text-foreground placeholder:text-muted/50 focus:border-secondary focus:ring-2 focus:ring-secondary/10 focus:outline-none transition-[border-color,box-shadow] duration-200"
            />
          </div>

          {form.hata && (
            <div className="animate-scale-in flex items-center gap-2 px-3 py-2.5 rounded-lg bg-danger/5 border border-danger/10">
              <svg width="14" height="14" viewBox="0 0 16 16" className="text-danger flex-shrink-0">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <path d="M8 4.5v4M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <p className="text-sm text-danger">{form.hata}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={form.yukleniyor}
            className="w-full py-3 rounded-lg text-white font-medium text-sm transition-[transform,box-shadow,opacity] duration-150 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
            style={{
              backgroundColor: 'var(--color-secondary)',
              boxShadow: '0 1px 3px rgba(45,106,79,0.3)',
            }}
          >
            {form.yukleniyor ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
          </button>
        </form>

        <p className="text-center text-sm text-body mt-6">
          Zaten hesabın var mı?{' '}
          <a href="/giris" className="text-secondary font-medium hover:text-primary transition-colors duration-200">
            Giriş yap
          </a>
        </p>
      </div>
    </div>
  )
}
