'use client'

import { useState, useCallback } from 'react'
import { SoruOnerisi } from '@/lib/types'

interface OneriFormuProps {
  onBasarili: (oneri: SoruOnerisi) => void
  bekleyenSayisi: number
}

const kategoriler = [
  { value: 'felsefe', label: 'Felsefe' },
  { value: 'bilim', label: 'Bilim' },
  { value: 'sanat', label: 'Sanat' },
  { value: 'teknoloji', label: 'Teknoloji' },
  { value: 'hayat', label: 'Hayat' },
  { value: 'tarih', label: 'Tarih' },
  { value: 'psikoloji', label: 'Psikoloji' },
  { value: 'dogal-yasam', label: 'Doğal Yaşam' },
  { value: 'tartisma', label: 'Tartışma' },
  { value: 'spor', label: 'Spor' },
  { value: 'muzik', label: 'Müzik' },
  { value: 'sinema', label: 'Sinema' },
  { value: 'yemek', label: 'Yemek' },
  { value: 'oyun', label: 'Oyun' },
  { value: 'sosyal-medya', label: 'Sosyal Medya' },
]

export default function OneriFormu({ onBasarili, bekleyenSayisi }: OneriFormuProps) {
  const [soruMetni, setSoruMetni] = useState('')
  const [kategori, setKategori] = useState('')
  const [gonderiliyor, setGonderiliyor] = useState(false)
  const [hata, setHata] = useState<string | null>(null)

  const limitDoldu = bekleyenSayisi >= 3

  const gonder = useCallback(async () => {
    const temiz = soruMetni.trim()
    if (temiz.length < 10) {
      setHata('Soru en az 10 karakter olmalı.')
      return
    }
    if (temiz.length > 300) {
      setHata('Soru en fazla 300 karakter olabilir.')
      return
    }
    if (!kategori) {
      setHata('Lütfen bir kategori seç.')
      return
    }

    setGonderiliyor(true)
    setHata(null)

    try {
      const res = await fetch('/api/oneri', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ soru_metni: temiz, kategori }),
      })

      const json = await res.json()

      if (!res.ok) {
        setHata(json.error || 'Bir hata oluştu.')
        return
      }

      setSoruMetni('')
      setKategori('')
      onBasarili(json.data)
    } catch {
      setHata('Bağlantı hatası.')
    } finally {
      setGonderiliyor(false)
    }
  }, [soruMetni, kategori, onBasarili])

  return (
    <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-base space-y-4">
      <div>
        <h2
          className="text-lg text-primary"
          style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
        >
          Soru Öner
        </h2>
        <p className="text-sm text-muted mt-1">
          Topluluk için düşündürücü bir soru öner. Onaylanan sorular havuza eklenir.
        </p>
      </div>

      {limitDoldu ? (
        <div className="px-4 py-3 rounded-lg bg-warning/5 border border-warning/10">
          <p className="text-sm text-warning">
            En fazla 3 bekleyen öneriniz olabilir. Mevcut önerileriniz değerlendirilene kadar bekleyin.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            <textarea
              value={soruMetni}
              onChange={(e) => {
                setSoruMetni(e.target.value)
                setHata(null)
              }}
              placeholder="Düşündürücü bir soru yaz... (ör: İnsanlığın en büyük icadı nedir ve neden?)"
              rows={3}
              disabled={gonderiliyor}
              maxLength={300}
              className="w-full resize-none border border-border rounded-lg p-3 text-foreground bg-background/50 placeholder:text-muted/50 text-sm disabled:opacity-60"
              style={{ fontFamily: 'var(--font-body)', lineHeight: '1.6' }}
            />
            <div className="flex items-center justify-between">
              <select
                value={kategori}
                onChange={(e) => {
                  setKategori(e.target.value)
                  setHata(null)
                }}
                disabled={gonderiliyor}
                className="px-3 py-2 text-sm border border-border rounded-lg bg-background/50 text-body focus:outline-none focus:border-secondary disabled:opacity-60"
              >
                <option value="">Kategori seç...</option>
                {kategoriler.map(k => (
                  <option key={k.value} value={k.value}>{k.label}</option>
                ))}
              </select>
              <span className="text-xs text-muted tabular-nums">{soruMetni.length} / 300</span>
            </div>
          </div>

          {hata && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-danger/5 border border-danger/10">
              <svg width="14" height="14" viewBox="0 0 16 16" className="text-danger flex-shrink-0">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <path d="M8 4.5v4M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <p className="text-xs text-danger">{hata}</p>
            </div>
          )}

          <button
            onClick={gonder}
            disabled={gonderiliyor || !soruMetni.trim() || !kategori}
            className="px-5 py-2.5 rounded-lg text-white font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
            style={{
              backgroundColor: 'var(--color-secondary)',
              boxShadow: (!gonderiliyor && soruMetni.trim() && kategori) ? '0 2px 8px rgba(45,106,79,0.25)' : 'none',
              transition: 'transform 0.2s, box-shadow 0.2s, opacity 0.2s',
            }}
          >
            {gonderiliyor ? 'Gönderiliyor...' : 'Öneri Gönder'}
          </button>
        </>
      )}
    </div>
  )
}
