'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Etiket } from '@/lib/types'
import EtiketRozeti from './EtiketRozeti'

interface EtiketSeciciProps {
  seciliEtiketler: Etiket[]
  onChange: (etiketler: Etiket[]) => void
  maksimum?: number
}

export default function EtiketSecici({ seciliEtiketler, onChange, maksimum = 3 }: EtiketSeciciProps) {
  const [tumEtiketler, setTumEtiketler] = useState<Etiket[]>([])
  const [aramaMetni, setAramaMetni] = useState('')
  const [acik, setAcik] = useState(false)
  const [yukleniyor, setYukleniyor] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setYukleniyor(true)
    fetch('/api/etiket')
      .then(res => res.json())
      .then(res => {
        if (res.data) setTumEtiketler(res.data)
      })
      .catch(() => {})
      .finally(() => setYukleniyor(false))
  }, [])

  useEffect(() => {
    function tikla(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAcik(false)
      }
    }
    document.addEventListener('mousedown', tikla)
    return () => document.removeEventListener('mousedown', tikla)
  }, [])

  const filtrelenmis = tumEtiketler.filter(e =>
    !seciliEtiketler.some(s => s.id === e.id) &&
    e.ad.toLowerCase().includes(aramaMetni.toLowerCase())
  )

  const etiketSec = useCallback((etiket: Etiket) => {
    if (seciliEtiketler.length >= maksimum) return
    onChange([...seciliEtiketler, etiket])
    setAramaMetni('')
    setAcik(false)
  }, [seciliEtiketler, maksimum, onChange])

  const etiketKaldir = useCallback((id: string) => {
    onChange(seciliEtiketler.filter(e => e.id !== id))
  }, [seciliEtiketler, onChange])

  const yeniEtiketOlustur = useCallback(async () => {
    const ad = aramaMetni.trim().toLowerCase()
    if (ad.length < 2 || ad.length > 20) return
    if (seciliEtiketler.length >= maksimum) return

    try {
      const res = await fetch('/api/etiket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ad }),
      })
      const json = await res.json()
      if (json.data) {
        setTumEtiketler(prev =>
          prev.some(e => e.id === json.data.id) ? prev : [...prev, json.data]
        )
        etiketSec(json.data)
      }
    } catch {}
  }, [aramaMetni, seciliEtiketler.length, maksimum, etiketSec])

  const klavyeBasim = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (filtrelenmis.length > 0) {
        etiketSec(filtrelenmis[0])
      } else if (aramaMetni.trim().length >= 2) {
        yeniEtiketOlustur()
      }
    }
    if (e.key === 'Escape') {
      setAcik(false)
    }
  }, [filtrelenmis, etiketSec, aramaMetni, yeniEtiketOlustur])

  const limitDoldu = seciliEtiketler.length >= maksimum

  return (
    <div ref={containerRef} className="relative">
      {seciliEtiketler.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {seciliEtiketler.map(etiket => (
            <EtiketRozeti
              key={etiket.id}
              etiket={etiket}
              onKaldir={() => etiketKaldir(etiket.id)}
              boyut="md"
            />
          ))}
        </div>
      )}

      {!limitDoldu && (
        <div className="flex items-center gap-2 border border-border rounded-lg bg-background/50 px-3 py-2 focus-within:border-secondary focus-within:ring-1 focus-within:ring-secondary/20" style={{ transition: 'border-color 0.2s, box-shadow 0.2s' }}>
          <svg
            className="text-muted flex-shrink-0"
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          >
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={aramaMetni}
            onChange={(e) => {
              setAramaMetni(e.target.value)
              setAcik(true)
            }}
            onFocus={() => setAcik(true)}
            onKeyDown={klavyeBasim}
            placeholder={yukleniyor ? 'Yükleniyor...' : `Etiket ekle (${seciliEtiketler.length}/${maksimum})`}
            disabled={yukleniyor}
            className="w-full text-sm bg-transparent text-foreground placeholder:text-muted/50 focus:outline-none disabled:opacity-50"
          />
        </div>
      )}

      {acik && !limitDoldu && (
        <div
          className="absolute z-20 w-full mt-1 max-h-48 overflow-y-auto rounded-lg border border-border bg-card shadow-elevated"
          style={{ animation: 'scaleIn 0.15s ease forwards' }}
        >
          {filtrelenmis.length > 0 ? (
            filtrelenmis.map(etiket => (
              <button
                key={etiket.id}
                type="button"
                onClick={() => etiketSec(etiket)}
                className="w-full text-left px-3 py-2 text-sm text-body hover:bg-background/80 hover:text-foreground transition-colors flex items-center gap-2"
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: etiket.renk || 'var(--color-muted)' }}
                />
                {etiket.ad}
              </button>
            ))
          ) : aramaMetni.trim().length >= 2 ? (
            <button
              type="button"
              onClick={yeniEtiketOlustur}
              className="w-full text-left px-3 py-2 text-sm text-secondary hover:bg-background/80 transition-colors flex items-center gap-2"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              &quot;{aramaMetni.trim()}&quot; etiketini oluştur
            </button>
          ) : (
            <p className="px-3 py-2 text-sm text-muted">
              {aramaMetni.length > 0 ? 'Etiket bulunamadı' : 'Etiket aramak için yaz...'}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
