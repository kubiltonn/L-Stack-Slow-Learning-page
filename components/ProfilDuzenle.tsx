'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Profil, ProfilFormState } from '@/lib/types'

interface ProfilDuzenleProps {
  profil: Profil
  email: string
  katilimSuresi: string
}

export default function ProfilDuzenle({ profil, email, katilimSuresi }: ProfilDuzenleProps) {
  const router = useRouter()
  const supabase = createClient()
  const dosyaInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<ProfilFormState>({
    kullaniciAdi: profil.kullanici_adi,
    bio: profil.bio || '',
    avatarUrl: profil.avatar_url,
    kaydediliyor: false,
    hata: null,
    basarili: false,
  })

  const [duzenleMode, setDuzenleMode] = useState<'isim' | 'bio' | null>(null)
  const [avatarYukleniyor, setAvatarYukleniyor] = useState(false)
  const [cikisYapiliyor, setCikisYapiliyor] = useState(false)

  useEffect(() => {
    setForm(f => ({
      ...f,
      kullaniciAdi: profil.kullanici_adi,
      bio: profil.bio || '',
      avatarUrl: profil.avatar_url,
    }))
  }, [profil.kullanici_adi, profil.bio, profil.avatar_url])

  useEffect(() => {
    if (form.basarili) {
      const timer = setTimeout(() => setForm(f => ({ ...f, basarili: false })), 3000)
      return () => clearTimeout(timer)
    }
  }, [form.basarili])

  useEffect(() => {
    if (form.hata) {
      const timer = setTimeout(() => setForm(f => ({ ...f, hata: null })), 4000)
      return () => clearTimeout(timer)
    }
  }, [form.hata])

  const profilKaydet = useCallback(async (alan: Record<string, unknown>) => {
    setForm(f => ({ ...f, kaydediliyor: true, hata: null, basarili: false }))

    try {
      const res = await fetch('/api/profil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alan),
      })
      const data = await res.json()

      if (!res.ok) {
        setForm(f => ({ ...f, kaydediliyor: false, hata: data.error || 'Bir hata oluştu.' }))
        return false
      }

      setForm(f => ({ ...f, kaydediliyor: false, basarili: true }))
      setDuzenleMode(null)
      router.refresh()
      return true
    } catch {
      setForm(f => ({ ...f, kaydediliyor: false, hata: 'Bağlantı hatası.' }))
      return false
    }
  }, [router])

  const isimKaydet = useCallback(() => {
    profilKaydet({ kullanici_adi: form.kullaniciAdi })
  }, [form.kullaniciAdi, profilKaydet])

  const bioKaydet = useCallback(() => {
    profilKaydet({ bio: form.bio })
  }, [form.bio, profilKaydet])

  const avatarYukle = useCallback(async (dosya: File) => {
    if (dosya.size > 2 * 1024 * 1024) {
      setForm(f => ({ ...f, hata: 'Dosya boyutu en fazla 2MB olabilir.' }))
      return
    }

    const gecerliFormatlar = ['image/jpeg', 'image/png', 'image/webp']
    if (!gecerliFormatlar.includes(dosya.type)) {
      setForm(f => ({ ...f, hata: 'Sadece JPG, PNG veya WebP formatı desteklenir.' }))
      return
    }

    setAvatarYukleniyor(true)
    setForm(f => ({ ...f, hata: null }))

    try {
      const uzanti = dosya.name.split('.').pop() || 'jpg'
      const dosyaAdi = `${profil.id}/avatar.${uzanti}`

      await supabase.storage.from('avatars').remove([dosyaAdi])

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(dosyaAdi, dosya, { upsert: true })

      if (uploadError) {
        setForm(f => ({ ...f, hata: 'Fotoğraf yüklenemedi.' }))
        setAvatarYukleniyor(false)
        return
      }

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(dosyaAdi)

      const avatarUrlYeni = `${urlData.publicUrl}?t=${Date.now()}`
      const basarili = await profilKaydet({ avatar_url: avatarUrlYeni })

      if (basarili) {
        setForm(f => ({ ...f, avatarUrl: avatarUrlYeni }))
      }
    } catch {
      setForm(f => ({ ...f, hata: 'Fotoğraf yüklenirken hata oluştu.' }))
    } finally {
      setAvatarYukleniyor(false)
    }
  }, [profil.id, supabase.storage, profilKaydet])

  const cikisYap = useCallback(async () => {
    setCikisYapiliyor(true)
    await supabase.auth.signOut()
    router.push('/giris')
    router.refresh()
  }, [supabase.auth, router])

  const isimIptal = () => {
    setForm(f => ({ ...f, kullaniciAdi: profil.kullanici_adi }))
    setDuzenleMode(null)
  }

  const bioIptal = () => {
    setForm(f => ({ ...f, bio: profil.bio || '' }))
    setDuzenleMode(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-5">
        <div className="relative group flex-shrink-0">
          <button
            type="button"
            onClick={() => dosyaInputRef.current?.click()}
            disabled={avatarYukleniyor}
            className="w-[72px] h-[72px] rounded-full overflow-hidden border-2 border-border cursor-pointer relative"
            style={{ transition: 'border-color 0.2s' }}
            onMouseOver={(e) => (e.currentTarget.style.borderColor = 'var(--color-secondary)')}
            onMouseOut={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
          >
            {form.avatarUrl ? (
              <img
                src={form.avatarUrl}
                alt={form.kullaniciAdi}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-secondary/10 flex items-center justify-center">
                <span className="text-2xl font-semibold text-secondary">
                  {form.kullaniciAdi[0]?.toUpperCase() || '?'}
                </span>
              </div>
            )}

            <div
              className="absolute inset-0 items-center justify-center rounded-full opacity-0 group-hover:opacity-100 hidden sm:flex"
              style={{
                backgroundColor: 'rgba(0,0,0,0.4)',
                transition: 'opacity 0.2s',
              }}
            >
              {avatarYukleniyor ? (
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              )}
            </div>

            <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-secondary flex items-center justify-center shadow-sm sm:hidden">
              {avatarYukleniyor ? (
                <svg className="animate-spin h-3 w-3 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              )}
            </div>
          </button>

          <input
            ref={dosyaInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const dosya = e.target.files?.[0]
              if (dosya) avatarYukle(dosya)
              e.target.value = ''
            }}
          />
        </div>

        <div className="flex-1 min-w-0 pt-1">
          {duzenleMode === 'isim' ? (
            <div className="flex items-center gap-2 mb-1">
              <input
                type="text"
                value={form.kullaniciAdi}
                onChange={(e) => setForm(f => ({ ...f, kullaniciAdi: e.target.value }))}
                className="text-xl text-primary font-semibold bg-transparent border-b-2 border-secondary outline-none w-full max-w-[200px]"
                style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}
                autoFocus
                maxLength={20}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') isimKaydet()
                  if (e.key === 'Escape') isimIptal()
                }}
              />
              <button
                onClick={isimKaydet}
                disabled={form.kaydediliyor || form.kullaniciAdi.trim().length < 3}
                className="text-secondary hover:text-primary disabled:opacity-40 p-1"
                title="Kaydet"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </button>
              <button
                onClick={isimIptal}
                className="text-muted hover:text-danger p-1"
                title="İptal"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 mb-1 group/isim">
              <h1
                className="text-2xl text-primary truncate"
                style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, letterSpacing: '-0.02em' }}
              >
                {form.kullaniciAdi}
              </h1>
              <button
                onClick={() => setDuzenleMode('isim')}
                className="text-muted hover:text-secondary sm:opacity-0 sm:group-hover/isim:opacity-100 p-1"
                style={{ transition: 'opacity 0.2s, color 0.2s' }}
                title="İsmi düzenle"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                </svg>
              </button>
            </div>
          )}

          {duzenleMode === 'bio' ? (
            <div className="flex items-start gap-2">
              <textarea
                value={form.bio}
                onChange={(e) => setForm(f => ({ ...f, bio: e.target.value }))}
                className="text-sm text-body bg-transparent border border-border rounded-lg p-2 w-full resize-none outline-none focus:border-secondary"
                style={{ transition: 'border-color 0.2s' }}
                rows={2}
                maxLength={150}
                autoFocus
                placeholder="Kendinden kısaca bahset..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); bioKaydet() }
                  if (e.key === 'Escape') bioIptal()
                }}
              />
              <div className="flex flex-col gap-1 pt-1">
                <button
                  onClick={bioKaydet}
                  disabled={form.kaydediliyor}
                  className="text-secondary hover:text-primary disabled:opacity-40 p-1"
                  title="Kaydet"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </button>
                <button
                  onClick={bioIptal}
                  className="text-muted hover:text-danger p-1"
                  title="İptal"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setDuzenleMode('bio')}
              className="text-left group/bio"
            >
              <p className="text-body text-sm leading-relaxed group-hover/bio:text-secondary" style={{ transition: 'color 0.2s' }}>
                {form.bio || <span className="text-muted italic">Bio ekle...</span>}
              </p>
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          {katilimSuresi}
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          {email}
        </span>
      </div>

      {form.hata && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-danger/5 border border-danger/10 animate-fade-in">
          <svg width="16" height="16" viewBox="0 0 16 16" className="text-danger flex-shrink-0">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <path d="M8 4.5v4M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <p className="text-sm text-danger">{form.hata}</p>
        </div>
      )}

      {form.basarili && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-success/5 border border-success/10 animate-fade-in">
          <svg width="16" height="16" viewBox="0 0 16 16" className="text-success flex-shrink-0">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <path d="M5.5 8l2 2 3.5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
          <p className="text-sm text-success">Profil güncellendi.</p>
        </div>
      )}

      <div className="pt-2">
        <button
          onClick={cikisYap}
          disabled={cikisYapiliyor}
          className="flex items-center gap-2 text-sm text-muted hover:text-danger disabled:opacity-50"
          style={{ transition: 'color 0.2s' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          {cikisYapiliyor ? 'Çıkış yapılıyor...' : 'Çıkış yap'}
        </button>
      </div>
    </div>
  )
}
