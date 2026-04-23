'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { AuthFormState } from '@/lib/types'

export default function GirisSayfasi() {
  const [form, setForm] = useState<AuthFormState>({
    email: '',
    sifre: '',
    yukleniyor: false,
    hata: null,
  })

  const girisYap = async (e: React.FormEvent) => {
    e.preventDefault()
    setForm(f => ({ ...f, yukleniyor: true, hata: null }))

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.sifre,
    })

    if (error) {
      const turkceHata =
        error.message === 'Invalid login credentials'
          ? 'E-posta veya şifre hatalı.'
          : error.message === 'Email not confirmed'
          ? 'E-posta adresin henüz doğrulanmadı.'
          : 'Giriş yapılamadı. Tekrar dene.'
      setForm(f => ({ ...f, yukleniyor: false, hata: turkceHata }))
      return
    }

    window.location.href = '/'
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-sm animate-fade-in-up">
        {/* Başlık */}
        <div className="text-center mb-8">
          <h1
            className="text-3xl text-primary mb-2"
            style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, letterSpacing: '-0.02em' }}
          >
            Tekrar hoş geldin
          </h1>
          <p className="text-body text-sm">
            Düşüncelerini yazmaya devam et
          </p>
        </div>

        {/* Form kartı */}
        <form
          onSubmit={girisYap}
          className="rounded-xl border border-border bg-card p-6 space-y-5"
          style={{
            boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(27,67,50,0.03)',
          }}
        >
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
              placeholder="********"
              className="w-full h-12 px-4 rounded-lg border border-border bg-background/50 text-foreground placeholder:text-muted/50 focus:border-secondary focus:ring-2 focus:ring-secondary/10 focus:outline-none transition-[border-color,box-shadow] duration-200"
            />
            <div className="flex justify-end">
              <a href="/sifre-sifirla" className="text-xs text-muted hover:text-secondary transition-colors duration-200">
                Şifreni mi unuttun?
              </a>
            </div>
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
            {form.yukleniyor ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        {/* Kayıt linki */}
        <p className="text-center text-sm text-body mt-6">
          Hesabın yok mu?{' '}
          <a href="/kayit" className="text-secondary font-medium hover:text-primary transition-colors duration-200">
            Kayıt ol
          </a>
        </p>
      </div>
    </div>
  )
}
