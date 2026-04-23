'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Etiket } from '@/lib/types'
import EtiketRozeti from './EtiketRozeti'

interface AramaSonucu {
  id: string
  icerik: string
  kelime_sayisi: number
  created_at: string
  soru_metni?: string
  kategori?: string
  tarih?: string
  etiketler: Etiket[]
}

interface AramaKutusuProps {
  etiketler: Etiket[]
}

const kategoriler = [
  { value: '', label: 'Tüm kategoriler' },
  { value: 'felsefe', label: 'Felsefe' },
  { value: 'bilim', label: 'Bilim' },
  { value: 'sanat', label: 'Sanat' },
  { value: 'teknoloji', label: 'Teknoloji' },
  { value: 'hayat', label: 'Hayat' },
  { value: 'tarih', label: 'Tarih' },
  { value: 'psikoloji', label: 'Psikoloji' },
  { value: 'tartisma', label: 'Tartışma' },
]

export default function AramaKutusu({ etiketler }: AramaKutusuProps) {
  const [aramaMetni, setAramaMetni] = useState('')
  const [kategori, setKategori] = useState('')
  const [seciliEtiket, setSeciliEtiket] = useState('')
  const [sonuclar, setSonuclar] = useState<AramaSonucu[]>([])
  const [yukleniyor, setYukleniyor] = useState(false)
  const [aramaYapildi, setAramaYapildi] = useState(false)
  const [acik, setAcik] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  const aramaYap = useCallback(async (metin: string, kat: string, etiketId: string) => {
    if (!metin.trim() && !kat && !etiketId) {
      setSonuclar([])
      setAramaYapildi(false)
      return
    }

    setYukleniyor(true)
    setAramaYapildi(true)

    try {
      const params = new URLSearchParams()
      if (metin.trim()) params.set('q', metin.trim())
      if (kat) params.set('kategori', kat)
      if (etiketId) params.set('etiket', etiketId)

      const res = await fetch(`/api/arama?${params}`)
      const json = await res.json()

      if (json.data) {
        setSonuclar(json.data)
      } else {
        setSonuclar([])
      }
    } catch {
      setSonuclar([])
    } finally {
      setYukleniyor(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(() => {
      aramaYap(aramaMetni, kategori, seciliEtiket)
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [aramaMetni, kategori, seciliEtiket, aramaYap])

  function vurgula(metin: string, aranan: string): string {
    if (!aranan.trim()) return metin
    const regex = new RegExp(`(${aranan.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    return metin.replace(regex, '**$1**')
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => setAcik(!acik)}
        className="flex items-center gap-2 text-sm text-muted hover:text-body transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span>{acik ? 'Aramayı kapat' : 'Notlarında ara'}</span>
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          style={{ transform: acik ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {acik && (
        <div className="animate-scale-in space-y-3">
          <div className="flex items-center gap-2.5 border border-border rounded-lg bg-card px-3.5 py-2.5 focus-within:border-secondary focus-within:ring-1 focus-within:ring-secondary/20" style={{ transition: 'border-color 0.2s, box-shadow 0.2s' }}>
            <svg
              className="text-muted flex-shrink-0"
              width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={aramaMetni}
              onChange={(e) => setAramaMetni(e.target.value)}
              placeholder="Not veya soru ara..."
              className="w-full text-sm bg-transparent text-foreground placeholder:text-muted/50 focus:outline-none"
            />
            {yukleniyor && (
              <svg className="animate-spin h-4 w-4 text-muted flex-shrink-0" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              className="px-3 py-1.5 text-xs border border-border rounded-lg bg-card text-body focus:outline-none focus:border-secondary"
            >
              {kategoriler.map(k => (
                <option key={k.value} value={k.value}>{k.label}</option>
              ))}
            </select>

            {etiketler.length > 0 && (
              <select
                value={seciliEtiket}
                onChange={(e) => setSeciliEtiket(e.target.value)}
                className="px-3 py-1.5 text-xs border border-border rounded-lg bg-card text-body focus:outline-none focus:border-secondary"
              >
                <option value="">Tüm etiketler</option>
                {etiketler.map(e => (
                  <option key={e.id} value={e.id}>{e.ad}</option>
                ))}
              </select>
            )}
          </div>

          {aramaYapildi && (
            <div className="space-y-2">
              <p className="text-xs text-muted">
                {yukleniyor ? 'Aranıyor...' : `${sonuclar.length} sonuç bulundu`}
              </p>

              {sonuclar.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {sonuclar.map((sonuc, i) => (
                    <div
                      key={sonuc.id}
                      className="rounded-lg border border-border bg-card/50 p-3 hover:bg-card transition-colors animate-fade-in"
                      style={{ animationDelay: `${i * 40}ms`, opacity: 0 }}
                    >
                      {sonuc.soru_metni && (
                        <p className="text-xs text-secondary font-medium mb-1 line-clamp-1">
                          {sonuc.soru_metni}
                        </p>
                      )}
                      <p
                        className="text-sm text-body leading-relaxed line-clamp-2"
                        dangerouslySetInnerHTML={{
                          __html: vurgula(sonuc.icerik, aramaMetni)
                            .replace(/\*\*(.*?)\*\*/g, '<mark style="background:rgba(45,106,79,0.15);color:var(--color-primary);border-radius:2px;padding:0 2px">$1</mark>')
                        }}
                      />
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[11px] text-muted">
                          {new Date(sonuc.created_at).toLocaleDateString('tr-TR', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </span>
                        {sonuc.kategori && (
                          <span className="text-[11px] text-muted/70 px-1.5 py-0.5 rounded bg-background/80">
                            {sonuc.kategori}
                          </span>
                        )}
                        {sonuc.etiketler.map(e => (
                          <EtiketRozeti key={e.id} etiket={e} boyut="sm" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : !yukleniyor ? (
                <p className="text-sm text-muted text-center py-6">Arama kriterlerine uygun not bulunamadı.</p>
              ) : null}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
