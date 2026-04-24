'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function SifreSifirlaSayfasi() {
  const [email, setEmail] = useState('')
  const [yukleniyor, setYukleniyor] = useState(false)
  const [gonderildi, setGonderildi] = useState(false)
  const [hata, setHata] = useState<string | null>(null)

  const gonder = async (e: React.FormEvent) => {
    e.preventDefault()
    setYukleniyor(true)
    setHata(null)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    })

    if (error) {
      setHata('Bir hata oluştu. Tekrar dene.')
      setYukleniyor(false)
      return
    }

    setYukleniyor(false)
    setGonderildi(true)
  }

  if (gonderildi) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in-up">
        <div className="w-full max-w-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
            <svg width="32" height="32" viewBox="0 0 24 24" className="text-success">
              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="text-2xl text-primary" style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
            E-postanı kontrol et
          </h2>
          <p className="text-body text-sm">
            Şifre sıfırlama linki <strong>{email}</strong> adresine gönderildi.
          </p>
          <a
            href="/giris"
            className="inline-block px-6 py-3 rounded-lg text-white font-medium text-sm transition-[transform,box-shadow,opacity] duration-150"
            style={{ backgroundColor: 'var(--color-secondary)', boxShadow: '0 1px 3px rgba(45,106,79,0.3)' }}
          >
            Giriş sayfasına dön
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
            Şifreni sıfırla
          </h1>
          <p className="text-body text-sm">
            E-posta adresine sıfırlama linki göndereceğiz
          </p>
        </div>

        <form
          onSubmit={gonder}
          className="rounded-xl border border-border bg-card p-6 space-y-5"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(27,67,50,0.03)' }}
        >
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-medium text-foreground">
              E-posta
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@email.com"
              className="w-full h-12 px-4 rounded-lg border border-border bg-background/50 text-foreground placeholder:text-muted/50 focus:border-secondary focus:ring-2 focus:ring-secondary/10 focus:outline-none transition-[border-color,box-shadow] duration-200"
            />
          </div>

          {hata && (
            <div className="animate-scale-in flex items-center gap-2 px-3 py-2.5 rounded-lg bg-danger/5 border border-danger/10">
              <svg width="14" height="14" viewBox="0 0 16 16" className="text-danger flex-shrink-0">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <path d="M8 4.5v4M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <p className="text-sm text-danger">{hata}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={yukleniyor}
            className="w-full py-3 rounded-lg text-white font-medium text-sm transition-[transform,box-shadow,opacity] duration-150 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
            style={{ backgroundColor: 'var(--color-secondary)', boxShadow: '0 1px 3px rgba(45,106,79,0.3)' }}
          >
            {yukleniyor ? 'Gönderiliyor...' : 'Sıfırlama linki gönder'}
          </button>
        </form>

        <p className="text-center text-sm text-body mt-6">
          <a href="/giris" className="text-secondary font-medium hover:text-primary transition-colors duration-200">
            Giriş sayfasına dön
          </a>
        </p>
      </div>
    </div>
  )
}
