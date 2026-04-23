'use client'

import { useState, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Not, NotFormState, Etiket, RozetTipi } from '@/lib/types'
import EtiketSecici from './EtiketSecici'
import RozetBildirimi from './RozetBildirimi'

interface NotEditorProps {
  soruId: string
  mevcutNot: Not | null
  girisYapildi: boolean
}

function kelimeSay(metin: string): number {
  const temiz = metin.trim()
  if (!temiz) return 0
  return temiz.split(/\s+/).length
}

const ilhamYazilari = [
  'Bu konuyu daha önce hiç düşündün mü?',
  'Günlük hayatında bir örneği var mı?',
  'Birisi sana bunu sorsa ne cevap verirdin?',
  'Bu konu hakkında fikrin son 1 yılda değişti mi?',
  'Bunu bir çocuğa nasıl anlatırdın?',
]

export default function NotEditor({ soruId, mevcutNot, girisYapildi }: NotEditorProps) {
  const [form, setForm] = useState<NotFormState>({
    icerik: mevcutNot?.icerik || '',
    paylasim: mevcutNot?.paylasim || false,
    kelimeSayisi: mevcutNot ? kelimeSay(mevcutNot.icerik) : 0,
    kaydediliyor: false,
    hata: null,
    basarili: false,
  })
  const [girisUyarisi, setGirisUyarisi] = useState(false)
  const [seciliEtiketler, setSeciliEtiketler] = useState<Etiket[]>([])
  const [yeniRozetler, setYeniRozetler] = useState<RozetTipi[]>([])

  useEffect(() => {
    if (form.basarili) {
      const timer = setTimeout(() => setForm(f => ({ ...f, basarili: false })), 3000)
      return () => clearTimeout(timer)
    }
  }, [form.basarili])

  const icerikDegisti = useCallback((yeniIcerik: string) => {
    const sayi = kelimeSay(yeniIcerik)
    setForm(f => ({
      ...f,
      icerik: yeniIcerik,
      kelimeSayisi: sayi,
      hata: null,
      basarili: false,
    }))
    if (girisUyarisi) setGirisUyarisi(false)
  }, [girisUyarisi])

  const kaydet = useCallback(async () => {
    if (!girisYapildi) {
      setGirisUyarisi(true)
      return
    }

    if (!form.icerik.trim()) {
      setForm(f => ({ ...f, hata: 'Lütfen bir şeyler yaz.' }))
      return
    }
    if (form.kelimeSayisi > 300) {
      setForm(f => ({ ...f, hata: 'Not en fazla 300 kelime olabilir.' }))
      return
    }

    setForm(f => ({ ...f, kaydediliyor: true, hata: null }))

    try {
      const yontem = mevcutNot ? 'PUT' : 'POST'
      const res = await fetch('/api/not', {
        method: yontem,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          soru_id: soruId,
          icerik: form.icerik.trim(),
          paylasim: form.paylasim,
          etiket_idler: seciliEtiketler.map(e => e.id),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setForm(f => ({ ...f, kaydediliyor: false, hata: data.error || 'Bir hata oluştu.' }))
        return
      }

      setForm(f => ({ ...f, kaydediliyor: false, basarili: true }))

      try {
        const rozetRes = await fetch('/api/rozet', { method: 'POST' })
        const rozetData = await rozetRes.json()
        if (rozetData.data?.yeniRozetler?.length > 0) {
          setYeniRozetler(rozetData.data.yeniRozetler)
        }
      } catch {
        // rozet kontrolü opsiyonel
      }
    } catch {
      setForm(f => ({ ...f, kaydediliyor: false, hata: 'Bağlantı hatası. Tekrar dene.' }))
    }
  }, [form.icerik, form.kelimeSayisi, form.paylasim, mevcutNot, soruId, girisYapildi, seciliEtiketler])

  const kelimeRenk =
    form.kelimeSayisi >= 300 ? 'text-danger' :
    form.kelimeSayisi >= 250 ? 'text-warning' :
    'text-muted'

  const limitAsildi = form.kelimeSayisi > 300
  const bos = !form.icerik.trim()

  return (
    <div className="animate-fade-in-up mt-8 space-y-4" style={{ animationDelay: '0.15s', opacity: 0 }}>
      <div
        className="relative rounded-xl border border-border bg-card overflow-hidden shadow-base"
        style={{
          transition: 'box-shadow 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <div className="h-0.5 bg-gradient-to-r from-transparent via-secondary/20 to-transparent" />

        <div className="p-5 sm:p-6">
          <textarea
            value={form.icerik}
            onChange={(e) => icerikDegisti(e.target.value)}
            placeholder="Öğrenme yoluna başla..."
            rows={6}
            disabled={form.kaydediliyor}
            className="w-full resize-none border border-border rounded-lg p-4 text-foreground bg-background/50 placeholder:text-muted/50 disabled:opacity-60"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '16px',
              lineHeight: '1.7',
            }}
          />

          <div className="mt-3 pt-3 border-t border-border/50">
            <EtiketSecici
              seciliEtiketler={seciliEtiketler}
              onChange={setSeciliEtiketler}
            />
          </div>

          <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
            {girisYapildi ? (
              <label className="flex items-center gap-2 cursor-pointer select-none group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={form.paylasim}
                    onChange={(e) => setForm(f => ({ ...f, paylasim: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 rounded-full border border-border bg-background/50 peer-checked:bg-secondary peer-checked:border-secondary transition-colors duration-200" />
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 peer-checked:translate-x-4" />
                </div>
                <span className="text-sm text-body group-hover:text-foreground transition-colors duration-200">
                  Toplulukla paylaş
                </span>
              </label>
            ) : (
              <div />
            )}

            <span
              className={`text-sm font-medium tabular-nums ${kelimeRenk}`}
              style={{
                transition: 'color 0.2s ease, transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transform: form.kelimeSayisi >= 280 ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              {form.kelimeSayisi} / 300
            </span>
          </div>
        </div>
      </div>

      {girisUyarisi && createPortal(
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
          }}
          onClick={() => setGirisUyarisi(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '380px',
              backgroundColor: 'var(--color-card)',
              borderRadius: '16px',
              padding: '32px 28px',
              textAlign: 'center' as const,
              position: 'relative',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
              animation: 'bounceIn 0.4s ease forwards',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              borderRadius: '16px 16px 0 0',
              background: 'linear-gradient(90deg, var(--color-secondary), var(--color-accent) 50%, var(--color-secondary))',
            }} />

            <button
              onClick={() => setGirisUyarisi(false)}
              aria-label="Kapat"
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                border: 'none',
                background: 'transparent',
                color: 'var(--color-muted)',
                cursor: 'pointer',
                transition: 'color 0.2s, background-color 0.2s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = 'var(--color-foreground)'
                e.currentTarget.style.backgroundColor = 'var(--color-border)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = 'var(--color-muted)'
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(45,106,79,0.08), rgba(45,106,79,0.15))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>

            <h3 style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 600,
              fontSize: '20px',
              color: 'var(--color-primary)',
              marginBottom: '8px',
              letterSpacing: '-0.01em',
            }}>
              Düşüncelerini kaydet
            </h3>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '14px',
              lineHeight: '1.6',
              color: 'var(--color-body)',
              marginBottom: '24px',
            }}>
              Yazdıklarını saklamak ve öğrenme yolculuğuna başlamak için hesabına giriş yap.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '10px' }}>
              <a
                href="/giris"
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '12px 0',
                  borderRadius: '12px',
                  backgroundColor: 'var(--color-secondary)',
                  color: '#FFFFFF',
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 500,
                  fontSize: '14px',
                  textAlign: 'center' as const,
                  textDecoration: 'none',
                  boxShadow: '0 2px 8px rgba(45,106,79,0.25)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(45,106,79,0.3)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(45,106,79,0.25)'
                }}
              >
                Giriş Yap
              </a>
              <a
                href="/kayit"
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '12px 0',
                  borderRadius: '12px',
                  border: '1.5px solid var(--color-border)',
                  backgroundColor: 'transparent',
                  color: 'var(--color-body)',
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 500,
                  fontSize: '14px',
                  textAlign: 'center' as const,
                  textDecoration: 'none',
                  transition: 'transform 0.2s, border-color 0.2s, color 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.borderColor = 'var(--color-secondary)'
                  e.currentTarget.style.color = 'var(--color-primary)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.borderColor = 'var(--color-border)'
                  e.currentTarget.style.color = 'var(--color-body)'
                }}
              >
                Hesap Oluştur
              </a>
            </div>
          </div>
        </div>,
        document.body
      )}

      {form.hata && (
        <div className="animate-slide-in-left flex items-center gap-2 px-4 py-3 rounded-lg bg-danger/5 border border-danger/10" style={{ boxShadow: '0 2px 8px rgba(220,38,38,0.06)' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" className="text-danger flex-shrink-0">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <path d="M8 4.5v4M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <p className="text-sm text-danger">{form.hata}</p>
        </div>
      )}

      {form.basarili && (
        <div className="animate-slide-in-left flex items-center gap-2 px-4 py-3 rounded-lg bg-success/5 border border-success/10" style={{ boxShadow: '0 2px 8px rgba(5,150,105,0.06)' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" className="text-success flex-shrink-0">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <path d="M5.5 8l2 2 3.5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
          <p className="text-sm text-success">
            {mevcutNot ? 'Notun güncellendi.' : 'Notun kaydedildi.'}
          </p>
        </div>
      )}

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <button
          onClick={kaydet}
          disabled={form.kaydediliyor || limitAsildi || bos}
          className="flex-shrink-0 px-6 py-3 rounded-lg text-white font-medium text-sm disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
          style={{
            backgroundColor: limitAsildi ? 'var(--color-danger)' : 'var(--color-secondary)',
            opacity: (bos && !form.kaydediliyor) ? 0.4 : limitAsildi ? 1 : 1,
            boxShadow: (form.kaydediliyor || limitAsildi || bos) ? 'none' : '0 2px 8px rgba(45,106,79,0.25)',
            transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease, background-color 0.2s ease, opacity 0.3s ease',
          }}
          onMouseOver={(e) => {
            if (!form.kaydediliyor && !limitAsildi && !bos) {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(45,106,79,0.3)'
            }
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = (form.kaydediliyor || limitAsildi || bos) ? 'none' : '0 2px 8px rgba(45,106,79,0.25)'
          }}
        >
          {form.kaydediliyor ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Kaydediliyor...
            </span>
          ) : limitAsildi ? (
            '300 kelime sınırını aştın'
          ) : mevcutNot ? (
            'Güncelle'
          ) : (
            'Kaydet'
          )}
        </button>
      </div>

      <div className="pt-3 space-y-2.5">
        {ilhamYazilari.map((yazi, i) => (
          <p
            key={i}
            className="select-none animate-fade-in"
            style={{
              color: 'var(--color-body)',
              fontFamily: 'var(--font-heading)',
              fontStyle: 'italic',
              fontSize: '15px',
              lineHeight: '1.5',
              animationDelay: `${0.3 + i * 0.1}s`,
              opacity: 0,
              paddingLeft: '14px',
              borderLeft: '2.5px solid var(--color-border)',
              transition: 'color 0.3s ease, border-color 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = 'var(--color-primary)'
              e.currentTarget.style.borderLeftColor = 'var(--color-accent)'
              e.currentTarget.style.transform = 'translateX(4px)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = 'var(--color-body)'
              e.currentTarget.style.borderLeftColor = 'var(--color-border)'
              e.currentTarget.style.transform = 'translateX(0)'
            }}
          >
            {yazi}
          </p>
        ))}
      </div>

      {yeniRozetler.length > 0 && (
        <RozetBildirimi
          rozetler={yeniRozetler}
          onKapat={() => setYeniRozetler([])}
        />
      )}
    </div>
  )
}
