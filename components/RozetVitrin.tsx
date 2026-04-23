'use client'

import { useEffect, useState } from 'react'
import { RozetTipi, KullaniciRozet } from '@/lib/types'

export default function RozetVitrin() {
  const [rozetTipleri, setRozetTipleri] = useState<RozetTipi[]>([])
  const [kazanilanlar, setKazanilanlar] = useState<KullaniciRozet[]>([])
  const [yukleniyor, setYukleniyor] = useState(true)

  useEffect(() => {
    fetch('/api/rozet')
      .then(res => res.json())
      .then(res => {
        if (res.data) {
          setRozetTipleri(res.data.rozetTipleri)
          setKazanilanlar(res.data.kazanilanlar)
        }
      })
      .catch(() => {})
      .finally(() => setYukleniyor(false))
  }, [])

  if (yukleniyor) {
    return (
      <div className="rounded-xl border border-border bg-card p-5 shadow-base">
        <div className="h-6 w-24 bg-border/30 rounded animate-pulse mb-4" />
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 bg-border/20 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const kazanilanIdler = new Set(kazanilanlar.map(k => k.rozet_id))

  return (
    <div className="space-y-3">
      <h2
        className="text-lg text-primary"
        style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}
      >
        Rozetlerin
      </h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {rozetTipleri.map((rozet, i) => {
          const kazanildi = kazanilanIdler.has(rozet.id)
          const kazanilmaTarihi = kazanilanlar.find(k => k.rozet_id === rozet.id)?.kazanildi_at

          return (
            <div
              key={rozet.id}
              className={`relative group rounded-xl border p-3 text-center transition-all animate-fade-in ${
                kazanildi
                  ? 'border-secondary/30 bg-secondary/5 shadow-base'
                  : 'border-border bg-card/50 opacity-40 grayscale'
              }`}
              style={{ animationDelay: `${i * 50}ms`, opacity: 0 }}
              title={`${rozet.ad}: ${rozet.aciklama}`}
            >
              <div className={`text-2xl mb-1.5 ${kazanildi ? '' : 'filter saturate-0'}`}>
                {rozet.ikon}
              </div>
              <p className="text-xs font-medium text-foreground leading-tight">{rozet.ad}</p>
              <p className="text-[10px] text-muted mt-0.5 leading-tight">{rozet.aciklama}</p>
              {kazanildi && kazanilmaTarihi && (
                <p className="text-[9px] text-success mt-1">
                  {new Date(kazanilmaTarihi).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                </p>
              )}
            </div>
          )
        })}
      </div>
      <p className="text-xs text-muted">
        {kazanilanlar.length} / {rozetTipleri.length} rozet kazanıldı
      </p>
    </div>
  )
}
